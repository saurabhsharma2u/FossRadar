export type RepoRecord = {
  name: string;
  owner: string;
  repo: string;
  url: string;
  category: string;
  description?: string;
  stars?: number;
  forks?: number;
  license?: string;
  topics?: string[];
  language?: string;
  lastCommit?: string;
  archived?: boolean;
  homepage?: string;
  lastSynced?: string;
};

type GraphNode = {
  stargazerCount: number;
  forkCount: number;
  description: string | null;
  primaryLanguage: { name: string } | null;
  licenseInfo: { spdxId: string } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
  pushedAt: string;
  isArchived: boolean;
  homepageUrl: string | null;
};

export async function queryReposBatch(batch: RepoRecord[], token: string): Promise<GraphNode[]> {
  const selections = batch
    .map(
      (r, idx) => `r${idx}: repository(owner: \"${r.owner}\", name: \"${r.repo}\") {
      stargazerCount
      forkCount
      description
      primaryLanguage { name }
      licenseInfo { spdxId }
      repositoryTopics(first: 10) { nodes { topic { name } } }
      pushedAt
      isArchived
      homepageUrl
    }`
    )
    .join('\n');

  const query = `query { ${selections} }`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL failed: ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(JSON.stringify(json.errors));
  }

  return batch.map((_, idx) => json.data[`r${idx}`]).filter(Boolean);
}

export function mapGraphData(repo: RepoRecord, node: GraphNode): RepoRecord {
  return {
    ...repo,
    description: node.description ?? repo.description,
    stars: node.stargazerCount,
    forks: node.forkCount,
    license: node.licenseInfo?.spdxId ?? 'NOASSERTION',
    topics: node.repositoryTopics?.nodes?.map((n) => n.topic.name) ?? [],
    language: node.primaryLanguage?.name ?? 'Unknown',
    lastCommit: node.pushedAt,
    archived: node.isArchived,
    homepage: node.homepageUrl ?? ''
  };
}
