import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type FormData from 'form-data';
import { fieldValue, serializeForm } from './helpers';

/*
 * ENG-117 (Plan ENG-112, D5): upload_feature --sync and --write_tags.
 *
 * The mock server answers like the real one: for each uploaded file it
 * reports every scenario with its path (from filepaths[]), line, keyword,
 * title, the @TC key it carried and the key of the test it landed on.
 */

type Req = { url: string; data: FormData; body: string };
const sent: Req[] = [];
let respond: (req: Req, index: number) => Promise<any> = async () => ({});
let nextKey = 1000;

vi.mock('@testquality/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@testquality/sdk')>();
  return {
    ...actual,
    getResponse: vi.fn(async (_api: unknown, req: any) => {
      const body = await serializeForm(req.data);
      const entry = { url: req.url, data: req.data, body };
      sent.push(entry);
      return await respond(entry, sent.length - 1);
    }),
  };
});

const { UploadFeatureCommand } = await import('../src/UploadFeatureCommand');
const { logger } = await import('../src/Logger');

let dir: string;
let logs: string[];

beforeEach(() => {
  sent.length = 0;
  nextKey = 1000;
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tq-cli-sync-'));
  logs = [];
  vi.spyOn(console, 'log').mockImplementation((...a: unknown[]) => {
    logs.push(a.map(String).join(' '));
  });
  vi.spyOn(logger, 'error').mockImplementation(((m: unknown) => {
    logs.push(String(m));
    return true;
  }) as any);
  vi.spyOn(logger, 'warn').mockImplementation(((m: unknown) => {
    logs.push(String(m));
    return true;
  }) as any);
  respond = serverLike();
  delete process.env.CI;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.CI;
});

const upload = (files: string[], args: any = {}) =>
  (new UploadFeatureCommand() as any).uploadFeatureFiles(
    { base_dir: dir, ...args },
    files,
    1,
  );

function write(rel: string, content: string): string {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function allValues(body: string, name: string): string[] {
  const escaped = name.replace(/[[\]]/g, '\\$&');
  const re = new RegExp(`name="${escaped}"\\r\\n\\r\\n([^\\r]*)`, 'g');
  return [...body.matchAll(re)].map((m) => m[1]);
}

const SCENARIO =
  /^[ \t]*(Scenario Outline|Scenario Template|Scenario|Example):[ \t]*(.*?)[ \t]*$/;

/** Answer as the server does, reading each uploaded path back from disk. */
function serverLike(keys: Record<string, number> = {}) {
  return async (req: Req) => {
    const scenarios: any[] = [];
    for (const rel of allValues(req.body, 'filepaths[]')) {
      const lines = fs.readFileSync(path.join(dir, rel), 'utf8').split(/\r?\n/);
      const feature = lines.find((l) => l.trim().startsWith('Feature:'));
      lines.forEach((line, i) => {
        const m = SCENARIO.exec(line);
        if (!m) return;
        let tagLines = '';
        for (let j = i - 1; j >= 0 && lines[j].trim().startsWith('@'); j--) {
          tagLines += ' ' + lines[j];
        }
        const tag = /@TC-?(\d+)/i.exec(tagLines);
        const supplied = tag ? Number(tag[1]) : null;
        const key = supplied ?? keys[m[2]] ?? (keys[m[2]] = nextKey++);
        scenarios.push({
          path: rel,
          line: i + 1,
          keyword: m[1],
          feature: feature?.replace(/^\s*Feature:\s*/, ''),
          scenario: m[2],
          supplied_key: supplied,
          resolved_key: key,
          status: supplied ? 'resolved' : 'created',
        });
      });
    }
    return {
      counts: {
        created: scenarios.filter((s) => !s.supplied_key).length,
        updated: 0,
        moved: 0,
        archived: 0,
        restored: 0,
      },
      warnings: [],
      scenarios,
    };
  };
}

const sha = (s: string | Buffer) =>
  crypto.createHash('sha256').update(s).digest('hex');

describe('upload_feature: one upload path', () => {
  it('sends a single file as files[] with its relative path', async () => {
    const file = write('features/login.feature', 'Feature: Login\n');
    await upload([file]);
    expect(sent).toHaveLength(1);
    expect(allValues(sent[0].body, 'filepaths[]')).toEqual([
      'features/login.feature',
    ]);
    expect(fieldValue(sent[0].body, 'file_count')).toBe('1');
    expect(sent[0].body).toContain('name="files[]"; filename="login.feature"');
  });
});

describe('upload_feature --sync', () => {
  it('is refused without --folder_id before anything is sent', async () => {
    const file = write('a.feature', 'Feature: A\n');
    await expect(upload([file], { sync: true })).rejects.toThrow(
      /--sync needs --folder_id/,
    );
    expect(sent).toHaveLength(0);
  });

  it('sends one session across batches; only the last finalizes, with the digest of the bytes sent', async () => {
    const contents: Record<string, string> = {
      'a.feature': 'Feature: A\n\n  Scenario: One\n    When one\n',
      'b.feature': 'Feature: B\n\n  Scenario: Two\n    When two\n',
      'sub/c.feature': 'Feature: C\n\n  Scenario: Three\n    When three\n',
    };
    const files = Object.entries(contents).map(([rel, c]) => write(rel, c));
    // Change a file on disk while the first batch is in flight: the upload
    // and the digest must both use the bytes read at the start.
    respond = async (req, index) => {
      if (index === 0) fs.writeFileSync(files[2], 'Feature: Changed\n');
      return { counts: {}, warnings: [], scenarios: [] };
    };

    await upload(files, { sync: true, folder_id: '9', batch_size: 2 });

    expect(sent).toHaveLength(2);
    const [first, last] = sent.map((r) => r.body);
    const syncId = fieldValue(first, 'sync_id');
    expect(syncId).toMatch(/^[0-9a-f]{32}$/);
    expect(fieldValue(last, 'sync_id')).toBe(syncId);
    expect([
      fieldValue(first, 'batch_index'),
      fieldValue(last, 'batch_index'),
    ]).toEqual(['0', '1']);
    expect([
      fieldValue(first, 'batch_total'),
      fieldValue(last, 'batch_total'),
    ]).toEqual(['2', '2']);
    expect(fieldValue(first, 'suite_id')).toBe('9');
    expect(fieldValue(first, 'sync_final')).toBeUndefined();
    expect(fieldValue(first, 'manifest_digest')).toBeUndefined();
    expect(fieldValue(last, 'sync_final')).toBe('1');
    expect(fieldValue(last, 'file_count_total')).toBe('3');
    const lines = Object.entries(contents)
      .map(([rel, c]) => `${rel}:${sha(c)}`)
      .sort();
    expect(fieldValue(last, 'manifest_digest')).toBe(sha(lines.join('\n')));
    expect(last).toContain('Feature: C');
    expect(last).not.toContain('Feature: Changed');
  });

  it('passes --force and --dry-run to the server', async () => {
    const file = write('a.feature', 'Feature: A\n');
    await upload([file], {
      sync: true,
      folder_id: '9',
      force: true,
      'dry-run': true,
    });
    expect(fieldValue(sent[0].body, 'force')).toBe('1');
    expect(fieldValue(sent[0].body, 'sync_dry_run')).toBe('1');
  });

  it('prints the list a threshold refusal would have archived', async () => {
    const file = write('a.feature', 'Feature: A\n');
    respond = async () => {
      const error: any = new Error('Request failed with status code 409');
      error.response = {
        status: 409,
        data: {
          message: 'This sync would archive 8 of the 10 tests in "Synced"',
          archive: [
            { key: 12, name: 'Scenario: Old one', folder: 'Feature: Alpha' },
            { key: 13, name: 'Scenario: Old two', folder: 'Feature: Alpha' },
          ],
        },
      };
      throw error;
    };
    await expect(
      upload([file], { sync: true, folder_id: '9' }),
    ).rejects.toThrow();
    const out = logs.join('\n');
    expect(out).toContain('would archive 8 of the 10 tests');
    expect(out).toContain('TC12');
    expect(out).toContain('Scenario: Old two');
    expect(out).toContain('--force');
  });
});

describe('upload_feature --write_tags', () => {
  const feature = [
    'Feature: Tags',
    '',
    '  Scenario: Two spaces',
    '    When a',
    '',
    '    Example: Four spaces',
    '      When b',
    '',
    '\tScenario Outline: A tab',
    '\t\tWhen <c>',
    '\t\tExamples:',
    '\t\t\t| c |',
    '\t\t\t| 1 |',
    '',
    '  Scenario Template: Template',
    '    When d',
    '',
  ].join('\n');

  it('inserts @TC<key> above each untagged scenario, matching its indentation, for all four keywords', async () => {
    const file = write('tags.feature', feature);
    await upload([file], { write_tags: true });
    expect(fieldValue(sent[0].body, 'write_tags')).toBe('true');
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const above = (title: string) =>
      lines[lines.findIndex((l) => l.includes(title)) - 1];
    expect(above('Scenario: Two spaces')).toBe('  @TC1000');
    expect(above('Example: Four spaces')).toBe('    @TC1001');
    expect(above('Scenario Outline: A tab')).toBe('\t@TC1002');
    expect(above('Scenario Template: Template')).toBe('  @TC1003');
  });

  it('leaves a scenario that already has a key alone', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  @smoke @TC77\n  Scenario: Keyed\n    When a\n',
    );
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(
      'Feature: T\n\n  @smoke @TC77\n  Scenario: Keyed\n    When a\n',
    );
  });

  it('keeps CRLF line endings', async () => {
    const file = write(
      'crlf.feature',
      'Feature: C\r\n\r\n  Scenario: One\r\n    When a\r\n',
    );
    await upload([file], { write_tags: true });
    const text = fs.readFileSync(file, 'utf8');
    expect(text).toBe(
      'Feature: C\r\n\r\n  @TC1000\r\n  Scenario: One\r\n    When a\r\n',
    );
    expect(text.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('is idempotent: a second run adds nothing', async () => {
    const file = write('t.feature', feature);
    await upload([file], { write_tags: true });
    const once = fs.readFileSync(file, 'utf8');
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(once);
  });

  it('skips a file that changed after it was uploaded', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n',
    );
    const base = respond;
    respond = async (req, index) => {
      const answer = await base(req, index);
      fs.writeFileSync(
        file,
        'Feature: T\n\n  Scenario: One\n    When edited\n',
      );
      return answer;
    };
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(
      'Feature: T\n\n  Scenario: One\n    When edited\n',
    );
    expect(logs.join('\n')).toMatch(/t\.feature.*changed/);
  });

  it('refuses to tag when the reported line is not that scenario', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n\n  Scenario: Two\n    When b\n',
    );
    const base = respond;
    respond = async (req, index) => {
      const answer = await base(req, index);
      answer.scenarios[0].line += 1; // points at "When a"
      return answer;
    };
    await upload([file], { write_tags: true });
    const text = fs.readFileSync(file, 'utf8');
    expect(text).not.toMatch(/@TC\d+\n  Scenario: One/);
    expect(text).toContain('  @TC1001\n  Scenario: Two');
    expect(logs.join('\n')).toMatch(/t\.feature:4.*One/);
  });

  it('checks the keyword and title at the reported line, not just that it is a scenario', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n\n  Scenario: Two\n    When b\n\n  Scenario: Three\n    When c\n',
    );
    const base = respond;
    respond = async (req, index) => {
      const answer = await base(req, index);
      answer.scenarios[0].scenario = 'Renamed on the server';
      answer.scenarios[1].keyword = 'Scenario Outline';
      return answer;
    };
    await upload([file], { write_tags: true });
    const text = fs.readFileSync(file, 'utf8');
    expect(text).not.toMatch(/@TC\d+\n  Scenario: One/);
    expect(text).not.toMatch(/@TC\d+\n  Scenario: Two/);
    expect(text).toContain('  @TC1002\n  Scenario: Three');
  });

  it('respects a key on any of the tag lines above a scenario', async () => {
    const content =
      'Feature: T\n\n  @TC77\n  @smoke\n  Scenario: Keyed\n    When a\n';
    const file = write('t.feature', content);
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(content);
  });

  it('never adds a second key, even if the server reports none', async () => {
    const content = 'Feature: T\n\n  @TC77\n  Scenario: Keyed\n    When a\n';
    const file = write('t.feature', content);
    const base = respond;
    respond = async (req, index) => {
      const answer = await base(req, index);
      answer.scenarios[0].supplied_key = null;
      answer.scenarios[0].status = 'created';
      return answer;
    };
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(content);
  });

  it('writes nothing when a later batch fails', async () => {
    const files = ['a', 'b', 'c'].map((n) =>
      write(`${n}.feature`, `Feature: ${n}\n\n  Scenario: ${n}\n    When x\n`),
    );
    const before = files.map((f) => fs.readFileSync(f, 'utf8'));
    const base = respond;
    respond = async (req, index) => {
      if (index === 1) throw new Error('simulated failure on batch 2');
      return await base(req, index);
    };
    await expect(
      upload(files, { write_tags: true, batch_size: 2 }),
    ).rejects.toThrow('simulated failure');
    expect(files.map((f) => fs.readFileSync(f, 'utf8'))).toEqual(before);
  });

  it('refuses under CI, and together with --sync, before anything is sent', async () => {
    const file = write('t.feature', feature);
    process.env.CI = 'true';
    await expect(upload([file], { write_tags: true })).rejects.toThrow(/CI/);
    delete process.env.CI;
    await expect(
      upload([file], { write_tags: true, sync: true, folder_id: '9' }),
    ).rejects.toThrow(/--sync/);
    expect(sent).toHaveLength(0);
    expect(fs.readFileSync(file, 'utf8')).toBe(feature);
  });

  it('--dry-run lists file:line → @TCn and writes nothing', async () => {
    const file = write('t.feature', feature);
    await upload([file], { write_tags: true, 'dry-run': true });
    expect(fs.readFileSync(file, 'utf8')).toBe(feature);
    const out = logs.join('\n');
    expect(out).toContain('t.feature:3 → @TC1000');
    expect(out).toContain('t.feature:15 → @TC1003');
  });
});
