import { readFile, writeFile } from 'node:fs/promises';
import { RepoRecord } from '../lib/github';

const UPSTREAM =
  'https://raw.githubusercontent.com/saurabhsharma2u/awesome-foss-alternatives/refs/heads/main/README.md';
const DATA_FILE = 'data/repos.json';

export function parseMarkdown(md: string): RepoRecord[] {
  const lines = md.split('\n');
  let category = 'Uncategorized';
  const repos: RepoRecord[] = [];

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      category = heading[1].trim();
      continue;
    }

    const match = line.match(/\[([^\]]+)\]\((https?:\/\/github\.com\/([^/\s)]+)\/([^/\s)#?]+)\)/i);
    if (match) {
      const [, name, url, owner, repo] = match;
      repos.push({ name: name.trim(), owner, repo, url, category });
    }
  }

  const deduped = new Map<string, RepoRecord>();
  for (const r of repos) {
    deduped.set(`${r.owner}/${r.repo}`.toLowerCase(), r);
  }

  return [...deduped.values()].sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

async function main() {
  const upstream = await fetch(UPSTREAM).then((r) => r.text());
  const parsed = parseMarkdown(upstream);

  let existing: RepoRecord[] = [];
  try {
    existing = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    existing = [];
  }

  const byKey = new Map(existing.map((r) => [`${r.owner}/${r.repo}`.toLowerCase(), r]));
  const merged = parsed.map((p) => ({ ...byKey.get(`${p.owner}/${p.repo}`.toLowerCase()), ...p }));

  await writeFile(DATA_FILE, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Parsed ${merged.length} repositories`);
}

if (process.argv[1]?.includes('parse-upstream.ts')) {
  main();
}
