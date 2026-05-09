import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function ClickChart({ data }) {
  return (
    <div className="w-full h-64 bg-[var(--bg-card)] p-4 rounded border border-[var(--border)]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} />
          <YAxis tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip />
          <Bar dataKey="clicks" fill="#3b82f6" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
