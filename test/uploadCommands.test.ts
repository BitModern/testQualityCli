import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type FormData from 'form-data';
import {
  countParts,
  fieldValue,
  makeTempFiles,
  serializeForm,
} from './helpers';

// Capture every request the commands send instead of hitting the network.
const sent: Array<{ url: string; data: FormData }> = [];
let failOnCall: number | undefined;

vi.mock('@testquality/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@testquality/sdk')>();
  return {
    ...actual,
    getResponse: vi.fn(async (_api: unknown, req: any) => {
      sent.push({ url: req.url, data: req.data });
      if (failOnCall === sent.length) {
        throw new Error(`simulated failure on request ${sent.length}`);
      }
      return { ok: sent.length };
    }),
  };
});

const { UploadFeatureCommand } = await import('../src/UploadFeatureCommand');
const { UploadFeatureResultsCommand } = await import(
  '../src/UploadFeatureResultsCommand'
);
const { UploadTestRunCommand } = await import('../src/UploadTestRunCommand');
const { logger } = await import('../src/Logger');

const fakePaths = (n: number) =>
  Array.from({ length: n }, (_, i) => `/nonexistent/f${i}.json`);

beforeEach(() => {
  sent.length = 0;
  failOnCall = undefined;
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('upload_feature batching', () => {
  const upload = (files: string[], args: any = {}) =>
    (new UploadFeatureCommand() as any).uploadFeatureFiles(args, files, 1);

  it('sends 450 files as 200 + 200 + 50, each with a matching file_count', async () => {
    const files = makeTempFiles(450);
    const responses = await upload(files);
    expect(responses).toHaveLength(3);
    expect(sent.map((r) => r.url)).toEqual([
      '/import_feature',
      '/import_feature',
      '/import_feature',
    ]);
    const bodies = await Promise.all(sent.map((r) => serializeForm(r.data)));
    expect(bodies.map((b) => countParts(b, 'files[]'))).toEqual([200, 200, 50]);
    expect(bodies.map((b) => fieldValue(b, 'file_count'))).toEqual([
      '200',
      '200',
      '50',
    ]);
    // Every file sent exactly once, in order.
    expect(bodies.join('')).toContain('Feature: f449');
    expect(bodies[2]).toContain('Feature: f400');
    expect(bodies[2]).not.toContain('Feature: f399\n');
  });

  it('respects --batch_size', async () => {
    await upload(makeTempFiles(5), { batch_size: 2 });
    const bodies = await Promise.all(sent.map((r) => serializeForm(r.data)));
    expect(bodies.map((b) => fieldValue(b, 'file_count'))).toEqual([
      '2',
      '2',
      '1',
    ]);
  });

  it('rejects a --batch_size above the server limit before sending', async () => {
    await expect(upload(makeTempFiles(3), { batch_size: 201 })).rejects.toThrow(
      /--batch_size must be an integer between 1 and 200/,
    );
    expect(sent).toHaveLength(0);
  });

  it('stops at the first failed batch and does not send later ones', async () => {
    const files = makeTempFiles(450);
    failOnCall = 2;
    const errorLog = vi.spyOn(logger, 'error').mockImplementation(() => true);
    await expect(upload(files)).rejects.toThrow(
      'simulated failure on request 2',
    );
    expect(sent).toHaveLength(2);
    const message = String(errorLog.mock.calls[0][0]);
    expect(message).toContain('Batch 2/3 failed (200 files)');
    expect(message).toContain('200 of 450 files were uploaded');
    expect(message).toContain(files[200]);
    expect(message).toContain(files[399]);
    expect(message).not.toContain(files[199]);
    expect(message).not.toContain(files[400]);
  });
});

describe('upload_feature_results', () => {
  const upload = (files: string[]) =>
    (new UploadFeatureResultsCommand() as any).uploadFeatureResultFiles(
      {},
      files,
      1,
    );

  it('refuses more than 200 files before sending anything', async () => {
    await expect(upload(fakePaths(201))).rejects.toThrow(
      'Too many files (201); max 200 per run upload',
    );
    expect(sent).toHaveLength(0);
  });

  it('sends up to 200 files in one request with file_count', async () => {
    await upload(makeTempFiles(200, '.json'));
    expect(sent).toHaveLength(1);
    const body = await serializeForm(sent[0].data);
    expect(countParts(body, 'files[]')).toBe(200);
    expect(fieldValue(body, 'file_count')).toBe('200');
  });
});

describe('upload_test_run', () => {
  const upload = (xml: string[], attachments: string[] = []) =>
    (new UploadTestRunCommand() as any).uploadTestResults(
      {},
      xml,
      attachments,
      1,
    );

  it('counts attachments toward the 200-file limit', async () => {
    await expect(upload(fakePaths(150), fakePaths(51))).rejects.toThrow(
      'Too many files (201); max 200 per run upload',
    );
    expect(sent).toHaveLength(0);
  });

  it('sends xml + attachments with a file_count covering both', async () => {
    await upload(makeTempFiles(2, '.xml'), makeTempFiles(3, '.png'));
    expect(sent).toHaveLength(1);
    const body = await serializeForm(sent[0].data);
    expect(countParts(body, 'files[]')).toBe(5);
    expect(countParts(body, 'filepaths[]')).toBe(5);
    expect(fieldValue(body, 'file_count')).toBe('5');
  });
});
