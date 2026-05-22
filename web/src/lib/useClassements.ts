import { useEffect, useRef, useState } from 'react';
import { CURRENT_EDITION_ID, SCOREBOARD_POLL_MS } from '../config';
import { Classements } from '../types/api';
import { api } from './api';

type State = {
  data: Classements | null;
  error: string | null;
  loading: boolean;
  lastUpdate: number | null;
};

const INITIAL: State = {
  data: null,
  error: null,
  loading: true,
  lastUpdate: null,
};

export function useClassements(): State {
  const [state, setState] = useState<State>(INITIAL);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    const editionId = CURRENT_EDITION_ID;
    if (!editionId) {
      setState({
        data: null,
        error: 'VITE_CURRENT_EDITION_ID non défini',
        loading: false,
        lastUpdate: null,
      });
      return;
    }

    const fetchOnce = async () => {
      try {
        const data = await api.classements.get(editionId);
        if (cancelled.current) return;
        setState({ data, error: null, loading: false, lastUpdate: Date.now() });
      } catch (err) {
        if (cancelled.current) return;
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : 'Erreur API',
          loading: false,
        }));
      }
    };

    fetchOnce();
    const id = setInterval(fetchOnce, SCOREBOARD_POLL_MS);

    return () => {
      cancelled.current = true;
      clearInterval(id);
    };
  }, []);

  return state;
}
