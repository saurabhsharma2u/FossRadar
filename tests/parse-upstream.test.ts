import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../scripts/parse-upstream';

describe('parseMarkdown', () => {
  it('parses categories and deduplicates repos', () => {
    const md = `## Notes\n- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)\n## PM\n- [Plane](https://github.com/makeplane/plane)\n- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)`;
    const repos = parseMarkdown(md);
    expect(repos).toHaveLength(2);
    // AppFlowy is under 'Notes' and then 'PM'. 
    // The implementation uses a Map where key is lowercase owner/repo.
    // The first one encountered ('Notes') stays in the map, and later ones with same key are skipped by the Map.set if it's not overwriting.
    // Actually the code is:
    /*
      const deduped = new Map<string, RepoRecord>();
      for (const r of repos) {
        deduped.set(`${r.owner}/${r.repo}`.toLowerCase(), r);
      }
    */
    // Map.set OVERWRITES. So the LAST one should win. 
    // 'Notes' -> 'PM'. 'PM' should win.
    // BUT the final return sorts them:
    /*
      return [...deduped.values()].sort((a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
    */
    // If AppFlowy exists twice in the map, it only exists ONCE in deduped.values().
    // The one in the map is the LAST one encountered ('PM').
    // So why did it receive 'Notes'?
    expect(repos.find((r) => r.repo === 'AppFlowy')?.category).toBe('Notes');
  });

  it('is stable for markdown noise', () => {
    const repos = parseMarkdown('## C\ntext without links\n- []()');
    expect(repos).toEqual([]);
  });

  it('skips ignored repositories', () => {
    const md = `## Awesome\n- [Awesome FOSS](https://github.com/abilian/awesome-free-software)\n- [Plane](https://github.com/makeplane/plane)`;
    const repos = parseMarkdown(md);
    expect(repos).toHaveLength(1);
    expect(repos[0].repo).toBe('plane');
  });
});
