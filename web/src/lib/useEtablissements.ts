import { useEffect, useState } from 'react';
import { Etablissement } from '../types/api';
import { supabase } from './supabase';

/**
 * Charge la table `etablissements` directement via le client Supabase JS.
 *
 * Le back NestJS n'expose pas d'endpoint dédié pour les établissements, mais
 * la table est lisible côté front quand l'utilisateur est authentifié (RLS
 * autorise les utilisateurs authentifiés). Le résultat est mis à disposition
 * sous forme d'un dictionnaire `byId` pour résolution rapide depuis les
 * `etablissement_id` des équipes.
 */

type EtablissementsState = {
  byId: Record<string, Etablissement>;
  loading: boolean;
  error: string | null;
};

const INITIAL: EtablissementsState = { byId: {}, loading: true, error: null };

export function useEtablissements(): EtablissementsState {
  const [state, setState] = useState<EtablissementsState>(INITIAL);

  useEffect(() => {
    if (!supabase) {
      setState({ byId: {}, loading: false, error: null });
      return;
    }

    let cancelled = false;
    supabase
      .from('etablissements')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setState({ byId: {}, loading: false, error: error.message });
          return;
        }
        const byId: Record<string, Etablissement> = {};
        for (const row of (data ?? []) as Etablissement[]) byId[row.id] = row;
        setState({ byId, loading: false, error: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
