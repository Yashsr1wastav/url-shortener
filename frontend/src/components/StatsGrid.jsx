import React from 'react';

function StatCard({ title, value }) {
  return (
    <div className="p-4 rounded bg-[var(--bg-card)] border border-[var(--border)]">
      <div className="text-sm text-[var(--text-muted)]">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <StatCard title="Total Clicks" value={stats.totalClicks} />
      <StatCard title="Unique Clicks" value={stats.uniqueClicks} />
      <StatCard title="Countries" value={stats.countries?.length || 0} />
      <StatCard title="Top Referrer" value={stats.referrers?.[0]?.referrer || '—'} />
    </div>
  );
}
