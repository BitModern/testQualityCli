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

/** Split `items` into consecutive batches of at most `size` elements. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`Batch size must be a positive integer, got ${size}`);
  }
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
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
