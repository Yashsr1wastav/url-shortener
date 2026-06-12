import React from 'react';

function formatTimeAgo(value) {
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'just now';

  const diffMs = Date.now() - timestamp;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) return 'just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function isExpired(link) {
  if (!link.expiresAt) return false;
  const expiresAt = new Date(link.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

export default function MyLinks({ links, onViewAnalytics, onClearAll }) {
  const handleCopy = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  if (!links?.length) return null;

  return (
    <section className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">MY LINKS</h2>
          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-white">MY LINKS ({links.length})</span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-[var(--text-muted)] transition hover:text-white"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const shortUrl = link.shortUrl || link.redirectUrl || '';
          const expired = isExpired(link);

          return (
            <div key={`${link.code}-${link.createdAt}`} className="flex flex-col gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <a href={shortUrl} target="_blank" rel="noreferrer" title={shortUrl} className="block truncate font-mono text-sm text-white sm:text-base">
                  {shortUrl}
                </a>
                <div className="truncate text-xs text-[var(--text-muted)]" title={link.originalUrl}>
                  {link.originalUrl}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] md:min-w-[140px] md:justify-center">
                <span>{formatTimeAgo(link.createdAt)}</span>
                <span className={`rounded-full px-2 py-0.5 font-medium ${expired ? 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]' : 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]'}`}>
                  {expired ? 'Expired' : 'Active'}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row md:items-center">
                <button
                  type="button"
                  onClick={() => handleCopy(shortUrl)}
                  className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-white transition hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] sm:w-auto"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => onViewAnalytics(link.code)}
                  className="inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-white sm:w-auto"
                >
                  Analytics →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}