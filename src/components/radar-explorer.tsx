import Fuse from 'fuse.js';
import { useMemo, useState, useEffect } from 'react';
import { RepoCard } from '@/components/repo-card';
import { Repo } from '@/lib/types';

interface ExplorerProps {
    repos: Repo[];
    history: Record<string, { date: string; stars: number }[]>;
}

export default function RadarExplorer({ repos, history }: ExplorerProps) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [language, setLanguage] = useState('All');
    const [sort, setSort] = useState('stars');
    const [hideArchived, setHideArchived] = useState(true);
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        setVisibleCount(12);
    }, [query, category, language, sort, hideArchived]);

    const categories = useMemo(() => ['All', ...new Set(repos.map((r) => r.category))].sort(), [repos]);
    const languages = useMemo(() => ['All', ...new Set(repos.map((r) => r.language).filter(Boolean) as string[])].sort(), [repos]);

    const fuse = useMemo(() => new Fuse(repos, {
        keys: ['name', 'description', 'topics', 'category', 'alternatives'],
        threshold: 0.35
    }), [repos]);

    const filtered = useMemo(() => {
        const base = query ? fuse.search(query).map((r) => r.item) : repos;
        const c = category === 'All' ? base : base.filter((r) => r.category === category);
        const l = language === 'All' ? c : c.filter((r) => r.language === language);
        const a = hideArchived ? l.filter((r) => !r.archived) : l;

        return [...a].sort((x, y) => {
            if (sort === 'updated') return (Date.parse(y.lastCommit || '') || 0) - (Date.parse(x.lastCommit || '') || 0);
            if (sort === 'growth') {
                const dx = growth(x);
                const dy = growth(y);
                return dy - dx;
            }
            if (sort === 'alpha') return x.name.localeCompare(y.name);
            return (y.stars || 0) - (x.stars || 0);
        });
    }, [query, category, language, hideArchived, sort, fuse, repos]);

    const displayed = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

    useEffect(() => {
        if (visibleCount >= filtered.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + 12, filtered.length));
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [visibleCount, filtered.length]);

    function growth(r: Repo) {
        const key = `${r.owner}/${r.repo}`;
        const series = history[key] || [];
        if (series.length < 2) return 0;
        return series[series.length - 1].stars - series[Math.max(0, series.length - 8)].stars;
    }

    return (
        <>

            <section className="hero">
                <div style={{
                    background: 'var(--accent)',
                    color: '#000',
                    padding: '0.4rem 1rem',
                    fontWeight: 950,
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                    border: '3px solid var(--border)',
                    boxShadow: '4px 4px 0px var(--border)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#f43f5e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                    {repos.length} OSS TRACKED
                </div>
                <h1>Discover Open Source Alternatives.</h1>
                <p>A soft-brutalist radar for uncovering incredible Free and Open Source software replacements for common SaaS tools.</p>
            </section>

            <section className="controls">
                <div className="control-item">
                    <label htmlFor="search">Find Alternatives</label>
                    <input
                        id="search"
                        placeholder="Search software..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="control-item">
                    <label htmlFor="category">Filter Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="control-item">
                    <label htmlFor="language">Language</label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>

                <div className="control-item">
                    <label htmlFor="sort">Sort Results</label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="stars">MOST STARS</option>
                        <option value="updated">RECENT UPDATED</option>
                        <option value="growth">FASTEST GROWTH</option>
                        <option value="alpha">ALPHABETICAL</option>
                    </select>
                </div>

                <div className="control-item checkbox">
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}>
                        <input
                            style={{ width: 'auto', border: '2px solid', boxShadow: 'none' }}
                            type="checkbox"
                            checked={hideArchived}
                            onChange={() => setHideArchived((v) => !v)}
                        />
                        HIDE ARCHIVED
                    </label>
                </div>
            </section>

            <section className="grid">
                {displayed.map((repo) => (
                    <RepoCard key={`${repo.owner}/${repo.repo}`} repo={repo} />
                ))}
            </section>

            <div style={{ marginTop: '2rem', textAlign: 'right', fontWeight: 950, fontSize: '0.9rem', textTransform: 'uppercase', opacity: 0.6 }}>
                Showing {displayed.length} of {filtered.length} radar signals
            </div>

            <div id="scroll-sentinel" style={{ height: '3rem', margin: '2rem 0' }}>
                {visibleCount < filtered.length && (
                    <div style={{ textAlign: 'center', fontWeight: 950, textTransform: 'uppercase', opacity: 0.5 }}>
                        — EXTENDING RADAR RANGE —
                    </div>
                )}
            </div>

            {filtered.length > 0 && visibleCount >= filtered.length && (
                <div style={{ textAlign: 'center', margin: '3rem 0', fontWeight: 950, textTransform: 'uppercase', opacity: 0.3 }}>
                    — EDGE OF VISIBLE FOSS GALAXY —
                </div>
            )}

            {filtered.length === 0 && (
                <div className="card" style={{ padding: '5rem', textAlign: 'center', backgroundColor: 'var(--secondary)', color: '#fff' }}>
                    <h2 style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-2px' }}>SIGNAL LOST</h2>
                    <p style={{ fontSize: '1.2rem', maxWidth: '100%', opacity: 1 }}>We couldn't find any FOSS alternatives for your search. Try adjusting your filters or suggesting a new repository!</p>
                </div>
            )}
        </>
    );
}
