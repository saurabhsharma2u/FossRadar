export default function Footer() {
    return (
        <footer style={{
            marginTop: '6rem',
            padding: '3rem 0',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
        }}>
            <div style={{ fontWeight: 700, textTransform: 'lowercase', letterSpacing: '-0.02em', fontSize: '1rem' }}>
                foss<span style={{ color: 'var(--accent)' }}>radar</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px', lineHeight: '1.5' }}>
                A curated radar for discovering powerful Free and Open Source software replacements for common SaaS tools.
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                <a href="https://github.com/saurabhsharma2u/FossRadar" target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: '0.75rem', fontWeight: 600 }}>GitHub</a>
                <a href="https://x.com/FossRadar" target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: '0.75rem', fontWeight: 600 }}>𝕏 / @FossRadar</a>
                <a href="https://github.com/saurabhsharma2u/FossRadar/issues/new?template=suggest_project.yml" target="_blank" rel="noreferrer" className="btn-link" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Suggest a Project</a>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                © {new Date().getFullYear()} — BUILT BY <a href="https://saurabh.app" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>SAURABH</a>
            </div>
        </footer>
    );
}
