import { Repo } from '@/lib/types';

export function RepoCard({ repo }: { repo: Repo }) {
  const lastUpdate = repo.lastCommit ? new Date(repo.lastCommit).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';

  return (
    <article className="card">
      <div className="card-meta">
        <span className="badge lang">{repo.language || 'Code'}</span>
        {repo.archived && <span className="badge" style={{ backgroundColor: '#ff5555', color: 'white' }}>ARCHIVED</span>}
      </div>

      <h3>{repo.name}</h3>
      <p>{repo.description || 'No description provided by the maintainer.'}</p>

      <div className="card-stats">
        <span>⭐ {repo.stars?.toLocaleString() || 0}</span>
        <span>🔱 {repo.forks?.toLocaleString() || 0}</span>
      </div>

      <div className="card-meta">
        <span className="badge license">{repo.license || 'Open'}</span>
        {(repo.topics || []).slice(0, 3).map((topic) => (
          <span className="badge" key={topic}>#{topic}</span>
        ))}
      </div>

      <div className="card-footer">
        <small>Updated: {lastUpdate}</small>
        <a className="btn-link" href={repo.url} target="_blank" rel="noopener noreferrer">
          EXPLORE →
        </a>
      </div>
    </article>
  );
}
