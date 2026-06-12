import React, { useEffect, useRef, useState } from 'react';

function StatCard({ label, value, tone }) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 500);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4 text-left">
      <div className={`text-[10px] uppercase tracking-[0.12em] ${tone}`}>{label}</div>
      <div className={`mt-2 min-w-0 font-tech leading-none text-white ${flash ? 'stat-update' : ''} ${typeof value === 'string' && value.length > 14 ? 'truncate text-[22px]' : 'text-[36px]'}`}>
        {value}
      </div>
    </div>
  );
}

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Total Clicks" value={stats.totalClicks} tone="text-[var(--accent-primary)]" />
      <StatCard label="Unique Clicks" value={stats.uniqueClicks} tone="text-[var(--accent-secondary)]" />
      <StatCard label="Countries" value={stats.countries?.length || 0} tone="text-[var(--accent-green)]" />
      <StatCard label="Top Referrer" value={stats.referrers?.[0]?.referrer || '—'} tone="text-[var(--accent-yellow)]" />
    </div>
  );
}
