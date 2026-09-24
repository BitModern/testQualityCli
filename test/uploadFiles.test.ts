import { describe, expect, it } from 'vitest';
import FormData from 'form-data';
import {
  appendFiles,
  assertRunUploadByteLimit,
  assertRunUploadFileLimit,
  batchFiles,
  MAX_BYTES_PER_REQUEST,
  MAX_FILES_PER_REQUEST,
  type SizedFile,
} from '../src/uploadFiles';
import {
  countParts,
  fieldValue,
  makeSizedTempFiles,
  makeTempFiles,
  serializeForm,
} from './helpers';

const MB = 1024 * 1024;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const sized = (sizes: number[]): SizedFile[] =>
  sizes.map((size, i) => ({ path: `f${i}`, size }));
const small = (n: number) => sized(Array.from({ length: n }, () => 100));

describe('batchFiles', () => {
  it.each([
    [0, []],
    [1, [1]],
    [200, [200]],
    [201, [200, 1]],
    [450, [200, 200, 50]],
  ])('%i small files -> batch sizes %j', (n, sizes) => {
    const files = small(n);
    const batches = batchFiles(files, 200, MAX_BYTES_PER_REQUEST);
    expect(batches.map((b) => b.length)).toEqual(sizes);
    // Order preserved, nothing lost or duplicated.
    expect(batches.flat()).toEqual(range(n).map((i) => `f${i}`));
  });

  it('splits two 20 MB files into two batches', () => {
    expect(batchFiles(sized([20 * MB, 20 * MB]))).toEqual([['f0'], ['f1']]);
  });

  it('fills a batch exactly to the byte limit, then starts a new one', () => {
    expect(batchFiles(sized([16 * MB, 16 * MB, 1]))).toEqual([
      ['f0', 'f1'],
      ['f2'],
    ]);
  });

  it('packs mixed sizes greedily in order', () => {
    const files = sized([10 * MB, 10 * MB, 10 * MB, 5 * MB, 30 * MB, 1 * MB]);
    expect(batchFiles(files)).toEqual([
      ['f0', 'f1', 'f2'],
      ['f3'],
      ['f4', 'f5'],
    ]);
  });

  it('applies whichever limit is hit first', () => {
    // Count limit first.
    expect(batchFiles(small(5), 2, 10 * MB).map((b) => b.length)).toEqual([
      2, 2, 1,
    ]);
    // Byte limit first.
    expect(
      batchFiles(sized([6 * MB, 6 * MB, 6 * MB]), 200, 10 * MB).map(
        (b) => b.length,
      ),
    ).toEqual([1, 1, 1]);
  });

  it('rejects a single file larger than the byte limit, naming it', () => {
    const files = [
      { path: 'ok.feature', size: 1 * MB },
      { path: 'huge.feature', size: 40 * MB },
    ];
    expect(() => batchFiles(files)).toThrowError(
      'File huge.feature is 40 MB; max 32 MB per upload request.',
    );
  });

  it('rejects a non-positive count', () => {
    expect(() => batchFiles(small(2), 0)).toThrow();
  });

  it('defaults to the server limits of 200 files and 32 MB', () => {
    expect(MAX_FILES_PER_REQUEST).toBe(200);
    expect(MAX_BYTES_PER_REQUEST).toBe(32 * MB);
  });
});

describe('appendFiles', () => {
  it.each([2, 5])(
    '%i files -> that many files[] parts and file_count',
    async (n) => {
      const files = makeTempFiles(n);
      const form = new FormData();
      form.append('project_id', '7');
      appendFiles(form, files);
      const body = await serializeForm(form);
      expect(countParts(body, 'files[]')).toBe(n);
      expect(fieldValue(body, 'file_count')).toBe(String(n));
      expect(countParts(body, 'file_count')).toBe(1);
      expect(countParts(body, 'filepaths[]')).toBe(0);
      for (const f of files) {
        expect(body).toContain(`Feature: f${files.indexOf(f)}`);
      }
    },
  );

  it('adds one filepaths[] entry per file when a mapper is given', async () => {
    const files = makeTempFiles(3, '.xml');
    const form = appendFiles(new FormData(), files, (f) => `rel/${f.length}`);
    const body = await serializeForm(form);
    expect(countParts(body, 'files[]')).toBe(3);
    expect(countParts(body, 'filepaths[]')).toBe(3);
    expect(fieldValue(body, 'file_count')).toBe('3');
  });
});

describe('assertRunUploadFileLimit', () => {
  it('allows up to 200 files', () => {
    expect(() => assertRunUploadFileLimit(0)).not.toThrow();
    expect(() => assertRunUploadFileLimit(200)).not.toThrow();
  });

  it('rejects more than 200 files with a clear message', () => {
    expect(() => assertRunUploadFileLimit(201)).toThrowError(
      'Too many files (201); max 200 per run upload',
    );
  });
});

describe('assertRunUploadByteLimit', () => {
  it('allows files totalling up to 32 MB', () => {
    expect(() =>
      assertRunUploadByteLimit(makeSizedTempFiles([16 * MB, 16 * MB])),
    ).not.toThrow();
  });

  it('rejects files totalling more than 32 MB with a clear message', () => {
    expect(() =>
      assertRunUploadByteLimit(makeSizedTempFiles([20 * MB, 20 * MB])),
    ).toThrowError('Upload is 40 MB; max 32 MB per run upload');
  });
});
