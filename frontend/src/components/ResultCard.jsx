import React, { useEffect, useState } from 'react';

export default function ResultCard({ result, onViewAnalytics }) {
  const [copied, setCopied] = useState(false);
  const shortUrl = result.shortUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  useEffect(() => {
    setCopied(false);
  }, [result.code]);

  return (
    <div className="result-fade-up mt-4 w-full max-w-full overflow-hidden rounded-md border border-[var(--border)] border-l-[3px] border-l-[var(--accent-green)] bg-[var(--bg-card)] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--accent-green)]">✓ Created</span>
        <span className="text-[var(--text-muted)]">Ready to share and track</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Short URL</div>
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            title={shortUrl}
            className="block truncate font-mono text-base font-medium text-white sm:text-lg"
          >
            {shortUrl}
          </a>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleCopy}
            className="inline-flex w-full flex-1 items-center justify-center rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-white transition hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => onViewAnalytics(result.code)}
            className="inline-flex w-full flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-white"
          >
            View Analytics →
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-[var(--text-muted)]">
        {result.expiresAt ? `Expires: ${new Date(result.expiresAt).toLocaleString()}` : 'No expiry set'}
        {result.maxClicks ? ` • Max clicks: ${result.maxClicks}` : ''}
      </div>
    </div>
  );
}
