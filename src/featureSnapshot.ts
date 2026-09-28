import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type FormData from 'form-data';
import {
  batchFiles,
  MAX_BYTES_PER_REQUEST,
  MAX_FILES_PER_REQUEST,
} from './uploadFiles';

/**
 * A `.feature` file as it was when the upload began: read once, hashed once.
 * The same bytes are uploaded, counted in a sync's manifest digest and
 * compared before --write_tags edits the file, so a file changed mid-upload
 * can never be tagged from a response about different content.
 */
export interface FeatureSnapshot {
  /** Absolute path on disk. */
  file: string;
  /** Path relative to the base directory, with forward slashes. Sent as filepaths[]. */
  relPath: string;
  bytes: Buffer;
  sha256: string;
}

export function sha256(bytes: Buffer | string): string {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export function snapshotFiles(
  files: string[],
  baseDir: string,
): FeatureSnapshot[] {
  return files.map((file) => {
    const bytes = fs.readFileSync(file);
    return {
      file,
      relPath: path.relative(baseDir, file).split(path.sep).join('/'),
      bytes,
      sha256: sha256(bytes),
    };
  });
}

/**
 * sha256 of the sorted "path:sha256" lines of every file in a sync run. The
 * server computes the same over what it received, and refuses to finalize
 * the run if they differ.
 */
export function manifestDigest(snapshots: FeatureSnapshot[]): string {
  const lines = snapshots.map((s) => `${s.relPath}:${s.sha256}`).sort();
  return sha256(lines.join('\n'));
}

/** Batch by file count and bytes, as batchFiles() does for paths. */
export function batchSnapshots(
  snapshots: FeatureSnapshot[],
  maxCount: number = MAX_FILES_PER_REQUEST,
  maxBytes: number = MAX_BYTES_PER_REQUEST,
): FeatureSnapshot[][] {
  const byFile = new Map(snapshots.map((s) => [s.file, s]));
  return batchFiles(
    snapshots.map((s) => ({ path: s.file, size: s.bytes.length })),
    maxCount,
    maxBytes,
  ).map((batch) => batch.map((file) => byFile.get(file)!));
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
