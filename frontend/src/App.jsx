import React, { useState } from 'react'
import Hero from './components/Hero'
import ResultCard from './components/ResultCard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SystemSimulation from './components/SystemSimulation'
import DatabaseMonitor from './components/DatabaseMonitor'
import HowItWorks from './components/HowItWorks'
import SystemStatsBar from './components/SystemStatsBar'

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'analytics'
  const [result, setResult] = useState(null);
  const [code, setCode] = useState(null);
  const [shortenTrigger, setShortenTrigger] = useState(0);

  const handleShortened = (res) => {
    setResult(res);
  };

  const handleShortenStart = () => {
    // reserved for future; no-op
  };

  const handleShortenComplete = (c) => {
    setShortenTrigger(t => t + 1);
  };

  const handleViewAnalytics = (c) => {
    setCode(c);
    setView('analytics');
  };

  const handleBack = () => {
    setView('home');
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

            <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <div className="fade-section delay-50 min-w-0">
                <Hero onShortened={handleShortened} onShortenStart={handleShortenStart} onShortenComplete={handleShortenComplete} />
                {result && <ResultCard result={result} onViewAnalytics={handleViewAnalytics} />}
              </div>

              <div className="fade-section delay-100 min-w-0">
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
