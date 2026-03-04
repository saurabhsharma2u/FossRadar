import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import repoData from '../data/repos.json';
import type { Repo } from '../lib/types';
import fs from 'fs';

export const GET = async () => {
    const repos = repoData as Repo[];
    const featured = repos.slice(0, 3);
    const fontData = fs.readFileSync('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');

    const featuredCards = featured.map((repo: Repo) =>
        `<div style="background: #fbbf24; padding: 10px 20px; border: 3px solid #0a0a0a; box-shadow: 4px 4px 0px #0a0a0a; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${repo.name}</div>`
    ).join('');

    const fullHtml = `
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background-color: #ffffff; border: 12px solid #0a0a0a; padding: 64px 72px; position: relative; justify-content: space-between;">

            <div style="display: flex; align-items: center;">
                <div style="background-color: #6366f1; color: white; padding: 8px 20px; font-size: 42px; font-weight: 900; border: 4px solid #0a0a0a; box-shadow: 6px 6px 0px #0a0a0a; letter-spacing: -1px;">
                    FOSS
                </div>
                <div style="font-size: 42px; font-weight: 900; margin-left: 16px; letter-spacing: -2px; color: #0a0a0a;">
                    RADAR
                </div>
                <div style="margin-left: auto; font-size: 18px; font-weight: 700; color: #6366f1; border: 3px solid #6366f1; padding: 6px 16px;">
                    fossradar.dev
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="font-size: 52px; font-weight: 900; color: #0a0a0a; letter-spacing: -2px; line-height: 1.1; display: flex; flex-direction: column;">
                    <div>Open Source alternatives</div>
                    <div>to common SaaS tools.</div>
                </div>
                <div style="font-size: 22px; font-weight: 500; color: #6b7280;">
                    Curated. Tracked. Open.
                </div>
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
                ${featuredCards}
                <div style="font-size: 18px; font-weight: 700; color: #6b7280; margin-left: 4px;">
                    + ${repos.length - 3} more tools
                </div>
            </div>

        </div>
    `;

    const markup = html(fullHtml);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = await satori(markup as any, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Inter',
                data: fontData,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const imageBuffer = resvg.render().asPng();

    return new Response(new Uint8Array(imageBuffer), {
        headers: { 'Content-Type': 'image/png' },
    });
};
