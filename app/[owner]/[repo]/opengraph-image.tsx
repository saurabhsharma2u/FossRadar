import { ImageResponse } from 'next/og';
import repoData from '@/data/repos.json';
import { Repo } from '@/lib/types';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ owner: string; repo: string }> }) {
    const { owner, repo: repoName } = await params;
    const repos = repoData as Repo[];
    const repo = repos.find(
        (r) => r.owner.toLowerCase() === owner.toLowerCase() && r.repo.toLowerCase() === repoName.toLowerCase()
    );

    if (!repo) return new Response('Not Found', { status: 404 });

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    padding: '80px',
                    border: '20px solid #1a1a1a',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '10px 20px', fontSize: '32px', fontWeight: 800, border: '4px solid #1a1a1a' }}>FOSS</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, marginLeft: '10px' }}>RADAR</div>
                </div>

                <div style={{ fontSize: '100px', fontWeight: 900, textAlign: 'center', marginBottom: '20px', letterSpacing: '-4px' }}>
                    {repo.name}
                </div>

                <div
                    style={{
                        backgroundColor: '#fbbf24',
                        padding: '10px 30px',
                        fontSize: '40px',
                        fontWeight: 800,
                        border: '4px solid #1a1a1a',
                        boxShadow: '8px 8px 0px #1a1a1a',
                        marginBottom: '40px'
                    }}
                >
                    ALTERNATIVE TO {repo.alternatives?.toUpperCase() || 'SAAS'}
                </div>

                <div style={{ fontSize: '30px', fontWeight: 500, color: '#4b5563', textAlign: 'center', maxWidth: '800px' }}>
                    {repo.description}
                </div>

                <div style={{ position: 'absolute', bottom: '80px', right: '80px', fontSize: '24px', fontWeight: 800, color: '#6366f1' }}>
                    X /FossRadar
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
