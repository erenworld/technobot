import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type CurrentRow = {
  time: string;
  team: string;
  immat: string;
  result: string;
  cls: 'done' | 'now' | 'pending';
};

export type PlanningState = {
  piste1: CurrentRow[];
  piste2: CurrentRow[];
  loading: boolean;
  error: string | null;
};

// Données de secours (Mocks) en cas d'erreur ou si la base est vide
const MOCK_PISTE_1: CurrentRow[] = [
  { time: '10:30', team: 'Thionville - Saint Pierre Chanel', immat: 'SL04 · terminé', result: '143 pts', cls: 'done' },
  { time: '10:45', team: 'Fameck - Charles De Gaulle', immat: 'SL06 · terminé', result: '119 pts', cls: 'done' },
  { time: '11:00', team: 'Hombourg-Haut - Robert Schuman', immat: 'SL01 · terminé', result: '157 pts', cls: 'done' },
  { time: '11:15', team: 'Yutz - Jean Mermoz', immat: 'SL02 · passage en cours', result: '● live', cls: 'now' },
  { time: '11:30', team: 'Puttelange aux Lacs - J.B. Éblé', immat: 'SL03 · à venir', result: '-', cls: 'pending' },
];

const MOCK_PISTE_2: CurrentRow[] = [
  { time: '10:30', team: 'Algrange - Saint Vincent de Paul', immat: 'SL10 · terminé', result: '88 pts', cls: 'done' },
  { time: '10:45', team: 'Aumetz - Lionel TERRAY', immat: 'SL11 · terminé', result: '106 pts', cls: 'done' },
  { time: '11:00', team: 'Sarreguemines - Fulrad', immat: 'SL12 · terminé', result: '72 pts', cls: 'done' },
  { time: '11:15', team: 'Corcieux - Paul Emile Victor', immat: 'SL07 · à venir', result: '-', cls: 'pending' },
  { time: '11:30', team: 'Mirecourt - Guy Dolmaire', immat: 'SL08 · à venir', result: '-', cls: 'pending' },
];

export function usePlanning(): PlanningState {
  const [state, setState] = useState<PlanningState>({ piste1: [], piste2: [], loading: true, error: null });

  useEffect(() => {
    if (!supabase) {
      setState({ piste1: MOCK_PISTE_1, piste2: MOCK_PISTE_2, loading: false, error: 'Supabase non configuré' });
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [slotsRes, teamsRes, etabsRes, epreuvesRes, scoresRes] = await Promise.all([
          supabase!.from('planning_slots').select('*'),
          supabase!.from('teams').select('*'),
          supabase!.from('etablissements').select('*'),
          supabase!.from('epreuves').select('*'),
          supabase!.from('scores_suivi_ligne').select('*')
        ]);

        if (cancelled) return;

        if (slotsRes.error) throw slotsRes.error;
        if (teamsRes.error) throw teamsRes.error;
        if (etabsRes.error) throw etabsRes.error;
        if (epreuvesRes.error) throw epreuvesRes.error;
        if (scoresRes.error) throw scoresRes.error;

        // Associer les ID d'épreuves à leurs types respectifs
        const epreuvesMap = new Map<string, string>();
        for (const ep of epreuvesRes.data) {
          epreuvesMap.set(ep.id, ep.type);
        }

        const teamsMap = new Map<string, any>();
        for (const t of teamsRes.data) {
          teamsMap.set(t.id, t);
        }

        const etabsMap = new Map<string, any>();
        for (const etab of etabsRes.data) {
          etabsMap.set(etab.id, etab);
        }

        const scoresMap = new Map<string, number>();
        for (const s of scoresRes.data) {
          scoresMap.set(s.team_id, s.total);
        }

        const piste1: CurrentRow[] = [];
        const piste2: CurrentRow[] = [];

        // Trier les créneaux par heure
        const sortedSlots = [...slotsRes.data].sort((a, b) => {
          const tA = a.heure_presentation || a.heure_debut_rencontres || '00:00:00';
          const tB = b.heure_presentation || b.heure_debut_rencontres || '00:00:00';
          return tA.localeCompare(tB);
        });

        for (const slot of sortedSlots) {
          const epreuveType = epreuvesMap.get(slot.epreuve_id);
          if (epreuveType !== 'suivi_ligne') continue;

          const team = teamsMap.get(slot.team_id);
          if (!team) continue;

          const etab = etabsMap.get(team.etablissement_id);
          const etabName = etab ? `${etab.ville || ''} - ${etab.nom || ''}` : 'Établissement inconnu';

          const timeStr = (slot.heure_presentation || slot.heure_debut_rencontres || '00:00:00').slice(0, 5);

          const hasScore = scoresMap.has(team.id);
          const scoreVal = scoresMap.get(team.id);
          
          let cls: 'done' | 'now' | 'pending' = 'pending';
          let result = '-';
          let immatStatus = 'à venir';

          if (hasScore) {
            cls = 'done';
            result = `${scoreVal} pts`;
            immatStatus = 'terminé';
          } else if (slot.statut === 'en_cours' || slot.observations?.toLowerCase().includes('cours')) {
            cls = 'now';
            result = '● live';
            immatStatus = 'passage en cours';
          }

          const row: CurrentRow = {
            time: timeStr,
            team: etabName,
            immat: `${team.immatriculation} · ${immatStatus}`,
            result,
            cls
          };

          if (slot.zone_rencontres === 'Piste 1') {
            piste1.push(row);
          } else if (slot.zone_rencontres === 'Piste 2') {
            piste2.push(row);
          }
        }

        // Si aucun planning réel n'est trouvé, on bascule sur le mock
        if (piste1.length === 0 && piste2.length === 0) {
          setState({
            piste1: MOCK_PISTE_1,
            piste2: MOCK_PISTE_2,
            loading: false,
            error: null
          });
        } else {
          setState({
            piste1,
            piste2,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          piste1: MOCK_PISTE_1,
          piste2: MOCK_PISTE_2,
          loading: false,
          error: err instanceof Error ? err.message : 'Erreur Supabase'
        });
      }
    };

    fetchData();
    const id = setInterval(fetchData, 10000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return state;
}
