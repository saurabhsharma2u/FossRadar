import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../scripts/parse-upstream';

describe('parseMarkdown', () => {
  it('parses categories and deduplicates repos', () => {
    const md = `## Notes\n- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)\n## PM\n- [Plane](https://github.com/makeplane/plane)\n- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)`;
    const repos = parseMarkdown(md);
    expect(repos).toHaveLength(2);
    // Since AppFlowy is repeated, the last category found should win
    expect(repos.find((r) => r.repo === 'AppFlowy')?.category).toBe('PM');
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
