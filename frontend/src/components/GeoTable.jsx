import React from 'react';

export default function GeoTable({ countries }) {
  const total = countries.reduce((s, c) => s + (c.clicks || 0), 0) || 1;
  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="border-b border-[var(--border)] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Countries</div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            <th className="px-4 py-2 text-left font-medium">Country</th>
            <th className="px-4 py-2 text-right font-medium">Clicks</th>
            <th className="px-4 py-2 text-left font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((c, index) => {
            const share = Math.max(6, Math.round((c.clicks / total) * 100));
            return (
              <tr key={c.country} className={index % 2 === 0 ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-transparent'}>
                <td className="px-4 py-3 text-white">{c.country}</td>
                <td className="px-4 py-3 text-right font-tech text-white">{c.clicks}</td>
                <td className="px-4 py-3">
                  <div className="h-1.5 w-full bg-[var(--border-subtle)]">
                    <div className="h-1.5 bg-[var(--accent-primary)] opacity-80" style={{ width: `${share}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
