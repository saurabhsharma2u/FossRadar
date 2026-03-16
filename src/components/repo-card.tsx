import { Repo } from '@/lib/types';
import { useState } from 'react';

function getActivityStatus(lastCommit?: string, latestReleaseDate?: string) {
  if (!lastCommit) return null;

  const lastDate = new Date(lastCommit);
  const now = new Date();
  const commitDiffMonths = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  let releaseDiffMonths = -1;
  if (latestReleaseDate) {
    const releaseDate = new Date(latestReleaseDate);
    releaseDiffMonths = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  if (commitDiffMonths < 3) {
    if (releaseDiffMonths !== -1 && releaseDiffMonths > 24) {
      return { label: 'Slowing', class: 'stale', title: 'Active commits but no recent releases' };
    }
    return { label: 'Active', class: 'active', title: 'Recent activity' };
  } else if (commitDiffMonths < 12) {
    if (releaseDiffMonths !== -1 && releaseDiffMonths > 12) {
      return { label: 'At Risk', class: 'stale', title: 'Infrequent commits and no recent releases' };
    }
    return { label: `Slowing (${commitDiffMonths}mo)`, class: 'stale', title: `Slowing activity, last commit ${commitDiffMonths} months ago` };
  } else {
    const years = Math.floor(commitDiffMonths / 12);
    return {
      label: years >= 1 ? `At Risk (${years}yr+)` : `At Risk (${commitDiffMonths}mo+)`,
      class: 'abandoned',
      title: 'Project appears to be at risk of abandonment'
    };
  }
}

function getRelativeTime(dateString?: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function RepoCard({ repo, isExternal = false, sparklineData }: { repo: Repo; isExternal?: boolean; sparklineData?: number[] }) {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const status = getActivityStatus(repo.lastCommit, repo.latestRelease?.publishedAt);

  const relativeTime = getRelativeTime(repo.lastCommit);
  const absoluteTime = repo.lastCommit ? new Date(repo.lastCommit).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';

  const lastReleaseTime = repo.latestRelease?.publishedAt ? new Date(repo.latestRelease.publishedAt) : null;
  const lastCommitTime = repo.lastCommit ? new Date(repo.lastCommit) : null;
  
  // Flag the gap when last commit >> last release (e.g. 6 months)
  const showStaleReleaseWarning = lastReleaseTime && lastCommitTime && 
    (lastCommitTime.getTime() - lastReleaseTime.getTime() > 1000 * 60 * 60 * 24 * 180);

  const getUrl = () => `${window.location.origin}/${repo.owner}/${repo.repo}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(getUrl()).then(() => {
      setCopied(true);
      setIsShareOpen(false);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleXShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const replacements = repo.replaces?.join(', ') || repo.alternatives || 'SaaS tools';
    const text = `Discovering ${repo.name} - an incredible FOSS alternative to ${replacements}! 🚀\n\n${getUrl()}\n\n#FossRadar #OpenSource @FossRadar`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noreferrer');
    setIsShareOpen(false);
  };

  const hasReplacements = (repo.replaces && repo.replaces.length > 0) || repo.alternatives;

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 60;
    const height = 15;
    
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isGrowing = sparklineData[sparklineData.length - 1] >= sparklineData[0];
    const color = isGrowing ? '#10b981' : '#ef4444';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '60px', height: '15px', overflow: 'visible', marginLeft: '0.5rem' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <article className="card">
      <div className="card-meta">
        <span className="badge lang">{repo.language || 'Unknown'}</span>
        {status && <span className={`badge ${status.class}`} title={status.title}>{status.label}</span>}
        {repo.archived && <span className="badge abandoned">ARCHIVED</span>}
        {repo.self_hostable && (
          <span className="badge" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#10b981' }}>
            SELF-HOSTABLE
          </span>
        )}
        {repo.hasFunding && (
          <span className="badge" style={{ background: '#fdf2f8', color: '#be185d', borderColor: '#f43f5e' }} title="Project accepts funding/sponsorships">
            💖 FUNDED
          </span>
        )}
        {repo.securityAudit?.hasAudit && (
          <a 
            href={repo.securityAudit.reportUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="badge" 
            style={{ background: '#f0fdf4', color: '#0369a1', borderColor: '#38bdf8', textDecoration: 'none' }} 
            title="Third-party security audit completed"
          >
            🛡️ AUDITED
          </a>
        )}
      </div>

      <a href={`/${repo.owner}/${repo.repo}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ margin: '1rem 0 0.5rem 0' }}>{repo.name}</h3>
      </a>

      {hasReplacements && (
        <div style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <span style={{ opacity: 0.6 }}>REPLACES: </span>
          <span style={{ color: 'var(--secondary)' }}>
            {repo.replaces ? (
              repo.replaces.map((tool, idx) => (
                <span key={tool}>
                  <a href={`/alternatives-to-${slugify(tool)}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{tool}</a>
                  {idx < repo.replaces!.length - 1 ? ', ' : ''}
                </span>
              ))
            ) : (
              repo.alternatives?.split(',').map((tool, idx, arr) => (
                <span key={tool}>
                  <a href={`/alternatives-to-${slugify(tool.trim())}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{tool.trim()}</a>
                  {idx < arr.length - 1 ? ', ' : ''}
                </span>
              ))
            )}
          </span>
        </div>
      )}

      <p style={{ opacity: 0.8, fontSize: '1rem', lineHeight: '1.4' }}>
        {repo.description || 'No description provided by the maintainer.'}
      </p>

      <div className="card-stats" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          ⭐ {repo.stars?.toLocaleString() || 0}
          {renderSparkline()}
        </span>
        <span style={{ marginLeft: '1rem' }}>🔱 {repo.forks?.toLocaleString() || 0}</span>
      </div>

      {repo.latestRelease && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge" style={{ background: 'var(--accent)', color: '#000', padding: '0.1rem 0.4rem', border: '2px solid var(--border)', boxShadow: '2px 2px 0px var(--border)', fontSize: '0.6rem' }}>
            v{repo.latestRelease.tagName}
          </span>
          <span style={{ opacity: 0.6 }}>
            Released {getRelativeTime(repo.latestRelease.publishedAt)}
          </span>
          {showStaleReleaseWarning && (
            <span title="Last commit is much newer than the last release - possible unmaintained release line" style={{ cursor: 'help' }}>
              ⚠️
            </span>
          )}
        </div>
      )}

      <div className="card-meta" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        {repo.license && <span className="badge license">{repo.license}</span>}
        {(repo.platforms || []).map((platform) => {
          const icons: Record<string, string> = {
            Linux: '🐧', macOS: '🍎', Windows: '🪟', Docker: '🐳', Web: '🌐', iOS: '📱', Android: '🤖'
          };
          return (
            <span className="badge" key={platform} style={{ background: '#e0f2fe', color: '#831843', borderColor: '#be185d' }} title={`Supports ${platform}`}>
              {icons[platform] || '📦'} {platform}
            </span>
          );
        })}
        {(repo.topics || []).slice(0, 3).map((topic) => (
          <span className="badge" key={topic} style={{ background: 'transparent', opacity: 0.7 }}>#{topic}</span>
        ))}
      </div>

      <div className="card-footer">
        <small
          title={`Last Commit: ${absoluteTime}`}
          style={{
            fontWeight: 950,
            opacity: 0.5,
            cursor: 'help',
            textDecoration: 'underline dotted',
            textUnderlineOffset: '4px',
            fontSize: '0.75rem'
          }}
        >
          {relativeTime}
        </small>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div className="share-container">
            <button
              className="btn-link"
              onClick={() => setIsShareOpen(!isShareOpen)}
              style={{
                background: copied ? '#10b981' : 'var(--accent)',
                color: copied ? '#fff' : '#000',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem'
              }}
            >
              {copied ? 'COPIED!' : 'SHARE'}
            </button>

            {isShareOpen && (
              <div className="share-dropdown">
                <button className="share-item" onClick={handleCopy}>
                  📋 Copy Link
                </button>
                <button className="share-item" onClick={handleXShare}>
                  𝕏 Share on X
                </button>
              </div>
            )}
          </div>

          <a
            className="btn-link"
            href={isExternal ? repo.url : `/${repo.owner}/${repo.repo}`}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
          >
            EXPLORE →
          </a>
        </div>
      </div>
    </article>
  );
}
