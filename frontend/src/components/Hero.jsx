import React, { useState, useRef, useEffect } from 'react';
import { shortenUrl } from '../api/client';

export default function Hero({ onShortened, onShortenStart, onShortenComplete }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxClicks, setMaxClicks] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingMessages = [
    'Connecting to server...',
    'Validating URL...',
    'Generating short code...',
    'Storing in database...',
    'Almost done...'
  ];
  const [msgIndex, setMsgIndex] = useState(0);
  const msgInterval = useRef(null);
  const timeoutWarn = useRef(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    return () => {
      if (msgInterval.current) clearInterval(msgInterval.current);
      if (timeoutWarn.current) clearTimeout(timeoutWarn.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setShowTimeoutWarning(false);
    setMsgIndex(0);
    // start cycling messages every 3s
    msgInterval.current = setInterval(() => {
      setMsgIndex(i => (i + 1) % loadingMessages.length);
    }, 3000);
    // show timeout warning after 10s
    timeoutWarn.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 10000);
    try {
      onShortenStart && onShortenStart();
    } catch (err) {
      // ignore
    }
    try {
      // auto-prepend https:// if missing
      let url = originalUrl.trim();
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const payload = { originalUrl: url };
      if (alias) payload.alias = alias;
      if (expiresInDays) payload.expiresInDays = Number(expiresInDays);
      if (maxClicks) payload.maxClicks = Number(maxClicks);
      const res = await shortenUrl(payload);
      try { onShortenComplete && onShortenComplete(res.code); } catch(e){}
      onShortened(res);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed');
    } finally {
      setLoading(false);
      // clear intervals/timeouts
      if (msgInterval.current) {
        clearInterval(msgInterval.current);
        msgInterval.current = null;
      }
      if (timeoutWarn.current) {
        clearTimeout(timeoutWarn.current);
        timeoutWarn.current = null;
      }
      setMsgIndex(0);
      setShowTimeoutWarning(false);
    }
  };

  return (
    <section className="max-w-5xl">
      <div className="mb-6 text-left">
        <h1 className="font-sora text-3xl font-semibold tracking-[-0.03em] text-white lg:text-5xl">
          Make every <span className="text-[var(--accent-primary)]">link</span> count.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
          Production-grade URL shortener and insights dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row">
          <input
            className="h-12 min-w-0 flex-1 rounded-md rounded-r-none border border-[var(--border)] border-l-0 bg-[var(--bg-elevated)] px-4 text-sm text-white outline-none placeholder:text-[var(--text-muted)] transition-[border-color,border-left-width] duration-150 ease-out focus:border-[var(--accent-primary)] focus:border-l-[3px] sm:rounded-r-none"
            placeholder="Paste a long URL"
            value={originalUrl}
            onChange={e => setOriginalUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="mt-2 h-12 rounded-md rounded-l-none bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white transition duration-100 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:rounded-l-none"
            disabled={loading}
          >
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </div>

        {loading && (
          <div className="text-sm text-muted mt-2 font-mono">
            {'> ' + loadingMessages[msgIndex]}
          </div>
        )}

        {loading && showTimeoutWarning && (
          <div className="text-xs text-yellow-500 mt-1">
            Server is waking up — this may take up to 30s on first request...
          </div>
        )}

        <div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--text-muted)] transition hover:text-white"
            onClick={() => setAdvanced(s => !s)}
          >
            {advanced ? 'hide advanced options' : 'show advanced options'}
          </button>
        </div>

        {advanced && (
          <div className="grid gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 sm:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Custom alias</label>
              <input value={alias} onChange={e => setAlias(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]" placeholder="myalias" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Expires in</label>
              <select value={expiresInDays} onChange={e => setExpiresInDays(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-white outline-none focus:border-[var(--accent-primary)]">
                {[1, 3, 7, 14, 30, 90, 365].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]">Max clicks</label>
              <input value={maxClicks} onChange={e => setMaxClicks(e.target.value)} type="number" min="1" className="mt-2 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]" placeholder="e.g. 100" />
            </div>
          </div>
        )}

        {error && <div className="text-sm text-[var(--accent-red)]">{error}</div>}
      </form>
    </section>
  );
}
