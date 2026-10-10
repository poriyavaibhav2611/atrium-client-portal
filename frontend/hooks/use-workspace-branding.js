import { useState, useEffect } from 'react';
import { getWorkspace, updateWorkspace } from '@/services/api';

let cache = null;
let listeners = [];

export function useWorkspaceBranding() {
  const [data, setData] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const handler = (newData) => {
      setData(newData);
      setLoading(false);
    };
    listeners.push(handler);

    if (!cache) {
      getWorkspace().then((res) => {
        cache = res;
        listeners.forEach((l) => l(res));
      });
    } else {
      setLoading(false);
    }

    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const update = async (newData) => {
    const updated = await updateWorkspace(newData);
    cache = updated;
    listeners.forEach((l) => l(updated));
    return updated;
  };

  return { workspace: data, update, loading };
}
