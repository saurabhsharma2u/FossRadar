import { ImageResponse } from 'next/og';
import repoData from '@/data/repos.json';
import { Repo } from '@/lib/types';

export const runtime = 'edge';
export const alt = 'FossRadar - Discover Better Open Source Alternatives';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    const repos = repoData as Repo[];
    const featured = repos.slice(0, 3);

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    padding: '80px',
                    border: '20px solid #1a1a1a',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                    <div
                        style={{
                            backgroundColor: '#6366f1',
                            color: 'white',
                            padding: '10px 20px',
                            fontSize: '60px',
                            fontWeight: 800,
                            border: '4px solid #1a1a1a',
                            boxShadow: '10px 10px 0px #1a1a1a',
                        }}
                    >
                        FOSS
                    </div>
                    <div style={{ fontSize: '60px', fontWeight: 800, marginLeft: '20px', letterSpacing: '-2px' }}>
                        RADAR
                    </div>
                </div>

                <div style={{ fontSize: '40px', fontWeight: 600, maxWidth: '900px', lineHeight: 1.2, marginBottom: '40px' }}>
                    Discover powerful Open Source alternatives to common SaaS tools.
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {featured.map((repo) => (
                        <div
                            key={repo.name}
                            style={{
                                background: '#f3f4f6',
                                padding: '15px 25px',
                                border: '3px solid #1a1a1a',
                                fontSize: '24px',
                                fontWeight: 700,
                            }}
                        >
                            {repo.name}
                        </div>
                    ))}
                    <div style={{ fontSize: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                        + 90 more
                    </div>
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
