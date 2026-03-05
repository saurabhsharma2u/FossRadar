import { readFile, writeFile } from 'node:fs/promises';
import { RepoRecord } from '../src/lib/github';

const UPSTREAMS = [
  'https://raw.githubusercontent.com/sfermigier/awesome-foss-alternatives/refs/heads/main/README.md',
];
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

    const match = line.match(/\[([^\]]+)\]\((https?:\/\/github\.com\/([^/\s)]+)\/([^/\s)#?]+))\)/i);
    if (match) {
      const [, name, url, owner, repo] = match;
      repos.push({ name: name.trim(), owner, repo, url, category });
    }
  }

  const deduped = new Map<string, RepoRecord>();
  for (const r of repos) {
    const key = `${r.owner}/${r.repo}`.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, r);
    }
  }

  return [...deduped.values()].sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

async function main() {
  let allParsed: RepoRecord[] = [];

  for (const url of UPSTREAMS) {
    try {
      console.log(`Fetching from ${url}...`);
      const upstream = await fetch(url).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
      const parsed = parseMarkdown(upstream);
      allParsed = [...allParsed, ...parsed];
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
    }
  }

  // Deduplicate across all sources
  const parsedMap = new Map<string, RepoRecord>();
  for (const p of allParsed) {
    parsedMap.set(`${p.owner}/${p.repo}`.toLowerCase(), p);
  }

  let existing: RepoRecord[] = [];
  try {
    existing = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    existing = [];
  }

  // Start with existing records to ensure manual entries are preserved
  const finalMap = new Map<string, RepoRecord>();
  for (const r of existing) {
    const key = `${r.owner}/${r.repo}`.toLowerCase();
    finalMap.set(key, r);
  }

  // Overwrite/Add with new parsed results from upstream
  for (const p of parsedMap.values()) {
    const key = `${p.owner}/${p.repo}`.toLowerCase();
    const existingRepo = finalMap.get(key);
    // Merge: Upstream 'p' updates name/url/category, but we keep existing additional metadata
    finalMap.set(key, { ...existingRepo, ...p });
  }

  const merged = Array.from(finalMap.values()).sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );

  await writeFile(DATA_FILE, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Success: Consolidated ${merged.length} unique repositories from multiple sources.`);
}

if (process.argv[1]?.includes('parse-upstream.ts')) {
  main();
}
