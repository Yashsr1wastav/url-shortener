import React, { useEffect } from 'react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RedirectHandler() {
  useEffect(() => {
    const path = window.location.pathname || '/';
    if (path && path.length > 1) {
      const code = path.slice(1).split('/')[0];
      if (/^[0-9a-zA-Z]{3,20}$/.test(code)) {
        (async () => {
          try {
            const res = await fetch(`${apiBase}/api/resolve/${encodeURIComponent(code)}`);
            if (res.status === 200) {
              const data = await res.json();
              if (data.originalUrl) {
                window.location.replace(data.originalUrl);
              }
            }
          } catch (err) {
            console.error('Redirect handler error', err);
          }
        })();
      }
    }
  }, []);

  return null;
}
