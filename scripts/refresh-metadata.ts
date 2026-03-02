import { readFile, writeFile } from 'node:fs/promises';
import { mapGraphData, queryReposBatch, RepoRecord } from '../lib/github';

const DATA_FILE = 'data/repos.json';
const HISTORY_FILE = 'data/history.json';
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
    let nodes;
    try {
      nodes = await runBatch(batch, token);
    } catch (error) {
      console.warn('Batch failed; preserving previous metadata', error);
      refreshed.push(...batch);
      continue;
    }

    for (let i = 0; i < batch.length; i++) {
      const node = nodes[i];
      const existing = batch[i];
      refreshed.push(node ? { ...mapGraphData(existing, node), lastSynced: now } : existing);
    }
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
