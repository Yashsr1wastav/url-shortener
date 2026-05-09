import React from 'react';

export default function ExpiredPage({ onHome }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded">
        <div className="text-6xl">🔗❌</div>
        <h2 className="text-2xl mt-4">This link has expired</h2>
        <p className="text-[var(--text-muted)] mt-2">The link you followed is no longer active.</p>
        <div className="mt-4">
          <button onClick={onHome} className="px-4 py-2 rounded bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white">Create a new link</button>
        </div>
      </div>
    </div>
  );
}
