import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type FormData from 'form-data';
import {
  batchFiles,
  formatMB,
  MAX_BYTES_PER_REQUEST,
  MAX_FILES_PER_REQUEST,
} from './uploadFiles';

/** A matched `.feature` file, before it is read. */
export interface FeatureFile {
  /** Absolute path on disk. */
  file: string;
  /** Path relative to the base directory, with forward slashes. Sent as filepaths[]. */
  relPath: string;
  size: number;
}

/**
 * What was uploaded for one file: its hash is kept for the whole run (for the
 * sync digest and the --write_tags check), its bytes only while its batch is
 * sent.
 */
export interface UploadedFile {
  file: string;
  relPath: string;
  sha256: string;
}

/**
 * A file as read for its batch: read once and hashed once. These same bytes
 * are uploaded, counted in a sync's manifest digest and compared before
 * --write_tags edits the file, so a file changed after it was read is never
 * tagged from a response about different content.
 */
export interface FeatureSnapshot extends UploadedFile {
  bytes: Buffer;
}

export function sha256(bytes: Buffer | string): string {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

/**
 * Stat each file and work out its path relative to `baseDir`. Both sides are
 * resolved through symlinks, as glob's realpath matches are, so /tmp and
 * /private/tmp give the same relative path.
 */
export function listFeatureFiles(
  files: string[],
  baseDir: string,
): FeatureFile[] {
  const base = fs.realpathSync(baseDir);
  return files.map((file) => {
    const real = fs.realpathSync(file);
    return {
      file,
      relPath: path.relative(base, real).split(path.sep).join('/'),
      size: fs.statSync(real).size,
    };
  });
}

/**
 * Batch by file count and bytes, using the sizes from stat, so a file too
 * large to send is refused before anything is read or sent.
 */
export function batchFeatureFiles(
  files: FeatureFile[],
  maxCount: number = MAX_FILES_PER_REQUEST,
  maxBytes: number = MAX_BYTES_PER_REQUEST,
): FeatureFile[][] {
  const byFile = new Map(files.map((f) => [f.file, f]));
  return batchFiles(
    files.map((f) => ({ path: f.file, size: f.size })),
    maxCount,
    maxBytes,
  ).map((batch) => batch.map((file) => byFile.get(file)!));
}

/** Read and hash one batch. Only one batch's bytes are held at a time. */
export function readSnapshots(
  batch: FeatureFile[],
  maxBytes: number = MAX_BYTES_PER_REQUEST,
): FeatureSnapshot[] {
  return batch.map((f) => {
    const bytes = fs.readFileSync(f.file);
    if (bytes.length > maxBytes) {
      throw new Error(
        `File ${f.file} is ${formatMB(bytes.length)}; max ${formatMB(maxBytes)} per upload request.`,
      );
    }
    return { file: f.file, relPath: f.relPath, bytes, sha256: sha256(bytes) };
  });
}

/**
 * sha256 of the sorted "path:sha256" lines of every file in a sync run. The
 * server computes the same over what it received (SyncSession::digest) and
 * refuses to finalize a run whose digests differ. The server sorts with PHP's
 * sort(SORT_STRING), a byte-wise comparison, so sort by UTF-8 bytes here:
 * JavaScript's default sort compares UTF-16 code units, which orders some
 * non-ASCII names differently.
 */
export function manifestDigest(files: UploadedFile[]): string {
  const lines = files
    .map((f) => `${f.relPath}:${f.sha256}`)
    .sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  return sha256(lines.join('\n'));
}

/**
 * Append each snapshot as a files[] part with its filepaths[] entry, plus the
 * file_count the server checks for dropped files.
 */
export function appendSnapshots(
  data: FormData,
  snapshots: FeatureSnapshot[],
): FormData {
  snapshots.forEach((s) => {
    data.append('files[]', s.bytes, { filename: path.basename(s.file) });
    data.append('filepaths[]', s.relPath);
  });
  data.append('file_count', String(snapshots.length));
  return data;
}
