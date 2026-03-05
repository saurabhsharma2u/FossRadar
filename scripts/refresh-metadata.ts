import { readFile, writeFile } from 'node:fs/promises';
import { mapGraphData, queryReposBatch, RepoRecord } from '../src/lib/github';

const DATA_FILE = 'src/data/repos.json';
const HISTORY_FILE = 'src/data/history.json';
const CHUNK_SIZE = 30;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function runBatch(batch: RepoRecord[], token: string) {
  try {
    return await queryReposBatch(batch, token);
  } catch {
    return await queryReposBatch(batch, token);
  }
}

async function main() {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN is required');

  const repos: RepoRecord[] = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  const now = new Date().toISOString();

  const batches = chunk(repos, CHUNK_SIZE);
  const refreshed: RepoRecord[] = [];

  for (const batch of batches) {
    let nodes: Record<string, any>;
    try {
      // Fetch the batch as a dictionary of results
      const res = await runBatch(batch, token);
      nodes = res;
    } catch (error) {
      console.warn('Batch failed; preserving previous metadata for this chunk', error);
      refreshed.push(...batch);
      continue;
    }

    batch.forEach((existing, idx) => {
      const node = nodes[`r${idx}`];
      if (node) {
        console.log(`Refreshed: ${existing.owner}/${existing.repo}`);
        refreshed.push({ ...mapGraphData(existing, node), lastSynced: now });
      } else {
        console.warn(`Missing data for ${existing.owner}/${existing.repo}; preserving existing.`);
        refreshed.push(existing);
      }
    });
  }

  let history: Record<string, { date: string; stars: number }[]> = {};
  try {
    history = JSON.parse(await readFile(HISTORY_FILE, 'utf8'));
  } catch {
    history = {};
  }

  for (const repo of refreshed) {
    const key = `${repo.owner}/${repo.repo}`;
    history[key] = history[key] ?? [];
    if (typeof repo.stars === 'number') {
      const prev = history[key][history[key].length - 1];
      if (!prev || prev.stars !== repo.stars) {
        history[key].push({ date: now, stars: repo.stars });
      }
    }
  }

  await writeFile(DATA_FILE, `${JSON.stringify(refreshed, null, 2)}\n`);
  await writeFile(HISTORY_FILE, `${JSON.stringify(history, null, 2)}\n`);
}

main();
