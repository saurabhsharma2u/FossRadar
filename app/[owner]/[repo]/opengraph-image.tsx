import { ImageResponse } from 'next/og';
import repoData from '@/data/repos.json';
import { Repo } from '@/lib/types';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ owner: string; repo: string }> }) {
    const { owner, repo: repoName } = await params;
    const repos = repoData as Repo[];
    const repo = repos.find(
        (r) => r.owner.toLowerCase() === owner.toLowerCase() && r.repo.toLowerCase() === repoName.toLowerCase()
    );

    if (!repo) {
        return new Response('Not found', { status: 404 });
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#ffffff',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    fontFamily: 'sans-serif',
                    padding: '60px 80px',
                }}
            >
                {/* Branding Header Row */}
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            background: '#5c6bc0',
                            color: 'white',
                            fontSize: '44px',
                            fontWeight: 900,
                            padding: '10px 20px',
                            border: '4px solid #1a1a1a',
                            boxShadow: '8px 8px 0px #1a1a1a',
                            letterSpacing: '-1.5px'
                        }}>
                            FOSS
                        </div>
                        <div style={{
                            display: 'flex',
                            fontSize: '48px',
                            fontWeight: 900,
                            color: '#1a1a1a',
                            marginLeft: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '-2px'
                        }}>
                            RADAR
                        </div>
                    </div>

                    {/* Social Handle */}
                    <div style={{
                        display: 'flex',
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#1a1a1a',
                        opacity: 0.6
                    }}>
                        GITHUB /FossRadar
                    </div>
                </div>

                {/* Divider Line */}
                <div style={{ display: 'flex', width: '100%', height: '5px', background: '#1a1a1a', marginBottom: '35px' }} />

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '15px' }}>
                    <div style={{
                        display: 'flex',
                        fontSize: '110px',
                        fontWeight: 900,
                        color: '#1a1a1a',
                        lineHeight: 0.9,
                        letterSpacing: '-4px'
                    }}>
                        {repo.name}
                    </div>

                    <div style={{
                        display: 'flex',
                        fontSize: '34px',
                        color: '#1a1a1a',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        maxWidth: '1000px',
                        marginBottom: '10px'
                    }}>
                        {repo.description?.slice(0, 140) || 'Discover a powerful open source alternative.'}{repo.description?.length && repo.description.length > 140 ? '...' : ''}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {repo.language && (
                            <div style={{
                                display: 'flex',
                                background: '#ffeb3b',
                                color: '#1a1a1a',
                                padding: '6px 15px',
                                fontSize: '22px',
                                fontWeight: 900,
                                border: '3px solid #1a1a1a',
                                boxShadow: '4px 4px 0px #1a1a1a'
                            }}>
                                {repo.language.toUpperCase()}
                            </div>
                        )}

                        {repo.self_hostable && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#4ade80',
                                color: '#1a1a1a',
                                padding: '6px 15px',
                                fontSize: '20px',
                                fontWeight: 900,
                                border: '3px solid #1a1a1a',
                                boxShadow: '4px 4px 0px #1a1a1a'
                            }}>
                                <span style={{ marginRight: '8px' }}>🏠</span> SELF-HOSTABLE
                            </div>
                        )}

                        {repo.alternatives && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#f5f5f5',
                                border: '3px solid #1a1a1a',
                                padding: '6px 15px',
                                boxShadow: '4px 4px 0px #1a1a1a'
                            }}>
                                <span style={{ fontSize: '18px', fontWeight: 900, color: '#1a1a1a', opacity: 0.6, marginRight: '10px' }}>REPLACES:</span>
                                <span style={{ fontSize: '22px', fontWeight: 900, color: '#1a1a1a', textTransform: 'uppercase' }}>{repo.alternatives}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Footer */}
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '32px', fontWeight: 900 }}>
                            ⭐ {repo.stars?.toLocaleString() || 0}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '32px', fontWeight: 900 }}>
                            🔱 {repo.forks?.toLocaleString() || 0}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: 'auto',
                        fontSize: '22px',
                        fontWeight: 800,
                        opacity: 0.5
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.472-4.041-1.472-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        {repo.owner}/{repo.repo}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
