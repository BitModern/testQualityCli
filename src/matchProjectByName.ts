export interface NamedProject {
  id: number;
  name: string;
}

/**
 * Pick the project called `name`.
 *
 * An exact (case-sensitive) match wins. Otherwise fall back to a
 * case-insensitive match, but only if it is unambiguous: when "Alpha" and
 * "ALPHA" both exist and the user asked for "alpha", guessing could send the
 * upload to the wrong project, so list the candidates instead.
 */
export function matchProjectByName<T extends NamedProject>(
  projects: T[],
  name: string,
): T {
  const exact = projects.filter((p) => p.name === name);
  if (exact.length === 1) {
    return exact[0];
  }
  const candidates =
    exact.length > 1
      ? exact
      : projects.filter((p) => p.name.toLowerCase() === name.toLowerCase());
  if (candidates.length === 1) {
    return candidates[0];
  }
  if (candidates.length > 1) {
    const list = candidates.map((p) => `"${p.name}" (id ${p.id})`).join(', ');
    throw new Error(
      `Project name "${name}" is ambiguous; it matches ${list}. ` +
        'Use --project_id=<id> instead.',
    );
  }
  throw new Error(`Project "${name}" not found`);
}
