import React from 'react';

function toBase62(n) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  while (n > 0) { s = chars[n % 62] + s; n = Math.floor(n / 62); }
  return s || '0';
}

export default function HowItWorks() {
  const count = 15423847;
  const cache = ['abc123 → youtube.com', 'LhB4Qz → github.com', 'JeutRz → google.com'];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-[1px] bg-[var(--accent-primary)]" />
          <div className="text-sm font-medium text-white">56 Billion Possible URLs</div>
        </div>
        <div className="font-tech text-sm text-white">decimal: {count.toLocaleString()} → base62: "{toBase62(count)}"</div>
        <div className="mt-3 text-xs text-[var(--text-muted)]">Character set: 0-9 a-z A-Z (62 chars)</div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-[1px] bg-[var(--accent-green)]" />
          <div className="text-sm font-medium text-white">Sub-millisecond Redirects</div>
        </div>
        <div className="space-y-1 font-tech text-[11px] text-[var(--text-secondary)]">
          {cache.map((c, i) => <div key={i}>[ {c} ] ← CACHED</div>)}
        </div>
        <div className="mt-3 text-xs text-[var(--text-muted)]">Cache hit rate: 94% | Miss: 6%</div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-[1px] bg-[var(--accent-yellow)]" />
          <div className="text-sm font-medium text-white">Zero-latency Click Tracking</div>
        </div>
        <div className="space-y-2 font-tech text-[11px] text-[var(--text-secondary)]">
          <div>Main thread: [████████] 0.8ms → REDIRECTED ✓</div>
          <div>Background: [████████████████] analytics → RECORDED ✓</div>
        </div>
        <div className="mt-3 text-xs text-[var(--text-muted)]">Analytics never slow your redirect</div>
      </div>
    </div>
  );
}
