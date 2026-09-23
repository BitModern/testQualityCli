import { describe, expect, it } from 'vitest';
import FormData from 'form-data';
import {
  appendFiles,
  assertRunUploadFileLimit,
  chunk,
  MAX_FILES_PER_REQUEST,
} from '../src/uploadFiles';
import {
  countParts,
  fieldValue,
  makeTempFiles,
  serializeForm,
} from './helpers';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe('chunk', () => {
  it.each([
    [0, []],
    [1, [1]],
    [200, [200]],
    [201, [200, 1]],
    [450, [200, 200, 50]],
  ])('%i items with size 200 -> batch sizes %j', (n, sizes) => {
    const batches = chunk(range(n), 200);
    expect(batches.map((b) => b.length)).toEqual(sizes);
    // Order preserved, nothing lost or duplicated.
    expect(batches.flat()).toEqual(range(n));
  });

  it('rejects a non-positive size', () => {
    expect(() => chunk([1, 2], 0)).toThrow();
  });

  it('defaults to the server limit of 200', () => {
    expect(MAX_FILES_PER_REQUEST).toBe(200);
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
