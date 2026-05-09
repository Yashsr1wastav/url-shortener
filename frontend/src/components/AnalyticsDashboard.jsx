import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api/client';
import StatsGrid from './StatsGrid';
import ClickChart from './ClickChart';
import GeoTable from './GeoTable';

export default function AnalyticsDashboard({ code, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getAnalytics(code);
        if (mounted) setStats(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(iv); };
  }, [code]);

  if (loading) return <div className="mt-6">Loading analytics…</div>;
  if (!stats) return <div className="mt-6">No analytics found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-[var(--text-muted)]">← Back</button>
        <div className="text-sm">Short URL: <strong>{code}</strong></div>
      </div>

      <StatsGrid stats={stats} />

      <ClickChart data={stats.dailyClicks} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GeoTable countries={stats.countries} />
        <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)]">
          <h3 className="mb-2 font-medium">Top Referrers</h3>
          <ul className="space-y-2">
            {stats.referrers.map(r => (
              <li key={r.referrer} className="flex justify-between"><span>{r.referrer}</span><span>{r.clicks}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
