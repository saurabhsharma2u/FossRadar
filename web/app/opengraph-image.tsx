import { ImageResponse } from 'next/og';
import repoData from '../../data/repos.json';
import { Repo } from '@/lib/types';

export const runtime = 'edge';

export const alt = 'FossRadar | Find Open Source Alternatives';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    padding: '60px 80px 80px 80px',
                }}
            >
                {/* Branding Header Row */}
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            background: '#5c6bc0',
                            color: 'white',
                            fontSize: '48px',
                            fontWeight: 900,
                            padding: '12px 24px',
                            border: '4px solid #1a1a1a',
                            boxShadow: '10px 10px 0px #1a1a1a',
                            letterSpacing: '-1.5px'
                        }}>
                            FOSS
                        </div>
                        <div style={{
                            display: 'flex',
                            fontSize: '52px',
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
                <div style={{ display: 'flex', width: '100%', height: '5px', background: '#1a1a1a', marginBottom: '60px' }} />

                {/* Main Headline */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '88px',
                    fontWeight: 900,
                    color: '#1a1a1a',
                    lineHeight: 0.85,
                    textTransform: 'uppercase',
                    marginBottom: '50px',
                    letterSpacing: '-3px'
                }}>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>DISCOVER OPEN SOURCE</div>
                    <div style={{ display: 'flex' }}>ALTERNATIVES.</div>
                </div>

                {/* Subtext */}
                <div style={{
                    display: 'flex',
                    fontSize: '34px',
                    color: '#1a1a1a',
                    fontWeight: 500,
                    maxWidth: '1040px',
                    lineHeight: 1.3
                }}>
                    A soft-brutalist radar for uncovering incredible Free and Open Source software replacements for common SaaS tools.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
