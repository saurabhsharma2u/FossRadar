import repoData from '../../data/repos.json';
import historyData from '../../data/history.json';
import RadarExplorer from '@/components/radar-explorer';
import { Repo } from '@/lib/types';

/**
 * Static Site Generation (SSG)
 * This page is pre-rendered at build time. Since it uses local JSON data,
 * Vercel will serve it as a static asset from the CDN edge for $0 
 * serverless invocation cost.
 * 
 * Revalidate every 24 hours just in case of background data updates.
 */
export const revalidate = 86400;

export default function HomePage() {
  const repos = repoData as Repo[];
  const history = historyData as Record<string, { date: string; stars: number }[]>;

  return (
    <main className="container">
      <RadarExplorer repos={repos} history={history} />
    </main>
  );
}
