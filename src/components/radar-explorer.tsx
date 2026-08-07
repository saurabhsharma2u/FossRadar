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
    const [license, setLicense] = useState('All');
    const [sort, setSort] = useState('stars');
    const [hideArchived, setHideArchived] = useState(true);
    const [onlySelfHostable, setOnlySelfHostable] = useState(false);
    const [onlyFunded, setOnlyFunded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.getElementById('search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setVisibleCount(12);
    }, [query, category, language, license, sort, hideArchived, onlySelfHostable, onlyFunded]);

    const categories = useMemo(() => ['All', ...new Set(repos.map((r) => r.category))].sort(), [repos]);
    const languages = useMemo(() => ['All', ...new Set(repos.map((r) => r.language).filter(Boolean) as string[])].sort(), [repos]);
    const licenses = useMemo(() => {
        const allLicenses = repos.map((r) => r.license).filter(Boolean) as string[];
        return ['All', 'Commercial-safe (MIT/Apache)', ...new Set(allLicenses)].sort();
    }, [repos]);

    const filtered = useMemo(() => {
        let base = repos.filter(r => r.stars !== undefined || r.description);
        
        if (query) {
            const fuseResult = new Fuse(base, {
                keys: ['name', 'description', 'topics', 'category', 'alternatives', 'replaces', 'license'],
                threshold: 0.35
            });
            base = fuseResult.search(query).map((r) => r.item);
        }
        
        if (category !== 'All') base = base.filter((r) => r.category === category);
        if (language !== 'All') base = base.filter((r) => r.language === language);
        
        if (license !== 'All') {
            if (license === 'Commercial-safe (MIT/Apache)') {
                base = base.filter((r) => ['MIT', 'Apache-2.0'].includes(r.license || ''));
            } else {
                base = base.filter((r) => r.license === license);
            }
        }
        
        if (hideArchived) base = base.filter((r) => !r.archived);
        if (onlySelfHostable) base = base.filter((r) => r.self_hostable);
        if (onlyFunded) base = base.filter((r) => r.hasFunding);

        return [...base].sort((x, y) => {
            if (sort === 'updated') return (Date.parse(y.lastCommit || '') || 0) - (Date.parse(x.lastCommit || '') || 0);
            if (sort === 'growth') {
                const dx = growth(x);
                const dy = growth(y);
                return dy - dx;
            }
            if (sort === 'alpha') return x.name.localeCompare(y.name);
            return (y.stars || 0) - (x.stars || 0);
        });
    }, [query, category, language, license, hideArchived, onlySelfHostable, onlyFunded, sort, repos]);

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

    function getSparkline(r: Repo) {
        const key = `${r.owner}/${r.repo}`;
        const series = history[key] || [];
        if (series.length < 2) return undefined;
        return series.slice(-10).map(s => s.stars);
    }

    const risingStars = useMemo(() => {
        if (query || category !== 'All' || language !== 'All' || license !== 'All' || onlySelfHostable) return [];
        return repos
            .filter(r => (r.stars !== undefined || r.description) && (r.stars || 0) < 5000 && !r.archived)
            .sort((a, b) => growth(b) - growth(a))
            .slice(0, 3)
            .filter(r => growth(r) > 0);
    }, [repos, history, query, category, language, license, onlySelfHostable]);

    return (
        <>
            <section className="hero">
                <div style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    marginBottom: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%' }}></span>
                    {repos.filter(r => r.stars !== undefined || r.description).length} open source tools tracked
                </div>
                <h1>Discover open source alternatives.</h1>
                <p>A directory of Free and Open Source replacements for common proprietary SaaS tools.</p>
            </section>

            <div className="controls-container">
                {/* Mobile Trigger Button */}
                <button 
                    className="controls-trigger-btn"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                    {mobileFiltersOpen ? 'Hide Filters' : 'Filter & Sort'}
                </button>

                <section className={`controls controls-panel-mobile ${mobileFiltersOpen ? 'open' : ''}`}>
                    <div className="search-wrapper">
                        <input
                            id="search"
                            className="search-input"
                            placeholder="Find alternatives to Notion, Firebase..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <span className="search-kbd">⌘/</span>
                    </div>

                    <div className="control-item">
                        <label htmlFor="category">Category</label>
                        <div className="select-wrapper">
                            <select
                                id="category"
                                className="select-filter"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="control-item">
                        <label htmlFor="language">Language</label>
                        <div className="select-wrapper">
                            <select
                                id="language"
                                className="select-filter"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="control-item">
                        <label htmlFor="license">License</label>
                        <div className="select-wrapper">
                            <select
                                id="license"
                                className="select-filter"
                                value={license}
                                onChange={(e) => setLicense(e.target.value)}
                            >
                                {licenses.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="control-item">
                        <label htmlFor="sort">Sort</label>
                        <div className="select-wrapper">
                            <select
                                id="sort"
                                className="select-filter"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="stars">Most Stars</option>
                                <option value="updated">Recently Updated</option>
                                <option value="growth">Fastest Growth</option>
                                <option value="alpha">Alphabetical</option>
                            </select>
                        </div>
                    </div>

                    <div className="control-item checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={hideArchived}
                                onChange={() => setHideArchived((v) => !v)}
                            />
                            Hide Archived
                        </label>
                    </div>

                    <div className="control-item checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={onlySelfHostable}
                                onChange={() => setOnlySelfHostable((v) => !v)}
                            />
                            Self-Hostable Only
                        </label>
                    </div>

                    <div className="control-item checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={onlyFunded}
                                onChange={() => setOnlyFunded((v) => !v)}
                            />
                            Funded Only
                        </label>
                    </div>
                </section>
            </div>

            {/* Rising Stars section with clean header & subtle arc sweep divider */}
            {risingStars.length > 0 && (
                <section style={{ marginBottom: '4rem', position: 'relative' }}>
                    {/* The signature radar sweep arc (deliberate single risk) */}
                    <svg className="radar-arc-svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                        <path d="M 10 90 A 80 80 0 0 1 90 90" stroke="currentColor" strokeWidth="0.75" />
                        <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>

                    <div className="section-header">
                        <div className="section-label">Rising Under the Radar · Fastest growing &lt;5k stars</div>
                        <hr className="hairline-rule" />
                    </div>
                    
                    <div className="grid">
                        {risingStars.map((repo) => (
                            <RepoCard key={`rising-${repo.owner}/${repo.repo}`} repo={repo} sparklineData={getSparkline(repo)} />
                        ))}
                    </div>
                </section>
            )}

            <div className="section-header">
                <div className="section-label">All tools ({filtered.length})</div>
                <hr className="hairline-rule" />
            </div>

            <section className="grid">
                {displayed.map((repo) => (
                    <RepoCard key={`${repo.owner}/${repo.repo}`} repo={repo} sparklineData={getSparkline(repo)} />
                ))}
            </section>

            <div style={{ marginTop: '2rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                showing {displayed.length} of {filtered.length} alternatives
            </div>

            <div id="scroll-sentinel" style={{ height: '3rem', margin: '2rem 0' }}>
                {visibleCount < filtered.length && (
                    <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        extending radar sweep range
                    </div>
                )}
            </div>

            {filtered.length > 0 && visibleCount >= filtered.length && (
                <div style={{ textAlign: 'center', margin: '3rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                    end of list
                </div>
            )}

            {filtered.length === 0 && (
                <div style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--warning)', marginBottom: '0.5rem' }}>Signal Lost</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>We couldn't find any FOSS alternatives for your search query. Try modifying your filter criteria.</p>
                </div>
            )}
        </>
    );
}
