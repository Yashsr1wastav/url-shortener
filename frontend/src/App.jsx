import React, { useState } from 'react'
import Hero from './components/Hero'
import ResultCard from './components/ResultCard'
import AnalyticsDashboard from './components/AnalyticsDashboard'

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'analytics'
  const [result, setResult] = useState(null);
  const [code, setCode] = useState(null);

  const handleShortened = (res) => {
    setResult(res);
  };

  const handleViewAnalytics = (c) => {
    setCode(c);
    setView('analytics');
  };

  const handleBack = () => {
    setView('home');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-sora">URL Shortener</h1>

        {view === 'home' && (
          <>
            <Hero onShortened={handleShortened} />
            {result && <ResultCard result={result} onViewAnalytics={handleViewAnalytics} />}
          </>
        )}

        {view === 'analytics' && (
          <AnalyticsDashboard code={code} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
