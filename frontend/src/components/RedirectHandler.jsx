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
                return;
              }
            }
            // Fallback for older backend deployments without /api/resolve.
            // This hits backend redirect route directly: GET /:code -> 301 original URL.
            window.location.replace(`${apiBase}/${encodeURIComponent(code)}`);
          } catch (err) {
            console.error('Redirect handler error', err);
            // Network/CORS fallback: try backend redirect endpoint directly.
            window.location.replace(`${apiBase}/${encodeURIComponent(code)}`);
          }
        })();
      }
    }
  }, []);

  return null;
}
