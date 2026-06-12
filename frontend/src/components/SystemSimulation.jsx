import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function SystemSimulation({ triggerCount = 0 }) {
  const [tab, setTab] = useState('shorten');
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [redirectMode, setRedirectMode] = useState('hit');
  const [activeRoute, setActiveRoute] = useState(null);
  const logRef = useRef(null);
  const timeouts = useRef([]);

  const paths = useMemo(() => ({
    clientExpress: {
      d: 'M 200 40 L 200 90',
      label: ':3001',
      color: '#8b5cf6',
      delay: '0s',
      duration: '2s',
    },
    expressRedis: {
      d: 'M 200 120 C 170 132, 135 150, 100 180',
      label: ':6379',
      color: '#22c55e',
      delay: '0.7s',
      duration: '2s',
    },
    expressPostgres: {
      d: 'M 200 120 C 230 132, 265 150, 300 180',
      label: ':5432',
      color: '#4f6ef7',
      delay: '1.4s',
      duration: '2s',
    }
  }), []);

  function clearAllTimers() {
    timeouts.current.forEach((timer) => clearTimeout(timer));
    timeouts.current = [];
  }

  function resetSimulation() {
    clearAllTimers();
    setLogs([]);
    setRunning(false);
    setActiveRoute(null);
  }

  useEffect(() => {
    if (triggerCount > 0) runShortenSimulation();
    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerCount]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  function runShortenSimulation() {
    setTab('shorten');
    setRunning(true);
    clearAllTimers();
    setActiveRoute(null);

    setLogs(['⏳ Validating URL...']);

    timeouts.current.push(setTimeout(() => {
      setLogs(['⏳ Validating URL...', '✓ URL validated']);
    }, 400));

    timeouts.current.push(setTimeout(() => {
      setLogs(['⏳ Validating URL...', '✓ URL validated', '✓ Base62 code generated']);
    }, 800));

    timeouts.current.push(setTimeout(() => {
      setLogs(['⏳ Validating URL...', '✓ URL validated', '✓ Base62 code generated', '✓ Stored in PostgreSQL (18ms)']);
      setActiveRoute('expressPostgres');
    }, 1400));

    timeouts.current.push(setTimeout(() => {
      setLogs(['⏳ Validating URL...', '✓ URL validated', '✓ Base62 code generated', '✓ Stored in PostgreSQL (18ms)', '✓ Cached in Redis (1ms)']);
      setActiveRoute('expressRedis');
    }, 1900));

    timeouts.current.push(setTimeout(() => {
      setLogs(['⏳ Validating URL...', '✓ URL validated', '✓ Base62 code generated', '✓ Stored in PostgreSQL (18ms)', '✓ Cached in Redis (1ms)', '✓ Short URL returned ⚡']);
      setActiveRoute('clientExpress');
      setRunning(false);
    }, 2400));
  }

  function runRedirectSimulation() {
    setTab('redirect');
    clearAllTimers();
    setRunning(true);
    setLogs([]);
    setActiveRoute(null);

    if (redirectMode === 'hit') {
      setLogs(['Yellow: CLIENT → EXPRESS']);
      setActiveRoute('clientExpress');

      timeouts.current.push(setTimeout(() => {
        setLogs(['Yellow: CLIENT → EXPRESS', 'Green: EXPRESS → REDIS — Cache lookup...']);
        setActiveRoute('expressRedis');
      }, 400));

      timeouts.current.push(setTimeout(() => {
        setLogs(['Yellow: CLIENT → EXPRESS', 'Green: EXPRESS → REDIS — Cache lookup...', '⚡ Cache HIT — redirected in 0.8ms']);
        setActiveRoute('clientExpress');
        setRunning(false);
      }, 900));
      return;
    }

    setLogs(['Yellow: CLIENT → EXPRESS']);
    setActiveRoute('clientExpress');

    timeouts.current.push(setTimeout(() => {
      setLogs(['Yellow: CLIENT → EXPRESS', 'Red: EXPRESS → REDIS — MISS']);
      setActiveRoute('expressRedis');
    }, 400));

    timeouts.current.push(setTimeout(() => {
      setLogs(['Yellow: CLIENT → EXPRESS', 'Red: EXPRESS → REDIS — MISS', 'Blue: EXPRESS → POSTGRESQL — Fetching...']);
      setActiveRoute('expressPostgres');
    }, 800));

    timeouts.current.push(setTimeout(() => {
      setLogs(['Yellow: CLIENT → EXPRESS', 'Red: EXPRESS → REDIS — MISS', 'Blue: EXPRESS → POSTGRESQL — Fetching...', 'Found — warming cache']);
      setActiveRoute('expressRedis');
    }, 1200));

    timeouts.current.push(setTimeout(() => {
      setLogs(['Yellow: CLIENT → EXPRESS', 'Red: EXPRESS → REDIS — MISS', 'Blue: EXPRESS → POSTGRESQL — Fetching...', 'Found — warming cache', '🔄 Cache MISS — fell back to PostgreSQL (22ms)']);
      setActiveRoute('clientExpress');
      setRunning(false);
    }, 1700));
  }

  function formatLog(line) {
    if (line.startsWith('Yellow')) return { text: `→ ${line.replace(/^Yellow:\s*/, '')}`, color: '#eab308', prefix: '> ' };
    if (line.startsWith('Red')) return { text: `✗ ${line.replace(/^Red:\s*/, '')}`, color: '#ef4444', prefix: '> ' };
    if (line.startsWith('Blue')) return { text: `→ ${line.replace(/^Blue:\s*/, '')}`, color: '#4f6ef7', prefix: '> ' };
    if (line.startsWith('Green')) return { text: `→ ${line.replace(/^Green:\s*/, '')}`, color: '#22c55e', prefix: '> ' };
    if (line.startsWith('⚡')) return { text: line, color: '#22c55e', prefix: '> ', bold: true };
    if (line.startsWith('🔄')) return { text: line, color: '#eab308', prefix: '> ' };
    if (line.startsWith('Found')) return { text: `✓ ${line}`, color: '#22c55e', prefix: '> ' };
    if (line.startsWith('✓')) return { text: line, color: '#22c55e', prefix: '> ' };
    if (line.startsWith('⏳')) return { text: line, color: '#eab308', prefix: '~ ' };
    return { text: line, color: '#a1a1aa', prefix: '> ' };
  }

  function Node({ x, y, label, color, width = 80 }) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="0" y="0" width={width} height="30" rx="4" fill="none" stroke={color} strokeWidth="1.5" />
        <text x={width / 2} y="19" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="0.5" fill={color}>
          {label}
        </text>
      </g>
    );
  }

  function Packet({ routeKey }) {
    const path = paths[routeKey];
    if (!path) return null;
    const isActive = activeRoute === routeKey;
    return (
      <circle
        r="3"
        fill={path.color}
        className="packet"
        style={{
          offsetPath: `path('${path.d}')`,
          animationDelay: isActive ? '0s' : path.delay,
          animationDuration: isActive ? '1.1s' : path.duration,
          opacity: isActive ? 1 : 0.7,
          filter: isActive ? 'brightness(1.15)' : 'brightness(0.9)',
        }}
      />
    );
  }

  function LineLabel({ x, y, text }) {
    return (
      <text x={x} y={y} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.35)">
        {text}
      </text>
    );
  }

  const terminalLines = logs.map((line, index) => {
    const { text, color, prefix, bold } = formatLog(line);
    return {
      text,
      color,
      prefix,
      bold,
      index,
      raw: line,
    };
  });

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-[1px] bg-[var(--accent-green)]" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">SYSTEM</h3>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setTab('shorten')} className={`border-b-2 pb-1 text-xs ${tab === 'shorten' ? 'border-white text-white' : 'border-transparent text-[var(--text-muted)]'}`}>
            Shorten URL
          </button>
          <button type="button" onClick={() => setTab('redirect')} className={`border-b-2 pb-1 text-xs ${tab === 'redirect' ? 'border-white text-white' : 'border-transparent text-[var(--text-muted)]'}`}>
            Redirect
          </button>
          <button type="button" onClick={resetSimulation} className="text-xs text-[var(--text-muted)] transition hover:text-white">
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <div className="flex h-[180px] items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 sm:h-[220px] sm:p-3" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
              <defs>
                <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.35" />
                </filter>
              </defs>

              <path d={paths.clientExpress.d} className={`system-link ${activeRoute === 'clientExpress' ? 'is-active' : ''}`} stroke={activeRoute === 'clientExpress' ? '#8b5cf6' : 'rgba(255,255,255,0.15)'} />
              <path d={paths.expressRedis.d} className={`system-link ${activeRoute === 'expressRedis' ? 'is-active' : ''}`} stroke={activeRoute === 'expressRedis' ? '#22c55e' : 'rgba(255,255,255,0.15)'} />
              <path d={paths.expressPostgres.d} className={`system-link ${activeRoute === 'expressPostgres' ? 'is-active' : ''}`} stroke={activeRoute === 'expressPostgres' ? '#4f6ef7' : 'rgba(255,255,255,0.15)'} />

              <LineLabel x={200} y={70} text=":3001" />
              <LineLabel x={132} y={155} text=":6379" />
              <LineLabel x={268} y={155} text=":5432" />

              <Packet routeKey="clientExpress" />
              <Packet routeKey="expressRedis" />
              <Packet routeKey="expressPostgres" />

              <g filter="url(#nodeShadow)">
                <Node x={160} y={10} label="CLIENT" color="#8b5cf6" />
                <Node x={160} y={90} label="EXPRESS" color="#eab308" />
                <Node x={60} y={170} label="REDIS" color="#22c55e" />
                <Node x={260} y={170} label="POSTGRESQL" color="#4f6ef7" />
              </g>
            </svg>
          </div>

          <div className="mt-3 overflow-hidden rounded-b-[6px] border border-[var(--border)] bg-[#050508]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[#0a0a0f] px-3 py-2 text-[10px] text-[var(--text-muted)]" style={{ borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }}>
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
              <span className="h-2 w-2 rounded-full bg-[#eab308]" />
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <span className="ml-2 font-tech">simulation.log</span>
            </div>
            <div ref={logRef} style={{ height: '100px' }} className="overflow-y-auto rounded-b-[6px] p-3 font-tech text-[10px] leading-[1.7] text-[var(--text-secondary)] sm:h-[140px] sm:text-[11px]">
              {terminalLines.map((line, index) => (
                <div key={`${line.raw}-${index}`} className="entry-fade-up flex gap-2" style={{ color: line.color }}>
                  <span className="shrink-0 text-[var(--text-muted)]">{line.prefix}</span>
                  <span className={`min-w-0 break-words ${line.bold ? 'font-bold' : ''}`}>{line.text}</span>
                  {index === terminalLines.length - 1 && <span className="blink text-white">█</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/3">
          {tab === 'shorten' ? (
            <div className="rounded-md border border-[var(--border)] bg-[var(--bg-card-hover)] p-3">
              <div className="mb-2 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Simulation Steps</div>
              <ol className="space-y-1 font-tech text-[11px] leading-6 text-[var(--text-secondary)]">
                <li>Request received</li>
                <li>Base62 code generated</li>
                <li>Stored in PostgreSQL</li>
                <li>Cached in Redis</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs">
                <button type="button" onClick={() => setRedirectMode('hit')} className={`border-b-2 pb-1 ${redirectMode === 'hit' ? 'border-white text-white' : 'border-transparent text-[var(--text-muted)]'}`}>
                  Cache HIT
                </button>
                <button type="button" onClick={() => setRedirectMode('miss')} className={`border-b-2 pb-1 ${redirectMode === 'miss' ? 'border-white text-white' : 'border-transparent text-[var(--text-muted)]'}`}>
                  Cache MISS
                </button>
              </div>
              <button type="button" onClick={runRedirectSimulation} disabled={running} className="w-full rounded-md bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
                ▶ Simulate Redirect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}