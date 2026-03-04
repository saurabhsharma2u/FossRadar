import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import repoData from '../../../data/repos.json';
import type { Repo } from '../../../lib/types';
import fs from 'fs';

export function getStaticPaths() {
    const repos = repoData as Repo[];
    return repos.map((r) => ({
        params: { owner: r.owner, repo: r.repo },
        props: { repo: r },
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const repo = props.repo as Repo;
    const fontData = fs.readFileSync('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');

    const stars = repo.stars ? (repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : `${repo.stars}`) : '0';
    const forks = repo.forks ? (repo.forks >= 1000 ? `${(repo.forks / 1000).toFixed(1)}k` : `${repo.forks}`) : '0';

    const alternativeBadge = repo.alternatives
        ? `<div style="display: flex; background-color: #fbbf24; padding: 8px 24px; font-size: 22px; font-weight: 900; border: 4px solid #0a0a0a; box-shadow: 5px 5px 0px #0a0a0a; text-transform: uppercase; letter-spacing: 1px;">
               Alternative to ${repo.alternatives}
           </div>`
        : '';

    const langBadge = repo.language
        ? `<div style="display: flex; background: #f3f4f6; padding: 6px 14px; border: 2px solid #0a0a0a; font-size: 16px; font-weight: 700;">${repo.language}</div>`
        : '';

    const licenseBadge = repo.license
        ? `<div style="display: flex; background: #ede9fe; padding: 6px 14px; border: 2px solid #6366f1; font-size: 16px; font-weight: 700; color: #4338ca;">${repo.license}</div>`
        : '';

    const selfHostBadge = repo.self_hostable
        ? `<div style="display: flex; background: #dcfce7; padding: 6px 14px; border: 2px solid #16a34a; font-size: 16px; font-weight: 700; color: #15803d;">SELF-HOSTABLE</div>`
        : '';

    const fullHtml = `
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background-color: #ffffff; border: 12px solid #0a0a0a; padding: 56px 68px; justify-content: space-between;">

            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                    <div style="display: flex; background-color: #6366f1; color: white; padding: 6px 16px; font-size: 28px; font-weight: 900; border: 4px solid #0a0a0a; box-shadow: 4px 4px 0px #0a0a0a; letter-spacing: -1px;">
                        FOSS
                    </div>
                    <div style="display: flex; font-size: 28px; font-weight: 900; margin-left: 12px; letter-spacing: -1.5px; color: #0a0a0a;">
                        RADAR
                    </div>
                </div>
                <div style="display: flex; font-size: 16px; font-weight: 700; color: #6b7280;">
                    foss-radar.saurabh.app
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; font-size: 80px; font-weight: 900; color: #0a0a0a; letter-spacing: -3px; line-height: 1;">
                    ${repo.name}
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    ${alternativeBadge}
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; font-size: 22px; font-weight: 500; color: #374151; line-height: 1.4; max-width: 900px;">
                    ${repo.description ? repo.description.slice(0, 110) + (repo.description.length > 110 ? '…' : '') : ''}
                </div>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 18px; font-weight: 800; color: #0a0a0a;">
                        <div style="display: flex;">⭐</div>
                        <div style="display: flex;">${stars}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 18px; font-weight: 800; color: #0a0a0a;">
                        <div style="display: flex;">🔱</div>
                        <div style="display: flex;">${forks}</div>
                    </div>
                    ${langBadge}
                    ${licenseBadge}
                    ${selfHostBadge}
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
