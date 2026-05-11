import React, { useEffect, useState } from 'react';
import { getSystemStats, getRecentQueries } from '../api/client';

export default function DatabaseMonitor() {
  const [stats, setStats] = useState(null);
  const [queries, setQueries] = useState([]);
  const [showSchema, setShowSchema] = useState(false);
  const [rowTick, setRowTick] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let inFlight = false;
    async function load() {
      if (inFlight) return;
      inFlight = true;
      setLoading(true);
      try {
        const s = await getSystemStats();
        const q = await getRecentQueries();
        if (!mounted) return;
        setStats(s);
        setQueries(q);
      } catch (err) {
        console.error('db monitor fetch', err);
      } finally {
        inFlight = false;
        if (mounted) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 6000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  useEffect(() => {
    setRowTick(t => t + 1);
  }, [queries]);

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">DB ACTIVITY</div>
      <div className="mb-3 text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">{loading ? 'Refreshing...' : 'Live'}</div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.5fr_0.5fr] items-stretch">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">QUERY LOG</div>
          <div className="max-h-72 overflow-auto border border-[var(--border-subtle)] bg-[var(--bg-primary)] font-tech text-[11px]">
            {queries.map((q, i) => {
              const color = q.type === 'INSERT' ? '#22c55e' : q.type === 'SELECT' ? '#4f6ef7' : '#eab308';
              const opColorClass = q.type === 'INSERT' ? 'text-[#22c55e]' : q.type === 'SELECT' ? 'text-[#4f6ef7]' : 'text-[#eab308]';
              return (
                <div key={`${i}-${rowTick}`} className={`entry-fade-up flex h-9 items-center px-3 ${i % 2 === 0 ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-transparent'}`} style={{ borderLeft: `2px solid ${color}` }}>
                  <div className={`w-[72px] shrink-0 font-medium ${opColorClass}`}>{q.type}</div>
                  <div className="min-w-0 flex-1 text-center truncate text-[var(--text-secondary)]">{q.table} {q.message}</div>
                  <div className="w-16 shrink-0 text-right text-[var(--text-muted)]">{Math.round(q.duration)}ms</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-[1px] bg-[#4f6ef7]" />
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">urls table</div>
              </div>
              <div className="font-tech text-3xl text-white">{stats ? stats.urlCount : '—'}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Last insert {stats ? stats.lastUrlCreated : '—'}</div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] text-[var(--text-secondary)]">Today: {stats && stats.todayUrls != null ? stats.todayUrls : 0} created</div>
              <div className="mt-2 h-1.5 w-full rounded bg-[rgba(255,255,255,0.04)]">
                <div className="h-1.5 rounded bg-[#4f6ef7]" style={{ width: `${Math.min(100, Math.round(((stats && stats.todayUrls) || 0) / 20 * 100))}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-[1px] bg-[#eab308]" />
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">clicks table</div>
              </div>
              <div className="font-tech text-3xl text-white">{stats ? stats.clickCount : '—'}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Last insert {stats ? stats.lastClickRecorded : '—'}</div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] text-[var(--text-secondary)]">Today: {stats && stats.todayClicks != null ? stats.todayClicks : 0} clicks</div>
              <div className="mt-2 h-1.5 w-full rounded bg-[rgba(255,255,255,0.04)]">
                <div className="h-1.5 rounded bg-[#eab308]" style={{ width: `${Math.min(100, Math.round(((stats && stats.todayClicks) || 0) / 20 * 100))}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSchema && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 font-tech text-[11px]">
          <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">
            <div className="mb-2 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Url</div>
            <div className="space-y-1 text-[var(--text-secondary)]">
              <div>id (cuid)</div>
              <div>code (unique)</div>
              <div>originalUrl</div>
              <div>alias</div>
              <div>expiresAt</div>
              <div>maxClicks</div>
              <div>totalClicks</div>
            </div>
          </div>
          <div className="border border-[var(--border)] bg-[var(--bg-primary)] p-3">
            <div className="mb-2 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Click</div>
            <div className="space-y-1 text-[var(--text-secondary)]">
              <div>id (cuid)</div>
              <div>urlCode</div>
              <div>clickedAt</div>
              <div>country</div>
              <div>referrer</div>
              <div>ipHash</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
