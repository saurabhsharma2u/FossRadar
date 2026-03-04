import repoData from '@/data/repos.json';
import historyData from '@/data/history.json';
import { RepoCard } from '@/components/repo-card';
import { Repo } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    const repos = repoData as Repo[];
    return repos.map((r) => ({
        owner: r.owner,
        repo: r.repo,
    }));
}

export default async function RepoPage({ params }: { params: Promise<{ owner: string; repo: string }> }) {
    const { owner, repo: repoName } = await params;
    const repos = repoData as Repo[];
    const history = historyData as Record<string, { date: string; stars: number }[]>;

    const repo = repos.find(
        (r) => r.owner.toLowerCase() === owner.toLowerCase() && r.repo.toLowerCase() === repoName.toLowerCase()
    );

    if (!repo) {
        notFound();
    }

    return (
        <main className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <RepoCard repo={repo} isExternal={true} />
            </div>

            <Link href="/" className="btn-link" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                ← BACK TO RADAR
            </Link>
        </main>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ owner: string; repo: string }> }) {
    const { owner, repo: repoName } = await params;
    const repos = repoData as Repo[];
    const repo = repos.find(
        (r) => r.owner.toLowerCase() === owner.toLowerCase() && r.repo.toLowerCase() === repoName.toLowerCase()
    );

    if (!repo) return {};

    const title = `${repo.name} | FOSS Alternative to ${repo.alternatives || 'SaaS'}`;
    const description = repo.description || `Discover ${repo.name}, a powerful open-source alternative to ${repo.alternatives || 'common SaaS tools'}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        }
    };
}
