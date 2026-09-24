import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Writable } from 'stream';
import type FormData from 'form-data';

/** Serialize a multipart form (including file streams) to a string. */
export async function serializeForm(form: FormData): Promise<string> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const sink = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(Buffer.from(chunk));
        cb();
      },
    });
    sink.on('finish', resolve);
    sink.on('error', reject);
    form.on('error', reject);
    form.pipe(sink);
  });
  return Buffer.concat(chunks).toString('utf8');
}

/** Count parts with the given field name in a serialized form. */
export function countParts(body: string, name: string): number {
  const escaped = name.replace(/[[\]]/g, '\\$&');
  return (body.match(new RegExp(`name="${escaped}"`, 'g')) ?? []).length;
}

/** Read the value of a plain text field from a serialized form. */
export function fieldValue(body: string, name: string): string | undefined {
  const escaped = name.replace(/[[\]]/g, '\\$&');
  const m = body.match(new RegExp(`name="${escaped}"\\r\\n\\r\\n([^\\r]*)`));
  return m?.[1];
}

/** Create `n` small files in a fresh temp directory; returns their paths. */
export function makeTempFiles(n: number, ext = '.feature'): string[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tq-cli-test-'));
  const files: string[] = [];
  for (let i = 0; i < n; i++) {
    const file = path.join(dir, `f${String(i).padStart(4, '0')}${ext}`);
    fs.writeFileSync(file, `Feature: f${i}\n`);
    files.push(file);
  }
  return files;
}

/**
 * Create sparse files of the given byte sizes in a fresh temp directory.
 * `truncate` extends without writing, so large sizes cost no disk or time.
 */
export function makeSizedTempFiles(sizes: number[], ext = '.json'): string[] {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tq-cli-test-'));
  return sizes.map((size, i) => {
    const file = path.join(dir, `s${i}${ext}`);
    fs.writeFileSync(file, '');
    fs.truncateSync(file, size);
    return file;
  });
}
