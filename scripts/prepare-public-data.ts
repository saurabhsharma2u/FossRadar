import { readFile, writeFile, mkdir } from 'node:fs/promises';

const REPOS_SRC = 'src/data/repos.json';
const HISTORY_SRC = 'src/data/history.json';
const OUT_DIR = 'public/data';

// Keep only what the index explorer needs: last N points, short dates.
// Detail pages still use the full src/data/history.json at prerender time,
// so no fidelity loss there.
const KEEP_POINTS = 30;

function shortDate(iso: string): string {
  // '2026-03-02T11:27:23.610Z' -> '2026-03-02'
  return iso.slice(0, 10);
}

async function main() {
  const repos = JSON.parse(await readFile(REPOS_SRC, 'utf8'));
  const history: Record<string, { date: string; stars: number }[]> = JSON.parse(
    await readFile(HISTORY_SRC, 'utf8')
  );

  const slim: Record<string, { date: string; stars: number }[]> = {};
  for (const [key, series] of Object.entries(history)) {
    const tail = series.slice(-KEEP_POINTS);
    slim[key] = tail.map((p) => ({ date: shortDate(p.date), stars: p.stars }));
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/repos.json`, JSON.stringify(repos));
  await writeFile(`${OUT_DIR}/history.json`, JSON.stringify(slim));

  const fullBytes = (await readFile(HISTORY_SRC, 'utf8')).length;
  const slimBytes = JSON.stringify(slim).length;
  console.log(
    `public/data written: repos=${repos.length}, history series=${Object.keys(slim).length}, history ${fullBytes} -> ${slimBytes} bytes`
  );
}

main();
