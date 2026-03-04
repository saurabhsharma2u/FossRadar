export default function Footer() {
    return (
        <footer style={{
            marginTop: '4rem',
            padding: '2rem 0',
            borderTop: '3px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            opacity: 0.8
        }}>
            <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                FOSS RADAR © {new Date().getFullYear()}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Curated with ❤️ for the Open Source Community
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <a href="https://github.com/saurabhsharma2u/FossRadar" target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: 900, textDecoration: 'none', borderBottom: '2px solid' }}>REPO</a>
                <a href="https://github.com/saurabhsharma2u" target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: 900, textDecoration: 'none', borderBottom: '2px solid' }}>DEVELOPER</a>
                <a href="https://github.com/saurabhsharma2u/FossRadar/issues" target="_blank" rel="noreferrer" style={{ color: 'inherit', fontWeight: 900, textDecoration: 'none', borderBottom: '2px solid' }}>SUGGESTIONS</a>
            </div>
        </footer>
    );
}
