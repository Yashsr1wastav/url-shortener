import React, { useEffect } from 'react';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RedirectHandler() {
  useEffect(() => {
    const path = window.location.pathname || '/';
    if (path && path.length > 1) {
      const code = path.slice(1).split('/')[0];
      if (/^[0-9a-zA-Z]{3,20}$/.test(code)) {
        // Fast path: immediately send user to backend redirect endpoint.
        // Backend returns a 301 to the original URL without waiting on frontend API calls.
        window.location.replace(`${apiBase.replace(/\/$/, '')}/${encodeURIComponent(code)}`);
      }
    }
  }, []);

  return null;
}
