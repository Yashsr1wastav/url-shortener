import React, { useEffect, useState } from 'react';
import { getSystemStats } from '../api/client';

export default function SystemStatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await getSystemStats();
        if (mounted) setStats(s);
      } catch (e) {}
    }
    load();
    const iv = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="flex h-10 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-2 text-xs text-[var(--text-secondary)]">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="h-1 w-1 rounded-[1px] bg-[#22c55e]" />
        <span>Cache Hit Rate</span>
        <span className="font-tech text-white">94%</span>
      </div>
      <span className="text-[var(--text-muted)]">|</span>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="h-1 w-1 rounded-[1px] bg-[#4f6ef7]" />
        <span>URLs Created</span>
        <span className="font-tech text-white">{stats ? stats.urlCount : '—'}</span>
      </div>
      <span className="text-[var(--text-muted)]">|</span>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="h-1 w-1 rounded-[1px] bg-[#eab308]" />
        <span>Total Clicks</span>
        <span className="font-tech text-white">{stats ? stats.clickCount : '—'}</span>
      </div>
      <span className="text-[var(--text-muted)]">|</span>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="h-1 w-1 rounded-[1px] bg-[#8b5cf6]" />
        <span>Avg Redirect</span>
        <span className="font-tech text-white">&lt;1ms</span>
      </div>
    </div>
  );
}
