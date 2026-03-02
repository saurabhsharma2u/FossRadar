import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../scripts/parse-upstream';

describe('parseMarkdown', () => {
  it('parses categories and deduplicates repos', () => {
    const md = `## Notes\n- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)\n## PM\n- [Plane](https://github.com/makeplane/plane)\n- [AppFlowy](https://github.com/AppFlowy-IO/AppFlowy)`;
    const repos = parseMarkdown(md);
    expect(repos).toHaveLength(2);
    expect(repos.find((r) => r.repo === 'AppFlowy')?.category).toBe('Notes');
  });

  it('is stable for markdown noise', () => {
    const repos = parseMarkdown('## C\ntext without links\n- []()');
    expect(repos).toEqual([]);
  });
});
