import React, { useState } from 'react';

export default function ResultCard({ result, onViewAnalytics }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="mt-6 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] shadow-lg animate-slide-down">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--text-muted)]">Short URL</div>
          <div className="text-lg font-medium">{result.shortUrl}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className={`px-3 py-1 rounded ${copied ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-card-hover)]'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => onViewAnalytics(result.code)} className="px-3 py-1 rounded bg-[var(--bg-card-hover)]">View Analytics</button>
        </div>
      </div>

      <div className="mt-3 text-sm text-[var(--text-muted)]">
        {result.expiresAt ? `Expires: ${new Date(result.expiresAt).toLocaleString()}` : 'No expiry set'}
        {result.maxClicks ? ` • Max clicks: ${result.maxClicks}` : ''}
      </div>
    </div>
  );
}
