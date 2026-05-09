import React, { useState } from 'react';
import { shortenUrl } from '../api/client';

export default function Hero({ onShortened }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxClicks, setMaxClicks] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { originalUrl };
      if (alias) payload.alias = alias;
      if (expiresInDays) payload.expiresInDays = Number(expiresInDays);
      if (maxClicks) payload.maxClicks = Number(maxClicks);
      const res = await shortenUrl(payload);
      onShortened(res);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto mt-12">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            className="w-full p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] focus:outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.2)]"
            placeholder="Paste a long URL"
            value={originalUrl}
            onChange={e => setOriginalUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <button
            type="button"
            className="text-sm text-[var(--text-muted)]"
            onClick={() => setAdvanced(s => !s)}
          >
            {advanced ? 'Hide advanced' : 'Show advanced options'}
          </button>
        </div>

        {advanced && (
          <div className="p-4 rounded bg-[var(--bg-card)] border border-[var(--border)] space-y-3">
            <div>
              <label className="text-sm text-[var(--text-muted)]">Custom alias</label>
              <input value={alias} onChange={e=>setAlias(e.target.value)} className="w-full mt-1 p-2 rounded bg-[transparent] border border-[var(--border)]" placeholder="myalias (3-20 alphanumeric)" />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)]">Expires in (days)</label>
              <select value={expiresInDays} onChange={e=>setExpiresInDays(e.target.value)} className="w-full mt-1 p-2 rounded bg-[transparent] border border-[var(--border)]">
                {[1,3,7,14,30,90,365].map(d=> <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)]">Max clicks</label>
              <input value={maxClicks} onChange={e=>setMaxClicks(e.target.value)} type="number" min="1" className="w-full mt-1 p-2 rounded bg-[transparent] border border-[var(--border)]" placeholder="e.g. 100" />
            </div>
          </div>
        )}

        <div>
          <button type="submit" className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white" disabled={loading}>
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </div>

        {error && <div className="text-red-400">{error}</div>}
      </form>
    </section>
  );
}
