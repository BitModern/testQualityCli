import * as fs from 'fs';
import { sha256, type UploadedFile } from './featureSnapshot';

/** One scenario as the server reports it in scenarios[]. */
export interface ScenarioReport {
  path: string;
  line: number;
  keyword: string;
  feature?: string;
  /**
   * Behat's scenario title: the text after the keyword, followed by any
   * description lines ("Title\nDescription"), or null when empty.
   */
  scenario: string | null;
  supplied_key: number | number[] | null;
  resolved_key: number | null;
  status: string;
}

export interface TagWrite {
  relPath: string;
  line: number;
  key: number;
  scenario: string;
}

export interface WriteTagsResult {
  /** Tags inserted (or, for a dry run, that would be). */
  tags: TagWrite[];
  /** Files written. Empty for a dry run. */
  files: string[];
  warnings: string[];
}

const SCENARIO_LINE =
  /^([ \t]*)(Scenario Outline|Scenario Template|Scenario|Example):[ \t]*(.*?)[ \t]*$/;
const TC_TAG = /(^|\s)@TC-?\d+(\s|$)/i;

/**
 * Write `@TC<key>` above every untagged scenario, from the server's report of
 * where each scenario is and which test it landed on (--write_tags).
 *
 * A tag is written only where it is certainly right:
 * - the file on disk is still byte for byte what was uploaded;
 * - the reported line holds that scenario's keyword and title;
 * - no tag line directly above it already carries a key.
 * Anything else is skipped with a warning. Each line keeps its own line
 * ending and each file its permissions; a file is replaced atomically
 * (written aside, then renamed), and a file that cannot be written is left
 * as it was.
 */
export function writeTags(
  uploaded: UploadedFile[],
  scenarios: ScenarioReport[],
  dryRun: boolean,
): WriteTagsResult {
  const result: WriteTagsResult = { tags: [], files: [], warnings: [] };
  const byPath = new Map(uploaded.map((u) => [u.relPath, u]));

  const pending = new Map<string, ScenarioReport[]>();
  for (const scenario of scenarios) {
    if (scenario.supplied_key !== null && scenario.supplied_key !== undefined) {
      if (scenario.status !== 'resolved') {
        result.warnings.push(
          `${scenario.path}:${scenario.line} "${titleLine(scenario.scenario)}" carries a key that did not resolve (${scenario.status}); left as it is.`,
        );
      }
      continue;
    }
    if (scenario.resolved_key === null || scenario.resolved_key === undefined) {
      continue;
    }
    pending.set(scenario.path, [
      ...(pending.get(scenario.path) ?? []),
      scenario,
    ]);
  }

  for (const [relPath, list] of pending) {
    const upload = byPath.get(relPath);
    if (!upload) {
      result.warnings.push(
        `${relPath}: reported by the server but not uploaded by this run; not tagged.`,
      );
      continue;
    }
    const current = fs.readFileSync(upload.file);
    if (sha256(current) !== upload.sha256) {
      result.warnings.push(
        `${relPath}: changed since it was uploaded; not tagged. Run --write_tags again.`,
      );
      continue;
    }
    const { lines, eols } = splitLines(current.toString('utf8'));
    let changed = false;

    // Bottom up, so inserting a line never moves one still to be tagged.
    for (const scenario of [...list].sort((a, b) => b.line - a.line)) {
      const index = scenario.line - 1;
      const match = SCENARIO_LINE.exec(lines[index] ?? '');
      // Only the title is on the keyword line; description lines follow it.
      const title = titleLine(scenario.scenario);
      if (!match || match[2] !== scenario.keyword || match[3] !== title) {
        result.warnings.push(
          `${relPath}:${scenario.line} is not "${scenario.keyword}: ${title}"; not tagged.`,
        );
        continue;
      }
      if (tagLinesAbove(lines, index).some((tags) => TC_TAG.test(tags))) {
        continue;
      }
      const key = scenario.resolved_key!;
      result.tags.push({ relPath, line: scenario.line, key, scenario: title });
      // The new line ends the way the scenario's own line does.
      lines.splice(index, 0, `${match[1]}@TC${key}`);
      eols.splice(index, 0, eols[index] || eols[index - 1] || '\n');
      changed = true;
    }

    if (changed && !dryRun) {
      const error = replaceFile(
        upload.file,
        lines.map((line, i) => line + eols[i]).join(''),
      );
      if (error) {
        result.warnings.push(
          `${relPath}: could not be written (${error}); left unchanged.`,
        );
      } else {
        result.files.push(relPath);
      }
    }
  }
  result.tags.sort(
    (a, b) => a.relPath.localeCompare(b.relPath) || a.line - b.line,
  );
  return result;
}

/** Lines and the terminator after each ('' for a last line without one). */
function splitLines(text: string): { lines: string[]; eols: string[] } {
  const parts = text.split(/(\r\n|\n|\r)/);
  const lines: string[] = [];
  const eols: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    lines.push(parts[i]);
    eols.push(parts[i + 1] ?? '');
  }
  return { lines, eols };
}

/**
 * The tag lines directly above a scenario, skipping comments, as Gherkin
 * reads them. A comment that mentions @TC is not a tag.
 */
function tagLinesAbove(lines: string[], index: number): string[] {
  const tags: string[] = [];
  for (let i = index - 1; i >= 0; i--) {
    const text = lines[i].trim();
    if (text.startsWith('@')) {
      tags.push(text);
    } else if (!text.startsWith('#')) {
      break;
    }
  }
  return tags;
}

/**
 * Write beside the file, keeping its permissions, then rename over it. On
 * failure the temporary file is removed and the original left untouched.
 */
function replaceFile(file: string, content: string): string | null {
  const temp = `${file}.tq-write-tags-${process.pid}`;
  try {
    fs.writeFileSync(temp, content, { mode: fs.statSync(file).mode });
    fs.renameSync(temp, file);
    return null;
  } catch (error) {
    try {
      fs.unlinkSync(temp);
    } catch {
      // nothing to clean up
    }
    return error instanceof Error ? error.message : String(error);
  }
}

/** The first line of a reported title, as written after the keyword. */
function titleLine(scenario: string | null): string {
  return (scenario ?? '').split('\n')[0].trim();
}
