import React, { useEffect, useState } from 'react';
import useAnalytics from '../hooks/useAnalytics';
import StatsGrid from './StatsGrid';
import ClickChart from './ClickChart';
import GeoTable from './GeoTable';

export default function AnalyticsDashboard({ code, onBack }) {
  const [expiresStr, setExpiresStr] = useState(null);
  const [copied, setCopied] = useState(false);

  const { stats, loading, refreshing, cached, error } = useAnalytics(code);

  const shareAnalytics = async () => {
    const shareUrl = `${window.location.origin}/#analytics/${code}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  useEffect(()=>{
    let tv;
    if (stats && stats.expiresAt) {
      tv = setInterval(()=>{
        const diff = new Date(stats.expiresAt).getTime() - Date.now();
        if (diff <= 0) setExpiresStr('Expired');
        else {
          const d = Math.floor(diff/1000);
          const days = Math.floor(d/86400);
          const hours = Math.floor((d%86400)/3600);
          const mins = Math.floor((d%3600)/60);
          const secs = d%60;
          setExpiresStr(`${days}d ${hours}h ${mins}m ${secs}s`);
        }
      }, 1000);
    } else {
      setExpiresStr(null);
    }
    return ()=>{ if(tv) clearInterval(tv); };
  }, [stats]);

  if (loading && !stats) {
    return <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-6 text-sm text-[var(--text-muted)]">Loading analytics…</div>;
  }

  if (!stats) {
    return <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-6 text-sm text-[var(--text-muted)]">No analytics found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onBack} className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-white">← Back</button>
          <div className="truncate text-sm text-[var(--text-secondary)]">Short URL: <strong className="font-tech text-white">{code}</strong></div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-[1px] bg-[var(--accent-green)]" />
            <span>Live • updates every 5s</span>
          </div>
          <div>
            {refreshing ? <span className="text-[var(--accent-yellow)]">Refreshing…</span> : <span>{error ? 'Stale data' : 'Stable'}</span>}
          </div>
          <div>
            {stats && stats.expiresAt ? <span>⏱ Expires in {expiresStr || '—'}</span> : <span className="text-[var(--accent-green)]">✓ No expiry set</span>}
          </div>
          <div>
            {cached ? <span className="text-[var(--accent-green)]">⚡ Cached</span> : <span className="text-[var(--accent-primary)]">💾 DB only</span>}
          </div>
          <button onClick={shareAnalytics} className="rounded border border-[var(--border)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] transition hover:border-[var(--accent-primary)] hover:text-white">
            {copied ? 'Copied!' : 'Share Analytics'}
          </button>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <ClickChart data={stats.dailyClicks} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GeoTable countries={stats.countries} />

        <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="border-b border-[var(--border)] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Top Referrers</div>
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                <th className="px-4 py-2 text-left font-medium">Referrer</th>
                <th className="px-4 py-2 text-right font-medium">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {stats.referrers.map((r, index) => (
                <tr key={r.referrer} className={index % 2 === 0 ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-transparent'}>
                  <td className="px-4 py-3 text-white">{r.referrer}</td>
                  <td className="px-4 py-3 text-right font-tech text-white">{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
