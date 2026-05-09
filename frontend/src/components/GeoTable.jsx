import React from 'react';

export default function GeoTable({ countries }) {
  const total = countries.reduce((s, c) => s + (c.clicks || 0), 0) || 1;
  return (
    <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border)]">
      <h3 className="mb-2 font-medium">Countries</h3>
      <div className="space-y-2">
        {countries.map(c => (
          <div key={c.country} className="flex items-center justify-between">
            <div className="w-1/3">{c.country}</div>
            <div className="w-1/3 text-right">{c.clicks}</div>
            <div className="w-1/3 pl-4">
              <div className="h-2 bg-[var(--border)] rounded" style={{ width: `${Math.round((c.clicks/total)*100)}%`, background: 'linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
