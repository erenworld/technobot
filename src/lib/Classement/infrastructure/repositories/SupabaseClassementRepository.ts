import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { ClassementEntry } from '../../domain/ClassementEntry';

const SUMO_POINTS = [150, 130, 115, 100, 90, 80, 70, 60, 50, 45, 40, 35];
const SUMO_POINTS_DEFAULT = 30;

function getSumoPoints(rang: number): number {
  return SUMO_POINTS[rang - 1] ?? SUMO_POINTS_DEFAULT;
}

interface TeamRow {
  id: string;
  immatriculation: string;
  nom_robot: string | null;
  categorie: string;
  epreuve: string;
  etablissements: { nom: string } | null;
}

interface ScoreDesignRow { team_id: string; total: number | null; }
interface ScorePresColRow { team_id: string; total: number | null; }
interface ScorePresLycRow { team_id: string; total: number | null; }
interface ScoreSuiviRow { team_id: string; total: number | null; }

interface MatchSumoRow {
  team_a_id: string | null;
  team_b_id: string | null;
  vainqueur_team_id: string | null;
}

@Injectable()
export class SupabaseClassementRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async getClassements(editionId: string): Promise<{ colleges: ClassementEntry[]; lycees: ClassementEntry[] }> {
    const [teamsRes, designRes, presColRes, presLycRes, suiviRes, matchsRes] = await Promise.all([
      this.supabase.from('teams').select('id, immatriculation, nom_robot, categorie, epreuve, etablissements(nom)').eq('edition_id', editionId),
      this.supabase.from('scores_design').select('team_id, total'),
      this.supabase.from('scores_presentation_colleges').select('team_id, total'),
      this.supabase.from('scores_presentation_lycees').select('team_id, total'),
      this.supabase.from('scores_suivi_ligne').select('team_id, total'),
      this.supabase.from('matchs_sumo').select('team_a_id, team_b_id, vainqueur_team_id').eq('edition_id', editionId).eq('statut', 'termine'),
    ]);

    if (teamsRes.error) throw new Error(`Error fetching teams: ${teamsRes.error.message}`);

    const teams = ((teamsRes.data ?? []) as unknown) as TeamRow[];
    const designMap = new Map((designRes.data as ScoreDesignRow[] ?? []).map((r) => [r.team_id, r.total ?? 0]));
    const presColMap = new Map((presColRes.data as ScorePresColRow[] ?? []).map((r) => [r.team_id, r.total ?? 0]));
    const presLycMap = new Map((presLycRes.data as ScorePresLycRow[] ?? []).map((r) => [r.team_id, r.total ?? 0]));
    const suiviMap = new Map((suiviRes.data as ScoreSuiviRow[] ?? []).map((r) => [r.team_id, r.total ?? 0]));

    const sumoWins = new Map<string, number>();
    for (const match of (matchsRes.data as MatchSumoRow[] ?? [])) {
      if (match.vainqueur_team_id) {
        sumoWins.set(match.vainqueur_team_id, (sumoWins.get(match.vainqueur_team_id) ?? 0) + 1);
      }
    }

    const allSumoTeamIds = [
      ...new Set([
        ...(matchsRes.data as MatchSumoRow[] ?? []).flatMap((m) => [m.team_a_id, m.team_b_id].filter(Boolean) as string[]),
      ]),
    ];

    const sumoRankings = allSumoTeamIds
      .map((id) => ({ id, wins: sumoWins.get(id) ?? 0 }))
      .sort((a, b) => b.wins - a.wins);

    const sumoRangMap = new Map<string, number>();
    let currentRang = 1;
    for (let i = 0; i < sumoRankings.length; i++) {
      if (i > 0 && sumoRankings[i].wins < sumoRankings[i - 1].wins) {
        currentRang = i + 1;
      }
      sumoRangMap.set(sumoRankings[i].id, currentRang);
    }

    const collegeTeams = teams.filter((t) => t.categorie === 'college');
    const lyceeTeams = teams.filter((t) => t.categorie === 'lycee');

    const colleges = collegeTeams
      .map((t) => {
        const design = designMap.get(t.id) ?? 0;
        const pres = presColMap.get(t.id) ?? 0;
        const suivi = suiviMap.get(t.id) ?? 0;
        return new ClassementEntry({
          rang: 0,
          teamId: t.id,
          immatriculation: t.immatriculation,
          nomRobot: t.nom_robot,
          etablissement: t.etablissements?.nom ?? null,
          totalPoints: design + pres + suivi,
          detailScores: { design, presentation: pres, suivi_ligne: suivi },
        });
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((e, i) => new ClassementEntry({ ...e, rang: i + 1 }));

    const lycees = lyceeTeams
      .filter((t) => t.epreuve === 'sumo')
      .map((t) => {
        const pres = presLycMap.get(t.id) ?? 0;
        const sumoRang = sumoRangMap.get(t.id) ?? lyceeTeams.length;
        const sumoPoints = getSumoPoints(sumoRang);
        return new ClassementEntry({
          rang: 0,
          teamId: t.id,
          immatriculation: t.immatriculation,
          nomRobot: t.nom_robot,
          etablissement: t.etablissements?.nom ?? null,
          totalPoints: pres + sumoPoints,
          detailScores: { presentation: pres, sumo_rang: sumoRang, sumo_points: sumoPoints },
        });
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((e, i) => new ClassementEntry({ ...e, rang: i + 1 }));

    return { colleges, lycees };
  }
}
