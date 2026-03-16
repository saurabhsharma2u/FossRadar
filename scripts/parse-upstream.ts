import { readFile, writeFile } from 'node:fs/promises';
import { RepoRecord } from '../src/lib/github';
import { IGNORED_REPOS, UPSTREAMS } from '../src/lib/constants';

const DATA_FILE = 'src/data/repos.json';

function cleanName(text: string): string {
  // Strip Markdown links: [Name](URL) -> Name
  const match = text.match(/\[([^\]]+)\]/);
  return (match ? match[1] : text).trim();
}

function parseListMarkdown(md: string, isSelfHostable: boolean): RepoRecord[] {
  const lines = md.split('\n');
  let category = 'Uncategorized';
  const repos = new Map<string, RepoRecord>();

  for (const line of lines) {
    const heading = line.match(/^#{2,3}\s+(.+)/);
    if (heading) {
      const title = heading[1].trim();
      if (!['Table of contents', 'Contributing', 'Software'].includes(title)) {
        category = title;
      }
      continue;
    }

    const linkMatches = [...line.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi)];
    if (linkMatches.length === 0) continue;

    const filteredLinks = linkMatches.filter((m) => {
      const text = m[1].toLowerCase();
      return !text.includes('back to top') && !text.includes('demo') && !text.includes('source code');
    });

    const githubLinkMatch = linkMatches.find((m) => m[2].toLowerCase().includes('github.com'));
    if (!githubLinkMatch) continue;

    const name = cleanName((filteredLinks[0] || githubLinkMatch)[1]);
    const url = githubLinkMatch[2];

    const ghParts = url.match(/github\.com\/([^/\s)]+)\/([^/\s)#?]+)/i);
    if (ghParts) {
      const [, owner, repo] = ghParts;
      const key = `${owner}/${repo}`.toLowerCase();
      if (IGNORED_REPOS.includes(key)) continue;
      repos.set(key, {
        name,
        owner,
        repo,
        url,
        category,
        self_hostable: isSelfHostable || undefined,
      });
    }
  }
  return [...repos.values()];
}

function parseTableMarkdown(md: string, isSelfHostable: boolean): RepoRecord[] {
  const lines = md.split('\n');
  const repos = new Map<string, RepoRecord>();
  let count = 0;

  for (const line of lines) {
    if (!line.includes('|') || line.includes('---|')) continue;

    // Split by | and filter out empty cells from leading/trailing pipes
    const cells = line.split('|').map((c) => c.trim()).filter(c => c !== '');
    if (cells.length < 5) continue;

    const category = cells[0];
    if (category === 'Category') continue; // Header row
    const companyCell = cells[1];
    const alternativesCell = cells[4];

    // Clean up alternatives: extract only the names from [Name](URL) links
    const replaces = alternativesCell
      ? alternativesCell
          .split(',')
          .map((alt) => cleanName(alt.trim()))
          .filter((alt) => alt.length > 0)
      : undefined;

    // The company cell usually has the GitHub link.
    // We look for a clean GitHub link, avoiding capturing HTML attributes or tags.
    const githubLinkInRow = [...line.matchAll(/https?:\/\/github\.com\/([^/\s"'>)]+)\/([^/\s"'>)|]+)/gi)];

    if (githubLinkInRow.length > 0) {
      let url = githubLinkInRow[0][0];
      let owner = githubLinkInRow[0][1];
      let repo = githubLinkInRow[0][2];

      // Strip trailing ')' or other markdown punctuation if captured
      if (repo.endsWith(')')) {
        repo = repo.slice(0, -1);
        url = url.slice(0, -1);
      }
      if (repo.endsWith('"')) {
        repo = repo.slice(0, -1);
        url = url.slice(0, -1);
      }
      if (repo.endsWith('/')) {
        repo = repo.slice(0, -1);
        url = url.slice(0, -1);
      }

      const name = cleanName(companyCell);

      const key = `${owner}/${repo}`.toLowerCase();
      if (IGNORED_REPOS.includes(key)) continue;

      repos.set(key, {
        name,
        owner,
        repo,
        url,
        category,
        self_hostable: isSelfHostable || undefined,
        replaces: replaces && replaces.length > 0 ? replaces : undefined,
      });
      count++;
    }
  }
  return [...repos.values()];
}

export function parseMarkdown(md: string, isSelfHostable = false, format: 'list' | 'table' = 'list'): RepoRecord[] {
  if (format === 'table') {
    return parseTableMarkdown(md, isSelfHostable);
  }
  return parseListMarkdown(md, isSelfHostable);
}

async function main() {
  let allParsed: RepoRecord[] = [];

  for (const source of UPSTREAMS) {
    try {
      console.log(`Fetching from ${source.url}...`);
      const upstream = await fetch(source.url).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });
      const parsed = parseMarkdown(upstream, source.isSelfHostable, source.format);
      allParsed = [...allParsed, ...parsed];
    } catch (error) {
      console.error(`Failed to fetch ${source.url}:`, error);
    }
  }

  const parsedMap = new Map<string, RepoRecord>();
  for (const p of allParsed) {
    const key = `${p.owner}/${p.repo}`.toLowerCase();
    const existing = parsedMap.get(key);
    
    // When merging across upstreams in parsedMap
    const mergedReplaces = [...new Set([
      ...(existing?.replaces || []),
      ...(p.replaces || [])
    ])];

    parsedMap.set(key, { 
      ...existing, 
      ...p,
      replaces: mergedReplaces.length > 0 ? mergedReplaces : undefined
    });
  }

  let existing: RepoRecord[] = [];
  try {
    existing = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    existing = [];
  }

  const finalMap = new Map<string, RepoRecord>();
  const ignoredLower = IGNORED_REPOS.map(r => r.toLowerCase());

  for (const r of existing) {
    const key = `${r.owner}/${r.repo}`.toLowerCase();
    if (ignoredLower.includes(key)) continue;
    finalMap.set(key, r);
  }

  for (const p of parsedMap.values()) {
    const key = `${p.owner}/${p.repo}`.toLowerCase();
    if (ignoredLower.includes(key)) continue;
    
    const existingRepo = finalMap.get(key);
    
    // Merge logic: new data 'p' updates existing fields, 
    // but we carefully merge arrays and preserve existing metadata
    const mergedReplaces = [...new Set([
      ...(existingRepo?.replaces || []),
      ...(p.replaces || [])
    ])];

    // Clean 'p' to remove undefined/null fields before merging
    const cleanP = Object.fromEntries(
      Object.entries(p).filter(([_, v]) => v !== undefined && v !== null)
    );

    finalMap.set(key, { 
      ...existingRepo, 
      ...cleanP,
      replaces: mergedReplaces.length > 0 ? mergedReplaces : undefined
    });
  }

  const merged = Array.from(finalMap.values()).sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );

  await writeFile(DATA_FILE, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Success: Consolidated ${merged.length} unique repositories from multiple sources.`);
}

if (process.argv[1]?.includes('parse-upstream.ts')) {
  main();
}
