import { useEffect, useState } from 'react';
import { Profile } from '../types/api';
import { supabase } from './supabase';

/**
 * Charge les profils enseignants (responsables d'établissement) directement
 * via Supabase JS. Le back NestJS n'expose pas d'endpoint dédié — on tape
 * dans la table `profiles` filtrée par `role = 'enseignant'`.
 *
 * Indexé par `etablissement_id` pour un lookup rapide depuis l'affichage des
 * équipes.
 */

type ResponsablesState = {
  byEtab: Record<string, Profile[]>;
  loading: boolean;
  error: string | null;
};

const INITIAL: ResponsablesState = { byEtab: {}, loading: true, error: null };

export function useResponsables(): ResponsablesState {
  const [state, setState] = useState<ResponsablesState>(INITIAL);

  useEffect(() => {
    if (!supabase) {
      setState({ byEtab: {}, loading: false, error: null });
      return;
    }

    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, nom, prenom, email, role, discipline, etablissement_id, created_at')
      .eq('role', 'enseignant')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setState({ byEtab: {}, loading: false, error: error.message });
          return;
        }
        const byEtab: Record<string, Profile[]> = {};
        for (const row of (data ?? []) as Profile[]) {
          const key = row.etablissement_id ?? '_none';
          (byEtab[key] = byEtab[key] ?? []).push(row);
        }
        setState({ byEtab, loading: false, error: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
