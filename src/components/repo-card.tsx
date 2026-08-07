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

  if (commitDiffMonths < 6) {
    if (releaseDiffMonths !== -1 && releaseDiffMonths > 24) {
      return { label: 'Slowing', statusClass: 'status-warning', title: 'Active commits but no recent releases' };
    }
    return { label: 'Active', statusClass: 'status-active', title: 'Recent activity' };
  } else if (commitDiffMonths < 18) {
    if (releaseDiffMonths !== -1 && releaseDiffMonths > 18) {
      return { label: 'At Risk', statusClass: 'status-warning', title: 'Infrequent commits and no recent releases' };
    }
    return { label: `Slowing (${commitDiffMonths}mo)`, statusClass: 'status-warning', title: `Slowing activity, last commit ${commitDiffMonths} months ago` };
  } else {
    const years = Math.floor(commitDiffMonths / 12);
    return {
      label: years >= 1 ? `At Risk (${years}yr+)` : `At Risk (${commitDiffMonths}mo+)`,
      statusClass: 'status-warning',
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
    const width = 50;
    const height = 12;
    
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const isGrowing = sparklineData[sparklineData.length - 1] >= sparklineData[0];
    const color = isGrowing ? 'var(--accent)' : 'var(--warning)';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '40px', height: '10px', overflow: 'visible', marginLeft: '0.25rem', display: 'inline-block', verticalAlign: 'middle' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <article className="card">
      <div className="card-title-row">
        <a href={`/${repo.owner}/${repo.repo}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{repo.name}</h3>
        </a>
        
        {/* Muted active/status text label (replacing neon pills) */}
        {repo.archived ? (
          <span className="status-text status-warning">Archived</span>
        ) : status ? (
          <span className={`status-text ${status.statusClass}`} title={status.title}>
            {status.label}
          </span>
        ) : null}
      </div>

      {hasReplacements && (
        <div className="card-replaces">
          <span>replaces: </span>
          <span>
            {repo.replaces ? (
              repo.replaces.map((tool, idx) => (
                <span key={tool}>
                  <a href={`/alternatives-to-${slugify(tool)}`}>{tool}</a>
                  {idx < repo.replaces!.length - 1 ? ', ' : ''}
                </span>
              ))
            ) : (
              repo.alternatives?.split(',').map((tool, idx, arr) => (
                <span key={tool}>
                  <a href={`/alternatives-to-${slugify(tool.trim())}`}>{tool.trim()}</a>
                  {idx < arr.length - 1 ? ', ' : ''}
                </span>
              ))
            )}
          </span>
        </div>
      )}

      <p>
        {repo.description || 'No description provided by the maintainer.'}
      </p>

      {/* Muted Data Meta Row strictly in Monospace */}
      <div className="meta-row">
        {repo.stars !== undefined && (
          <span className="meta-item" title={`${repo.stars.toLocaleString()} stars`}>
            {repo.stars.toLocaleString()} stars
            {renderSparkline()}
          </span>
        )}
        
        {repo.forks !== undefined && (
          <>
            <span className="meta-dot"></span>
            <span className="meta-item">{repo.forks.toLocaleString()} forks</span>
          </>
        )}

        {repo.language && (
          <>
            <span className="meta-dot"></span>
            <span className="meta-item">
              <span className="meta-lang-dot"></span>
              {repo.language}
            </span>
          </>
        )}

        {repo.license && (
          <>
            <span className="meta-dot"></span>
            <span className="meta-item">{repo.license}</span>
          </>
        )}

        {repo.self_hostable && (
          <>
            <span className="meta-dot"></span>
            <span className="meta-item" style={{ color: 'var(--accent)', fontWeight: 600 }}>self-hostable</span>
          </>
        )}

        {repo.hasFunding && (
          <>
            <span className="meta-dot"></span>
            <span className="meta-item" style={{ color: 'var(--accent)', fontWeight: 600 }} title="Project accepts funding/sponsorships">♥ sponsored</span>
          </>
        )}

        {repo.latestRelease && (
          <>
            <span className="meta-dot"></span>
            <span className="meta-item" title={`Released ${getRelativeTime(repo.latestRelease.publishedAt)}`}>
              {repo.latestRelease.tagName.toLowerCase().startsWith('v') ? repo.latestRelease.tagName : `v${repo.latestRelease.tagName}`}
            </span>
            {showStaleReleaseWarning && (
              <span className="meta-item" title="Outdated release line" style={{ color: 'var(--warning)', cursor: 'help', marginLeft: '-2px' }}>
                !
              </span>
            )}
          </>
        )}
      </div>

      <div className="card-footer">
        <span className="relative-time" title={`Last commit: ${absoluteTime}`}>
          {relativeTime}
        </span>

        <div className="card-actions">
          <div className="share-dropdown-wrapper">
            <button
              className="card-link"
              onClick={() => setIsShareOpen(!isShareOpen)}
              style={{ color: copied ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {copied ? 'copied' : 'share'}
            </button>

            {isShareOpen && (
              <div className="share-popover">
                <button className="share-popover-item" onClick={handleCopy}>
                  Copy link
                </button>
                <button className="share-popover-item" onClick={handleXShare}>
                  Share on X
                </button>
              </div>
            )}
          </div>

          <a
            className="card-link"
            href={isExternal ? repo.url : `/${repo.owner}/${repo.repo}`}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            style={{ fontWeight: 600, color: 'var(--text)' }}
          >
            explore
          </a>
        </div>
      </div>
    </article>
  );
}
