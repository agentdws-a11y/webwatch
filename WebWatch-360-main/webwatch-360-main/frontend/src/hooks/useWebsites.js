import { useState, useEffect, useMemo } from 'react';
import { mockWebsites } from '../data/mockData';

export function useWebsites({ search = '', status = 'active', sort = 'clientName' } = {}) {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setWebsites(mockWebsites);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let result = websites.filter((w) => w.status === status);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.clientName.toLowerCase().includes(q) ||
          w.websiteName.toLowerCase().includes(q) ||
          w.websiteUrl.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => a[sort]?.localeCompare?.(b[sort]) ?? 0);

    return result;
  }, [websites, search, status, sort]);

  return { websites: filtered, loading };
}