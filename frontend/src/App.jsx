import React, { useEffect, useState } from 'react'
import Hero from './components/Hero'
import ResultCard from './components/ResultCard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SystemSimulation from './components/SystemSimulation'
import DatabaseMonitor from './components/DatabaseMonitor'
import HowItWorks from './components/HowItWorks'
import SystemStatsBar from './components/SystemStatsBar'
import MyLinks from './components/MyLinks'

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'analytics'
  const [result, setResult] = useState(null);
  const [code, setCode] = useState(null);
  const [shortenTrigger, setShortenTrigger] = useState(0);
  const [myLinks, setMyLinks] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('myLinks');
      if (saved) {
        setMyLinks(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved links', err);
    }

    const hash = window.location.hash;
    if (hash.startsWith('#analytics/')) {
      const analyticsCode = hash.replace('#analytics/', '');
      setView('analytics');
      setCode(analyticsCode);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#analytics/')) {
        const analyticsCode = hash.replace('#analytics/', '');
        setView('analytics');
        setCode(analyticsCode);
        return;
      }

      setView('home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleShortened = (res) => {
    setResult(res);
    const newLink = { ...res, createdAt: Date.now() };
    setMyLinks((prev) => {
      const updated = [newLink, ...prev].slice(0, 20);
      localStorage.setItem('myLinks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleShortenStart = () => {
    // reserved for future; no-op
  };

  const handleShortenComplete = (c) => {
    setShortenTrigger(t => t + 1);
  };

  const handleViewAnalytics = (c) => {
    setCode(c);
    window.location.hash = `#analytics/${c}`;
    setView('analytics');
  };

  const handleBack = () => {
    window.location.hash = '';
    setView('home');
  };

  const handleClearLinks = () => {
    setMyLinks([]);
    try {
      localStorage.removeItem('myLinks');
    } catch (err) {
      console.error('Failed to clear saved links', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] animate-fade-in-page">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="flex h-12 items-center justify-between border-b border-[var(--border)] px-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-[-0.5px] text-white font-sora">⚡ linkr</span>
          </div>
          <span className="rounded border border-[var(--border)] px-[6px] py-[2px] font-tech text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
            v1.0
          </span>
        </header>

        {view === 'home' && (
          <div className="flex-1 py-8">
            <div className="fade-section">
              <SystemStatsBar />
            </div>

            <section className="mt-8 flex flex-col gap-8 lg:flex-row">
              <div className="fade-section delay-50 min-w-0 flex-1">
                <Hero onShortened={handleShortened} onShortenStart={handleShortenStart} onShortenComplete={handleShortenComplete} />
                {result && <ResultCard result={result} onViewAnalytics={handleViewAnalytics} />}
                {myLinks.length > 0 && <MyLinks links={myLinks} onViewAnalytics={handleViewAnalytics} onClearAll={handleClearLinks} />}
              </div>

              <div className="fade-section delay-100 min-w-0 flex-1">
                <SystemSimulation triggerCount={shortenTrigger} />
              </div>
            </section>

            <section className="fade-section delay-150 mt-8">
              <DatabaseMonitor />
            </section>

            <section className="fade-section delay-150 mt-8">
              <HowItWorks />
            </section>
          </div>
        )}

        {view === 'analytics' && (
          <div className="flex-1">
            <AnalyticsDashboard code={code} onBack={handleBack} />
          </div>
        )}

        <footer className="mt-8 border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
          Built with Node.js · Redis · PostgreSQL · React
        </footer>
      </main>
    </div>
  )
}
