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

// fs passes through to the real module, except that a test can make the
// final rename fail (an editor or virus scanner holding the file on Windows).
const renameControl = vi.hoisted(() => ({ fail: false }));
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const renameSync: typeof actual.renameSync = (from, to) => {
    if (renameControl.fail) {
      throw new Error('EBUSY: resource busy or locked, rename');
    }
    actual.renameSync(from, to);
  };
  return { ...actual, default: { ...actual, renameSync }, renameSync };
});

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
const { HttpError } = await import('@testquality/sdk');
const { manifestDigest } = await import('../src/featureSnapshot');
const { logger } = await import('../src/Logger');
const { logError } = await import('../src/logError');

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
/** The files in a request, as uploaded: filepaths[] paired with files[] bytes. */
function uploadedFiles(body: string): Array<{ rel: string; content: string }> {
  const contents = [
    ...body.matchAll(
      /name="files\[\]"; filename="[^"]*"\r\n(?:[^\r\n]+\r\n)*\r\n([\s\S]*?)\r\n--/g,
    ),
  ].map((m) => m[1]);
  return allValues(body, 'filepaths[]').map((rel, i) => ({
    rel,
    content: contents[i],
  }));
}

const STEP = /^(Given|When|Then|And|But|\*|Examples|Scenarios)\b/;

/**
 * Answer as the server does, from the bytes uploaded (not the files on disk).
 * Like Behat, a scenario's title carries its description lines after a
 * newline, and a scenario with no title reports null.
 */
function serverLike(keys: Record<string, number> = {}) {
  return async (req: Req) => {
    const scenarios: any[] = [];
    for (const { rel, content } of uploadedFiles(req.body)) {
      const lines = content.split(/\r\n|\n|\r/);
      const feature = lines.find((l) => l.trim().startsWith('Feature:'));
      lines.forEach((line, i) => {
        const m = SCENARIO.exec(line);
        if (!m) return;
        const description: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const text = lines[j].trim();
          if (text === '' || STEP.test(text) || /^[@#]/.test(text)) break;
          description.push(text);
        }
        const title =
          [m[2], ...description].join('\n').replace(/^\n+/, '') || null;
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
          scenario: title,
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
    // sub/c.feature changed before its batch was read: it is uploaded as it
    // was then, and the digest covers exactly the bytes that were uploaded.
    const sentBytes = sent.flatMap((r) => uploadedFiles(r.body));
    expect(sentBytes.find((f) => f.rel === 'sub/c.feature')?.content).toBe(
      'Feature: Changed\n',
    );
    const lines = sentBytes.map((f) => `${f.rel}:${sha(f.content)}`).sort();
    expect(fieldValue(last, 'manifest_digest')).toBe(sha(lines.join('\n')));
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

  it('refuses --dry-run without --sync or --write_tags, since that upload would be a real import', async () => {
    const file = write('a.feature', 'Feature: A\n');
    await expect(upload([file], { 'dry-run': true })).rejects.toThrow(
      /--dry-run needs --sync or --write_tags/,
    );
    await expect(upload([file], { force: true })).rejects.toThrow(
      /--force only applies to --sync/,
    );
    expect(sent).toHaveLength(0);
  });

  it('prints the list a threshold refusal would have archived', async () => {
    const file = write('a.feature', 'Feature: A\n');
    // What the SDK's interceptor actually throws: an HttpError whose `data`
    // is the response body's `data` key.
    respond = async () => {
      throw new HttpError(
        'This sync would archive 8 of the 10 tests in "Synced"',
        undefined,
        undefined,
        409,
        undefined,
        '/import_feature',
        undefined,
        {
          archive: [
            { key: 12, name: 'Scenario: Old one', folder: 'Feature: Alpha' },
            { key: 13, name: 'Scenario: Old two', folder: 'Feature: Alpha' },
          ],
        },
      );
    };
    await expect(
      upload([file], { sync: true, folder_id: '9' }),
    ).rejects.toThrow();
    const out = logs.join('\n');
    expect(out).toContain('would archive 8 of the 10 tests');
    expect(out).toContain('TC12');
    expect(out).toContain('Scenario: Old two');
    expect(out).toContain('--force');
    expect(out).toContain('Nothing was imported or archived.');
    // One batch: no batch wording, and the refusal is printed once.
    expect(out).not.toContain('Batch 1/1');
    expect(out).not.toContain('earlier batches');
    expect(out.split('would archive 8').length - 1).toBe(1);
  });

  it('logs a refusal once: the top-level handler only sets the exit code', async () => {
    const file = write('a.feature', 'Feature: A\n');
    respond = async () => {
      throw refusal();
    };
    const error = await upload([file], { sync: true, folder_id: '9' }).catch(
      (e: unknown) => e,
    );
    logs.length = 0;
    process.exitCode = undefined;
    logError(error);
    expect(logs).toEqual([]);
    expect(process.exitCode).toBe(1);
    process.exitCode = undefined;
  });

  it('says which batches were imported when the last of several is refused', async () => {
    const files = ['a', 'b', 'c'].map((n) =>
      write(`${n}.feature`, `Feature: ${n}\n`),
    );
    const base = respond;
    respond = async (entry, i) => {
      if (i === 1) throw refusal();
      return await base(entry, i);
    };
    await expect(
      upload(files, { sync: true, folder_id: '9', batch_size: 2 }),
    ).rejects.toThrow();
    const out = logs.join('\n');
    expect(out).toContain(
      'Nothing was archived. The last batch was not imported; the 2 files in earlier batches were.',
    );
    expect(out).not.toContain('Batch 2/2 failed');
  });

  it('keeps the batch report for a failure that is not a refusal', async () => {
    const files = ['a', 'b', 'c'].map((n) =>
      write(`${n}.feature`, `Feature: ${n}\n`),
    );
    const base = respond;
    respond = async (entry, i) => {
      if (i === 1) throw new Error('boom');
      return await base(entry, i);
    };
    await expect(
      upload(files, { sync: true, folder_id: '9', batch_size: 2 }),
    ).rejects.toThrow('boom');
    expect(logs.join('\n')).toContain(
      'Batch 2/2 failed (1 files). 2 of 3 files were uploaded by earlier batches',
    );
  });
});

function refusal() {
  return new HttpError(
    'This sync would archive 8 of the 10 tests in "Synced"',
    undefined,
    undefined,
    409,
    undefined,
    '/import_feature',
    undefined,
    { archive: [{ key: 12, name: 'Scenario: Old one', folder: 'Feature: A' }] },
  );
}

describe('manifest digest', () => {
  it('matches the digest the server computes, byte-sorted like PHP', () => {
    // Generated by the server's SyncSession::digest for this manifest.
    const files = [
      ['features/a.feature', 'a'],
      ['features/😀.feature', 'b'],
      ['features/Ａ.feature', 'c'],
      ['features/A b.feature', 'd'],
      ['42', 'e'],
    ].map(([relPath, c]) => ({ file: relPath, relPath, sha256: c.repeat(64) }));
    expect(manifestDigest(files)).toBe(
      '3cb22fc6c3654db7bc763d0940648855b25f97b009e62793ef60edfa3f4fdfda',
    );
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

  it('warns about a key that did not resolve, and adds none', async () => {
    const content =
      'Feature: U\n\n  @TC999999\n  Scenario: Unknown\n    When a\n';
    const file = write('u.feature', content);
    const base = respond;
    respond = async (req, index) => {
      const answer = await base(req, index);
      answer.scenarios[0].status = 'unknown';
      answer.scenarios[0].resolved_key = 1000; // the fallback test it landed on
      return answer;
    };
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(content);
    expect(logs.join('\n')).toMatch(
      /u\.feature:4 "Unknown" carries a key that did not resolve \(unknown\)/,
    );
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

  it('keeps the file permissions', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n',
    );
    fs.chmodSync(file, 0o640);
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toContain('@TC1000');
    expect(fs.statSync(file).mode & 0o777).toBe(0o640);
  });

  it('leaves a file it cannot write untouched, with no temp file behind', async () => {
    const sub = path.join(dir, 'locked');
    const file = write(
      'locked/t.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n',
    );
    fs.chmodSync(sub, 0o555);
    try {
      await upload([file], { write_tags: true });
      expect(fs.readFileSync(file, 'utf8')).toBe(
        'Feature: T\n\n  Scenario: One\n    When a\n',
      );
      expect(fs.readdirSync(sub)).toEqual(['t.feature']);
      expect(logs.join('\n')).toMatch(
        /locked\/t\.feature: could not be written/,
      );
    } finally {
      fs.chmodSync(sub, 0o755);
    }
  });

  it('removes its temp file when the final rename fails', async () => {
    const content = 'Feature: R\n\n  Scenario: One\n    When a\n';
    const file = write('r.feature', content);
    renameControl.fail = true;
    try {
      await upload([file], { write_tags: true });
    } finally {
      renameControl.fail = false;
    }
    expect(fs.readFileSync(file, 'utf8')).toBe(content);
    expect(fs.readdirSync(dir)).toEqual(['r.feature']);
    expect(logs.join('\n')).toMatch(/r\.feature: could not be written \(EBUSY/);
  });

  it('keeps mixed line endings line by line', async () => {
    const content = 'Feature: M\n\n  Scenario: One\r\n    When a\n';
    const file = write('m.feature', content);
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(
      'Feature: M\n\n  @TC1000\r\n  Scenario: One\r\n    When a\n',
    );
  });

  it('tags a scenario whose line above is a comment mentioning @TC', async () => {
    const file = write(
      'c.feature',
      'Feature: C\n\n  # see @TC12 for history\n  Scenario: One\n    When a\n',
    );
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toBe(
      'Feature: C\n\n  # see @TC12 for history\n  @TC1000\n  Scenario: One\n    When a\n',
    );
  });

  it('reports paths relative to --base_dir through symlinks', async () => {
    const file = write(
      'features/s.feature',
      'Feature: S\n\n  Scenario: One\n    When a\n',
    );
    await upload([fs.realpathSync(file)], { write_tags: true });
    expect(allValues(sent[0].body, 'filepaths[]')).toEqual([
      'features/s.feature',
    ]);
    expect(fs.readFileSync(file, 'utf8')).toContain('@TC1000');
  });

  it('refuses to claim success against a server that does not report scenarios', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n',
    );
    respond = async () => ({ counts: { created: 1 } });
    await expect(upload([file], { write_tags: true })).rejects.toThrow(
      /predates --write_tags/,
    );
    expect(fs.readFileSync(file, 'utf8')).toBe(
      'Feature: T\n\n  Scenario: One\n    When a\n',
    );
  });

  it('treats CI=false as not CI', async () => {
    const file = write(
      't.feature',
      'Feature: T\n\n  Scenario: One\n    When a\n',
    );
    process.env.CI = 'false';
    await upload([file], { write_tags: true });
    expect(fs.readFileSync(file, 'utf8')).toContain('@TC1000');
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

  it('tags a scenario with a description, whose reported title carries the description lines', async () => {
    // Behat's ScenarioNode title is the keyword-line text plus every
    // description line under it, and null when the title is empty.
    const content =
      'Feature: T\n\n  Scenario: One\n    Some description\n    of the scenario\n    When a\n\n  Scenario:\n    When b\n';
    const file = write('t.feature', content);
    const base = respond;
    respond = async (req, index) => {
      const answer = await base(req, index);
      answer.scenarios[0].scenario = 'One\nSome description\nof the scenario';
      answer.scenarios[1].scenario = null;
      return answer;
    };
    await upload([file], { write_tags: true });
    const text = fs.readFileSync(file, 'utf8');
    expect(text).toContain('  @TC1000\n  Scenario: One\n    Some description');
    expect(text).toContain('  @TC1001\n  Scenario:\n');
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
    expect(out).toContain('real import');
  });
});
