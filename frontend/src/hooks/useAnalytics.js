import { useEffect, useRef, useState } from 'react';
import { getAnalytics, checkCache } from '../api/client';

export default function useAnalytics(code) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cached, setCached] = useState(null);
  const [error, setError] = useState(null);
  const initialLoadRef = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    initialLoadRef.current = true;
    setStats(null);
    setLoading(true);
    setRefreshing(false);
    setCached(null);
    setError(null);
  }, [code]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (initialLoadRef.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const [data, cacheRes] = await Promise.all([
          getAnalytics(code),
          checkCache(code).catch(() => ({ cached: false })),
        ]);

        if (!mounted) return;
        setStats(data);
        setCached(Boolean(cacheRes.cached));
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (!mounted) return;
        if (initialLoadRef.current) {
          setLoading(false);
          initialLoadRef.current = false;
        } else {
          setRefreshing(false);
        }
      }
    }

    load();
    intervalRef.current = setInterval(load, 5000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code]);

  return { stats, loading, refreshing, cached, error };
}
