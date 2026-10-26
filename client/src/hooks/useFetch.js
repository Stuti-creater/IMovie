import { useCallback, useEffect, useState } from 'react';
import api, { apiError } from '../api/client.js';

/** GET helper with loading/error state and manual reload. */
export function useFetch(path, params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = JSON.stringify(params || {});

  const load = useCallback(() => {
    if (!path) return () => {};
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .get(path, { params: JSON.parse(key) })
      .then((r) => !cancelled && setState({ data: r.data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: apiError(e).message }));
    return () => {
      cancelled = true;
    };
  }, [path, key]);

  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}
