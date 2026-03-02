import { Repo } from '@/lib/types';

export function RepoCard({ repo }: { repo: Repo }) {
  return (
    <article className="card">
      <h3>{repo.name}</h3>
      <p>{repo.description || 'No description available.'}</p>
      <div className="stat">⭐ {repo.stars?.toLocaleString() || 0}</div>
      <div>Forks: {repo.forks?.toLocaleString() || 0}</div>
      <div className="meta">
        <span className="badge">{repo.language || 'Unknown'}</span>
        <span className="badge">{repo.license || 'NOASSERTION'}</span>
        {repo.archived ? <span className="badge">Archived</span> : null}
      </div>
      <small>Last updated: {repo.lastCommit ? new Date(repo.lastCommit).toLocaleDateString() : 'N/A'}</small>
      <div className="meta">
        {(repo.topics || []).slice(0, 4).map((topic) => (
          <span className="badge" key={topic}>#{topic}</span>
        ))}
      </div>
      <a className="link" href={repo.url} target="_blank">View on GitHub →</a>
    </article>
  );
}
