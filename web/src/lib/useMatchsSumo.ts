import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type LiveMatchData = {
  id: string;
  zone: string;
  poule: string;
  statut: 'programme' | 'en_cours' | 'termine';
  teamA: {
    immatriculation: string;
    nomRobot: string;
    etablissement: string;
    score: number;
    rounds: ('win' | 'lose' | 'pending')[];
  };
  teamB: {
    immatriculation: string;
    nomRobot: string;
    etablissement: string;
    score: number;
    rounds: ('win' | 'lose' | 'pending')[];
  };
  mancheText: string;
  timerText: string;
  arbitreText: string;
};

export type PouleTeamData = {
  name: string;
  immat: string;
  v: number;
  d: number;
  yuko: number;
  pts: number;
};

export type MatchsSumoState = {
  liveMatches: LiveMatchData[];
  poules: Record<string, PouleTeamData[]>;
  loading: boolean;
  error: string | null;
};

// Mocks de secours complets
const MOCK_LIVE: LiveMatchData[] = [
  {
    id: 'mock-1',
    zone: 'Sumo 1',
    poule: 'A',
    statut: 'en_cours',
    teamA: { immatriculation: 'SL01', nomRobot: 'HTL Innsbrück', etablissement: 'HTL Innsbrück\nHayange', score: 2, rounds: ['win', 'win', 'pending'] },
    teamB: { immatriculation: 'SL04', nomRobot: 'La Briquerie', etablissement: 'La Briquerie\nThionville', score: 1, rounds: ['lose', 'win', 'pending'] },
    mancheText: 'Manche 3 / 3',
    timerText: '01:34',
    arbitreText: 'Heckel'
  },
  {
    id: 'mock-2',
    zone: 'Sumo 2',
    poule: 'B',
    statut: 'programme',
    teamA: { immatriculation: 'SL09', nomRobot: 'Mermoz Saint-Louis', etablissement: 'Mermoz\nSaint-Louis', score: 0, rounds: ['pending', 'pending', 'pending'] },
    teamB: { immatriculation: 'SL18', nomRobot: 'Julie Daubié', etablissement: 'Julie Daubié\nRombas', score: 0, rounds: ['pending', 'pending', 'pending'] },
    mancheText: 'Démarrage dans',
    timerText: '03:45',
    arbitreText: 'La Neve'
  }
];

const MOCK_POULES: Record<string, PouleTeamData[]> = {
  A: [
    { name: 'HTL Innsbrück', immat: 'SL01', v: 3, d: 0, yuko: 6, pts: 150 },
    { name: 'Mermoz Saint-Louis', immat: 'SL08', v: 2, d: 1, yuko: 4, pts: 130 },
    { name: 'Mermoz Saint-Louis', immat: 'SL12', v: 1, d: 2, yuko: 2, pts: 115 },
    { name: 'La Briquerie', immat: 'SL04', v: 1, d: 2, yuko: 2, pts: 100 },
    { name: 'Julie Daubié Rombas', immat: 'SL17', v: 0, d: 3, yuko: 0, pts: 90 },
  ],
  B: [
    { name: 'Mermoz Saint-Louis', immat: 'SL13', v: 3, d: 0, yuko: 6, pts: 150 },
    { name: 'La Briquerie', immat: 'SL05', v: 2, d: 1, yuko: 5, pts: 130 },
    { name: 'HTL Innsbrück', immat: 'SL02', v: 2, d: 1, yuko: 4, pts: 115 },
    { name: 'Mermoz Saint-Louis', immat: 'SL09', v: 1, d: 2, yuko: 2, pts: 100 },
    { name: 'Julie Daubié Rombas', immat: 'SL18', v: 0, d: 3, yuko: 0, pts: 90 },
  ],
  C: [
    { name: 'Mermoz Saint-Louis', immat: 'SL14', v: 4, d: 0, yuko: 8, pts: 150 },
    { name: 'HTL Innsbrück', immat: 'SL03', v: 3, d: 1, yuko: 6, pts: 130 },
    { name: 'Julie Daubié Rombas', immat: 'SL19', v: 2, d: 2, yuko: 4, pts: 115 },
    { name: 'La Briquerie', immat: 'SL06', v: 1, d: 3, yuko: 2, pts: 100 },
    { name: 'Mermoz Saint-Louis', immat: 'SL10', v: 0, d: 4, yuko: 0, pts: 90 },
  ],
  D: [
    { name: 'Mermoz Saint-Louis', immat: 'SL11', v: 3, d: 0, yuko: 6, pts: 150 },
    { name: 'La Briquerie', immat: 'SL07', v: 2, d: 1, yuko: 5, pts: 130 },
    { name: 'Mermoz Saint-Louis', immat: 'SL15', v: 2, d: 1, yuko: 3, pts: 115 },
    { name: 'Julie Daubié Rombas', immat: 'SL16', v: 1, d: 2, yuko: 2, pts: 100 },
    { name: 'Julie Daubié Rombas', immat: 'SL20', v: 0, d: 3, yuko: 1, pts: 90 },
  ],
};

export function useMatchsSumo(): MatchsSumoState {
  const [state, setState] = useState<MatchsSumoState>({ liveMatches: [], poules: {}, loading: true, error: null });

  useEffect(() => {
    if (!supabase) {
      setState({ liveMatches: MOCK_LIVE, poules: MOCK_POULES, loading: false, error: 'Supabase non configuré' });
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [matchsRes, rencontresRes, teamsRes, etabsRes] = await Promise.all([
          supabase!.from('matchs_sumo').select('*'),
          supabase!.from('rencontres_sumo').select('*'),
          supabase!.from('teams').select('*'),
          supabase!.from('etablissements').select('*')
        ]);

        if (cancelled) return;

        if (matchsRes.error) throw matchsRes.error;
        if (rencontresRes.error) throw rencontresRes.error;
        if (teamsRes.error) throw teamsRes.error;
        if (etabsRes.error) throw etabsRes.error;

        const teamsMap = new Map<string, any>();
        for (const t of teamsRes.data) {
          teamsMap.set(t.id, t);
        }

        const etabsMap = new Map<string, any>();
        for (const e of etabsRes.data) {
          etabsMap.set(e.id, e);
        }

        const rencontresByMatch = new Map<string, any[]>();
        for (const r of rencontresRes.data) {
          const list = rencontresByMatch.get(r.match_id) ?? [];
          list.push(r);
          rencontresByMatch.set(r.match_id, list);
        }

        // 1. Extraire les matchs en cours ou programmés
        const liveMatches: LiveMatchData[] = [];
        const activeMatches = matchsRes.data.filter(m => m.statut === 'en_cours' || m.statut === 'programme');

        for (const match of activeMatches) {
          const teamA = teamsMap.get(match.team_a_id);
          const teamB = teamsMap.get(match.team_b_id);
          if (!teamA || !teamB) continue;

          const etabA = etabsMap.get(teamA.etablissement_id);
          const etabB = etabsMap.get(teamB.etablissement_id);

          const etabNameA = etabA ? `${etabA.nom} ${etabA.ville ? '\n' + etabA.ville : ''}` : 'Inconnu';
          const etabNameB = etabB ? `${etabB.nom} ${etabB.ville ? '\n' + etabB.ville : ''}` : 'Inconnu';

          const matchRencontres = (rencontresByMatch.get(match.id) ?? []).sort((a, b) => a.numero_rencontre - b.numero_rencontre);
          
          let scoreA = 0;
          let scoreB = 0;
          const roundsA: ('win' | 'lose' | 'pending')[] = [];
          const roundsB: ('win' | 'lose' | 'pending')[] = [];

          for (let i = 0; i < 3; i++) {
            const r = matchRencontres[i];
            if (r) {
              if (r.vainqueur_id === teamA.id) {
                scoreA++;
                roundsA.push('win');
                roundsB.push('lose');
              } else if (r.vainqueur_id === teamB.id) {
                scoreB++;
                roundsA.push('lose');
                roundsB.push('win');
              } else {
                roundsA.push('pending');
                roundsB.push('pending');
              }
            } else {
              roundsA.push('pending');
              roundsB.push('pending');
            }
          }

          const playedRounds = matchRencontres.filter(r => r.vainqueur_id).length;
          const timerText = match.statut === 'en_cours' ? '01:15' : '03:00';
          const arbitreText = match.observations?.includes('Arbitre') ? match.observations.split('·')[1]?.trim() ?? 'Arbitre' : 'Arbitre';

          liveMatches.push({
            id: match.id,
            zone: match.zone,
            poule: match.poule,
            statut: match.statut,
            teamA: {
              immatriculation: teamA.immatriculation,
              nomRobot: teamA.nom_robot || 'Robot A',
              etablissement: etabNameA,
              score: scoreA,
              rounds: roundsA
            },
            teamB: {
              immatriculation: teamB.immatriculation,
              nomRobot: teamB.nom_robot || 'Robot B',
              etablissement: etabNameB,
              score: scoreB,
              rounds: roundsB
            },
            mancheText: match.statut === 'en_cours' ? `Manche ${playedRounds + 1} / 3` : 'Démarrage dans',
            timerText,
            arbitreText
          });
        }

        // 2. Calculer le classement des Poules
        const pouleStats: Record<string, Record<string, { wins: number; losses: number; yukos: number; matchesPlayed: number }>> = {
          A: {}, B: {}, C: {}, D: {}
        };

        // Initialiser toutes les équipes Sumo
        for (const team of teamsRes.data) {
          if (team.epreuve === 'sumo') {
            const p = team.poule || 'A';
            if (!pouleStats[p]) pouleStats[p] = {};
            pouleStats[p][team.id] = { wins: 0, losses: 0, yukos: 0, matchesPlayed: 0 };
          }
        }

        // Ajouter les statistiques des matchs terminés
        for (const match of matchsRes.data) {
          if (match.statut !== 'termine') continue;
          
          const p = match.poule || 'A';
          if (!pouleStats[p]) pouleStats[p] = {};

          const idA = match.team_a_id;
          const idB = match.team_b_id;

          if (idA && !pouleStats[p][idA]) pouleStats[p][idA] = { wins: 0, losses: 0, yukos: 0, matchesPlayed: 0 };
          if (idB && !pouleStats[p][idB]) pouleStats[p][idB] = { wins: 0, losses: 0, yukos: 0, matchesPlayed: 0 };

          if (idA) pouleStats[p][idA].matchesPlayed++;
          if (idB) pouleStats[p][idB].matchesPlayed++;

          if (match.vainqueur_team_id === idA) {
            if (idA) pouleStats[p][idA].wins++;
            if (idB) pouleStats[p][idB].losses++;
          } else if (match.vainqueur_team_id === idB) {
            if (idB) pouleStats[p][idB].wins++;
            if (idA) pouleStats[p][idA].losses++;
          }

          const matchRencontres = rencontresByMatch.get(match.id) ?? [];
          for (const r of matchRencontres) {
            if (idA) pouleStats[p][idA].yukos += (r.yuko_a || 0);
            if (idB) pouleStats[p][idB].yukos += (r.yuko_b || 0);
          }
        }

        const poules: Record<string, PouleTeamData[]> = {};

        for (const p of ['A', 'B', 'C', 'D']) {
          const pTeams = pouleStats[p] ?? {};
          const list: PouleTeamData[] = [];

          for (const [teamId, stats] of Object.entries(pTeams)) {
            const team = teamsMap.get(teamId);
            if (!team) continue;

            const etab = etabsMap.get(team.etablissement_id);
            const etabName = etab ? etab.nom : 'Inconnu';

            // pts = wins * 15 + yuko * 5 + 75 si au moins un match joué
            const pts = stats.matchesPlayed > 0 ? (stats.wins * 15 + stats.yukos * 5 + 75) : 0;

            list.push({
              name: etabName,
              immat: team.immatriculation,
              v: stats.wins,
              d: stats.losses,
              yuko: stats.yukos,
              pts
            });
          }

          list.sort((a, b) => b.pts - a.pts || b.v - a.v || b.yuko - a.yuko);
          poules[p] = list;
        }

        // Si la base ne contient aucun match, on charge les mocks
        const hasAnyMatches = Object.values(poules).some(arr => arr.some(t => t.v > 0 || t.yuko > 0));

        if (!hasAnyMatches) {
          setState({
            liveMatches: MOCK_LIVE,
            poules: MOCK_POULES,
            loading: false,
            error: null
          });
        } else {
          setState({
            liveMatches,
            poules,
            loading: false,
            error: null
          });
        }

      } catch (err) {
        if (cancelled) return;
        setState({
          liveMatches: MOCK_LIVE,
          poules: MOCK_POULES,
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
