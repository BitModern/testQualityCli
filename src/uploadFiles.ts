import * as fs from 'fs';
import * as path from 'path';
import type FormData from 'form-data';

/**
 * The most files the CLI sends in a single upload request.
 *
 * PHP drops every file past `max_file_uploads` without an error, so a request
 * carrying more files than the server accepts would silently lose the rest.
 * The server is configured for 200; keep this in step with it.
 */
export const MAX_FILES_PER_REQUEST = 200;

/**
 * The most bytes of file content the CLI sends in a single upload request.
 *
 * The server's PHP `post_max_size` is 36M. A body over that is discarded
 * whole, including `file_count`, and the server answers with a misleading
 * 422 "file field is required". 32 MiB leaves headroom for multipart
 * overhead and the other form fields.
 */
export const MAX_BYTES_PER_REQUEST = 32 * 1024 * 1024;

export interface SizedFile {
  path: string;
  size: number;
}

/** Format a byte count as MB with one decimal place (MiB, matching PHP's M). */
export function formatMB(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
}

/** Stat each file once and pair it with its size in bytes. */
export function statFiles(files: string[]): SizedFile[] {
  return files.map((file) => ({ path: file, size: fs.statSync(file).size }));
}

/**
 * Split `files` into consecutive batches, starting a new batch whenever adding
 * the next file would exceed `maxCount` files or `maxBytes` total bytes.
 * Order is preserved. A single file larger than `maxBytes` can never be sent,
 * so it is rejected before any batch is produced.
 */
export function batchFiles(
  files: SizedFile[],
  maxCount: number = MAX_FILES_PER_REQUEST,
  maxBytes: number = MAX_BYTES_PER_REQUEST,
): string[][] {
  if (!Number.isInteger(maxCount) || maxCount < 1) {
    throw new Error(`Batch size must be a positive integer, got ${maxCount}`);
  }
  const oversize = files.find((f) => f.size > maxBytes);
  if (oversize) {
    throw new Error(
      `File ${oversize.path} is ${formatMB(oversize.size)}; ` +
        `max ${formatMB(maxBytes)} per upload request.`,
    );
  }
  const batches: string[][] = [];
  let current: string[] = [];
  let currentBytes = 0;
  for (const file of files) {
    if (
      current.length > 0 &&
      (current.length + 1 > maxCount || currentBytes + file.size > maxBytes)
    ) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(file.path);
    currentBytes += file.size;
  }
  if (current.length > 0) {
    batches.push(current);
  }
  return batches;
}

/**
 * Append `files` as `files[]` parts plus a `file_count` field holding the
 * number of files in this request. The server compares `file_count` with what
 * it actually received and rejects the request if files went missing; servers
 * that predate the field ignore it.
 *
 * When `filePathFor` is given, a matching `filepaths[]` entry is appended for
 * each file.
 */
export function appendFiles(
  data: FormData,
  files: string[],
  filePathFor?: (file: string) => string,
): FormData {
  files.forEach((file) => {
    data.append('files[]', fs.createReadStream(file), path.basename(file));
    if (filePathFor) {
      data.append('filepaths[]', filePathFor(file));
    }
  });
  data.append('file_count', String(files.length));
  return data;
}

/**
 * Uploads that create a run cannot be split across requests, since each
 * request would create a separate run. Refuse up front instead of letting the
 * server drop files.
 */
export function assertRunUploadFileLimit(
  count: number,
  max: number = MAX_FILES_PER_REQUEST,
): void {
  if (count > max) {
    throw new Error(
      `Too many files (${count}); max ${max} per run upload. ` +
        'Narrow the glob or split the results into separate runs.',
    );
  }
}

/**
 * Run uploads go in one request, so their total size must fit under the
 * server's body limit. Refuse up front instead of letting PHP discard the
 * body and answer with a misleading 422.
 */
export function assertRunUploadByteLimit(
  files: string[],
  max: number = MAX_BYTES_PER_REQUEST,
): void {
  const total = statFiles(files).reduce((sum, f) => sum + f.size, 0);
  if (total > max) {
    throw new Error(
      `Upload is ${formatMB(total)}; max ${formatMB(max)} per run upload. ` +
        'Narrow the glob or split the results into separate runs.',
    );
  }
}
