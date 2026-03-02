'use client';

import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import repoData from '../../data/repos.json';
import historyData from '../../data/history.json';
import { RepoCard } from '@/components/repo-card';
import { Repo } from '@/lib/types';

const repos = repoData as Repo[];
const history = historyData as Record<string, { date: string; stars: number }[]>;

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('stars');
  const [hideArchived, setHideArchived] = useState(true);

  const categories = useMemo(() => ['All', ...new Set(repos.map((r) => r.category))], []);
  const fuse = useMemo(() => new Fuse(repos, { keys: ['name', 'description', 'topics', 'category'], threshold: 0.35 }), []);

  const filtered = useMemo(() => {
    const base = query ? fuse.search(query).map((r) => r.item) : repos;
    const c = category === 'All' ? base : base.filter((r) => r.category === category);
    const a = hideArchived ? c.filter((r) => !r.archived) : c;
    return [...a].sort((x, y) => {
      if (sort === 'updated') return (Date.parse(y.lastCommit || '') || 0) - (Date.parse(x.lastCommit || '') || 0);
      if (sort === 'growth') {
        const dx = growth(x); const dy = growth(y);
        return dy - dx;
      }
      if (sort === 'alpha') return x.name.localeCompare(y.name);
      return (y.stars || 0) - (x.stars || 0);
    });
  }, [query, category, hideArchived, sort, fuse]);

  function growth(r: Repo) {
    const key = `${r.owner}/${r.repo}`;
    const series = history[key] || [];
    if (series.length < 2) return 0;
    return series[series.length - 1].stars - series[Math.max(0, series.length - 8)].stars;
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>Open Source Alternatives to Everything</h1>
        <p>Discover powerful FOSS replacements ranked by community trust.</p>
      </section>
      <section className="controls">
        <input placeholder="Search repositories..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="stars">Most stars</option>
          <option value="updated">Recently updated</option>
          <option value="growth">Fastest growing</option>
          <option value="alpha">Alphabetical</option>
        </select>
        <label><input type="checkbox" checked={hideArchived} onChange={() => setHideArchived((v) => !v)} /> Hide archived</label>
      </section>
      <section className="grid">
        {filtered.map((repo) => <RepoCard key={`${repo.owner}/${repo.repo}`} repo={repo} />)}
      </section>
    </main>
  );
}
