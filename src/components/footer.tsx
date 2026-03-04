export default function Footer() {
    return (
        <footer style={{
            marginTop: '6rem',
            padding: '4rem 0',
            borderTop: '4px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
        }}>
            <div style={{ fontWeight: 950, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem' }}>
                FOSS RADAR
            </div>

            <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.6, textAlign: 'center', maxWidth: '400px', lineHeight: '1.5' }}>
                A curated radar for discovering powerful Free and Open Source software replacements for common SaaS tools.
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                <a href="https://github.com/saurabhsharma2u/FossRadar" target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>GITHUB</a>
                <a href="https://x.com/FossRadar" target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>𝕏 / FOSSRADAR</a>
                <a href="https://github.com/saurabhsharma2u/FossRadar/issues" target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>SUGGEST</a>
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.75rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase' }}>
                © {new Date().getFullYear()} — BUILT BY <a href="https://github.com/saurabhsharma2u" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>SAURABH</a>
            </div>
        </footer>
    );
}
