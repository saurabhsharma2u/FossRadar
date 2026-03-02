"use client";

import { Repo } from '@/lib/types';
import Link from 'next/link';
import { useState, useEffect } from 'react';

function getActivityStatus(lastCommit?: string) {
  if (!lastCommit) return null;

  const lastDate = new Date(lastCommit);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

  if (diffMonths < 6) {
    return { label: 'Active', class: 'active', title: 'Recent activity' };
  } else if (diffMonths < 12) {
    return { label: `Stale (${diffMonths}mo)`, class: 'stale', title: `No commits for over ${diffMonths} months` };
  } else {
    const years = Math.floor(diffMonths / 12);
    return {
      label: years >= 1 ? `Inactive (${years}yr+)` : `Inactive (${diffMonths}mo+)`,
      class: 'abandoned',
      title: 'Project appears to be inactive'
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

export function RepoCard({ repo, isExternal = false }: { repo: Repo; isExternal?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const status = getActivityStatus(repo.lastCommit);

  const relativeTime = getRelativeTime(repo.lastCommit);
  const absoluteTime = repo.lastCommit ? new Date(repo.lastCommit).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';

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
    const text = `Discovering ${repo.name} - an incredible FOSS alternative to ${repo.alternatives || 'SaaS tools'}! 🚀\n\n${getUrl()}\n\n#FossRadar #OpenSource @FossRadar`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noreferrer');
    setIsShareOpen(false);
  };

  return (
    <article className="card">
      <div className="card-meta">
        <span className="badge lang">{repo.language || ''}</span>
        {status && <span className={`badge ${status.class}`} title={status.title}>{status.label}</span>}
        {repo.archived && <span className="badge" style={{ backgroundColor: '#ff5555', color: 'white' }}>ARCHIVED</span>}
        {repo.self_hostable && (
          <span className="badge" style={{ backgroundColor: '#4ade80', color: '#1a1a1a', fontWeight: 900 }}>
            🏠 SELF-HOSTABLE
          </span>
        )}
      </div>

      <Link href={`/${repo.owner}/${repo.repo}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3>{repo.name}</h3>
      </Link>
      {repo.alternatives && (
        <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', opacity: 0.8 }}>
          REPLACES: <span style={{ color: 'var(--secondary)' }}>{repo.alternatives}</span>
        </div>
      )}
      <p>{repo.description || 'No description provided by the maintainer.'}</p>

      <div className="card-stats">
        <span>⭐ {repo.stars?.toLocaleString() || 0}</span>
        <span>🔱 {repo.forks?.toLocaleString() || 0}</span>
      </div>

      <div className="card-meta">
        {repo.license && <span className="badge license">{repo.license}</span>}
        {(repo.topics || []).slice(0, 3).map((topic) => (
          <span className="badge" key={topic}>#{topic}</span>
        ))}
      </div>

      <div className="card-footer">
        <small
          title={`Date: ${absoluteTime}`}
          style={{
            fontWeight: 800,
            opacity: 0.7,
            cursor: 'pointer',
            textDecoration: 'underline dotted',
            textUnderlineOffset: '3px'
          }}
        >
          {relativeTime}
        </small>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <div className="share-container">
            <button
              className="btn-link"
              onClick={() => setIsShareOpen(!isShareOpen)}
              style={{
                background: copied ? '#4ade80' : 'var(--accent)',
                fontSize: '0.75rem',
                padding: '0.4rem 0.8rem'
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

          {isExternal ? (
            <a
              className="btn-link"
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              EXPLORE →
            </a>
          ) : (
            <Link
              className="btn-link"
              href={`/${repo.owner}/${repo.repo}`}
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              EXPLORE →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
