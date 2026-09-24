import { describe, expect, it } from 'vitest';
import { matchProjectByName } from '../src/matchProjectByName';

describe('matchProjectByName', () => {
  it('prefers an exact match over a case-insensitive one', () => {
    // Case-insensitive candidates listed first, so a plain .find() on the
    // lowercased name would pick the wrong project.
    const projects = [
      { id: 1, name: 'ALPHA' },
      { id: 2, name: 'alpha' },
      { id: 3, name: 'Alpha' },
    ];
    expect(matchProjectByName(projects, 'Alpha').id).toBe(3);
    expect(matchProjectByName(projects, 'alpha').id).toBe(2);
  });

  it('falls back to a unique case-insensitive match', () => {
    const projects = [
      { id: 1, name: 'Beta' },
      { id: 2, name: 'My Project' },
    ];
    expect(matchProjectByName(projects, 'my project').id).toBe(2);
  });

  it('errors listing the candidates when the fallback is ambiguous', () => {
    const projects = [
      { id: 10, name: 'Alpha' },
      { id: 11, name: 'ALPHA' },
      { id: 12, name: 'Gamma' },
    ];
    expect(() => matchProjectByName(projects, 'alpha')).toThrowError(
      /ambiguous.*"Alpha" \(id 10\).*"ALPHA" \(id 11\).*--project_id/,
    );
    let message = '';
    try {
      matchProjectByName(projects, 'alpha');
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).not.toContain('Gamma');
  });

  it('errors when nothing matches', () => {
    expect(() =>
      matchProjectByName([{ id: 1, name: 'Alpha' }], 'Delta'),
    ).toThrowError('Project "Delta" not found');
    expect(() => matchProjectByName([], 'Delta')).toThrowError(
      'Project "Delta" not found',
    );
  });
});
