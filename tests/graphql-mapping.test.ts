import { describe, expect, it } from 'vitest';
import { mapGraphData } from '../lib/github';

describe('mapGraphData', () => {
  it('maps GraphQL node into repo', () => {
    const mapped = mapGraphData(
      { name: 'App', owner: 'o', repo: 'r', url: 'u', category: 'c' },
      {
        stargazerCount: 10,
        forkCount: 2,
        description: 'desc',
        primaryLanguage: { name: 'TypeScript' },
        licenseInfo: { spdxId: 'MIT' },
        repositoryTopics: { nodes: [{ topic: { name: 'foo' } }] },
        pushedAt: '2024-01-01T00:00:00Z',
        isArchived: false,
        homepageUrl: 'https://x.dev'
      }
    );

    expect(mapped.stars).toBe(10);
    expect(mapped.license).toBe('MIT');
    expect(mapped.topics).toEqual(['foo']);
  });
});
