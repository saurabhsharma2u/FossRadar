import { useState, useEffect } from 'react';

export default function Navbar() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'dark';
        setTheme(saved);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    return (
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="brand">
                    <span>FOSS</span>RADAR
                </div>
            </a>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center' }}>
                <a
                    href="https://github.com/saurabhsharma2u/FossRadar"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-link"
                    style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.472-4.041-1.472-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    STAR<span className="hide-mobile"> ON GITHUB</span>
                </a>

                <div className="hide-mobile" style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.6 }}>
                    <a href="https://github.com/saurabhsharma2u" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>@saurabh</a>
                </div>

                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === 'dark' ? '🌞' : '🌒'}
                </button>
            </div>
        </header>
    );
}
