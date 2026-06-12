import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ClickChart({ data }) {
  return (
    <div className="h-[200px] w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-3 sm:h-80 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            labelFormatter={formatDateLabel}
            contentStyle={{ background: '#0c0c10', border: '1px solid #27272a', borderRadius: 6, color: '#fafafa' }}
          />
          <Bar dataKey="clicks" fill="rgba(79,110,247,0.8)" activeBar={{ fill: 'rgba(79,110,247,1)' }} radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
