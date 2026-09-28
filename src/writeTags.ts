import * as fs from 'fs';
import { type FeatureSnapshot, sha256 } from './featureSnapshot';

/** One scenario as the server reports it in scenarios[]. */
export interface ScenarioReport {
  path: string;
  line: number;
  keyword: string;
  feature?: string;
  scenario: string;
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
 * - the line above does not already carry a key.
 * Anything else is skipped with a warning. Each file keeps its line endings
 * and indentation and is replaced atomically (written aside, then renamed).
 */
export function writeTags(
  snapshots: FeatureSnapshot[],
  scenarios: ScenarioReport[],
  dryRun: boolean,
): WriteTagsResult {
  const result: WriteTagsResult = { tags: [], files: [], warnings: [] };
  const byPath = new Map(snapshots.map((s) => [s.relPath, s]));

  const pending = new Map<string, ScenarioReport[]>();
  for (const scenario of scenarios) {
    if (scenario.supplied_key !== null && scenario.supplied_key !== undefined) {
      if (scenario.status !== 'resolved') {
        result.warnings.push(
          `${scenario.path}:${scenario.line} "${scenario.scenario}" carries a key that did not resolve (${scenario.status}); left as it is.`,
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
    const snapshot = byPath.get(relPath);
    if (!snapshot) {
      result.warnings.push(
        `${relPath}: reported by the server but not uploaded by this run; not tagged.`,
      );
      continue;
    }
    const current = fs.readFileSync(snapshot.file);
    if (sha256(current) !== snapshot.sha256) {
      result.warnings.push(
        `${relPath}: changed since it was uploaded; not tagged. Run --write_tags again.`,
      );
      continue;
    }
    const text = current.toString('utf8');
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = text.split(eol);
    let changed = false;

    // Bottom up, so inserting a line never moves one still to be tagged.
    for (const scenario of [...list].sort((a, b) => b.line - a.line)) {
      const index = scenario.line - 1;
      const match = SCENARIO_LINE.exec(lines[index] ?? '');
      if (
        !match ||
        match[2] !== scenario.keyword ||
        match[3] !== scenario.scenario
      ) {
        result.warnings.push(
          `${relPath}:${scenario.line} is not "${scenario.keyword}: ${scenario.scenario}"; not tagged.`,
        );
        continue;
      }
      if (index > 0 && TC_TAG.test(lines[index - 1])) {
        continue;
      }
      const key = scenario.resolved_key!;
      result.tags.push({
        relPath,
        line: scenario.line,
        key,
        scenario: scenario.scenario,
      });
      lines.splice(index, 0, `${match[1]}@TC${key}`);
      changed = true;
    }

    if (changed && !dryRun) {
      const temp = `${snapshot.file}.tq-write-tags-${process.pid}`;
      fs.writeFileSync(temp, lines.join(eol));
      fs.renameSync(temp, snapshot.file);
      result.files.push(relPath);
    }
  }
  result.tags.sort(
    (a, b) => a.relPath.localeCompare(b.relPath) || a.line - b.line,
  );
  return result;
}
