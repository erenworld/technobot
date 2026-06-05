import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useEtablissements } from '../lib/useEtablissements';
import { Epreuve, EpreuveDB, Team } from '../types/api';

/**
 * Onglet Classement — console admin.
 *
 * Collèges : classement par épreuve + classement général par école (somme des 4 robots).
 * Lycées   : classement unique combinant présentation + rencontres sumo.
 */

type ClassFilter =
  | 'general_college'
  | 'general_lycee'
  | 'design'
  | 'presentation_college'
  | 'suivi_ligne'
  | 'formule_robot'
  | 'presentation_lycee'
  | 'sumo_lycee';

const FILTER_LABELS: Record<ClassFilter, string> = {
  general_college: 'Général — Collèges',
  general_lycee: 'Général — Lycées',
  design: 'Design',
  presentation_college: 'Présentation collège',
  suivi_ligne: 'Suivi de ligne',
  formule_robot: 'Formule robot',
  presentation_lycee: 'Présentation lycée',
  sumo_lycee: 'Sumo lycée',
};

/* ---- Types pour les scores bruts Supabase ---- */
type ScoreRow = { id: string; team_id: string | null; total: number | null; observations?: string | null; jury_id?: string | null; created_at?: string | null };
type SuiviRow = { id: string; team_id: string | null; distance_pct: number | null; parcours_fini: boolean | null; calcul_500_temps: number | null; bonus_trace_1: boolean | null; bonus_trace_2: boolean | null; bonus_trace_3: boolean | null; bonus_trace_4: boolean | null; bonus_trace_5: boolean | null; bonus_trace_6: boolean | null; total: number | null; created_at?: string | null };
type ClassRow = { id: string; team_id: string | null; epreuve_id: string | null; rang: number; points: number; created_at?: string | null };

type RankEntry = { rang: number; teamId: string; nomRobot: string; etab: string; score: number; detail?: string };
type SchoolEntry = { rang: number; etabId: string; etabNom: string; scores: Record<string, number>; total: number };

export function AdminClassement() {
  const [filter, setFilter] = useState<ClassFilter>('general_college');
  const [teams, setTeams] = useState<Team[]>([]);
  const [epreuves, setEpreuves] = useState<EpreuveDB[]>([]);
  const [scoresDesign, setScoresDesign] = useState<ScoreRow[]>([]);
  const [scoresPresCollege, setScoresPresCollege] = useState<ScoreRow[]>([]);
  const [scoresPresLycee, setScoresPresLycee] = useState<ScoreRow[]>([]);
  const [scoresSuivi, setScoresSuivi] = useState<SuiviRow[]>([]);
  const [scoresClassement, setScoresClassement] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const etabs = useEtablissements();

  useEffect(() => {
    if (!supabase) { setLoading(false); setError("Supabase n'est pas configuré."); return; }
    let cancelled = false;

    Promise.all([
      supabase.from('teams').select('*'),
      supabase.from('epreuves').select('*'),
      supabase.from('scores_design').select('*').order('created_at', { ascending: false }),
      supabase.from('scores_presentation_colleges').select('*').order('created_at', { ascending: false }),
      supabase.from('scores_presentation_lycees').select('*').order('created_at', { ascending: false }),
      supabase.from('scores_suivi_ligne').select('*').order('created_at', { ascending: false }),
      supabase.from('scores_classement').select('*').order('rang', { ascending: true }),
    ]).then(([t, ep, sd, spc, spl, ssl, sc]) => {
      if (cancelled) return;
      if (t.error) setError(t.error.message);
      setTeams((t.data ?? []) as Team[]);
      setEpreuves((ep.data ?? []) as EpreuveDB[]);
      setScoresDesign((sd.data ?? []) as ScoreRow[]);
      setScoresPresCollege((spc.data ?? []) as ScoreRow[]);
      setScoresPresLycee((spl.data ?? []) as ScoreRow[]);
      setScoresSuivi((ssl.data ?? []) as SuiviRow[]);
      setScoresClassement((sc.data ?? []) as ClassRow[]);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const teamById = useMemo(() => {
    const m: Record<string, Team> = {};
    for (const t of teams) m[t.id] = t;
    return m;
  }, [teams]);

  const epreuveById = useMemo(() => {
    const m: Record<string, EpreuveDB> = {};
    for (const ep of epreuves) m[ep.id] = ep;
    return m;
  }, [epreuves]);

  /** Meilleur score par équipe (dernière entrée pour critères, max pour suivi). */
  function bestScoreByTeam(rows: ScoreRow[]): Record<string, number> {
    const best: Record<string, number> = {};
    for (const r of rows) {
      if (!r.team_id || r.total == null) continue;
      if (best[r.team_id] == null || r.total > best[r.team_id]) best[r.team_id] = r.total;
    }
    return best;
  }

  function bestSuiviByTeam(): Record<string, number> {
    const best: Record<string, number> = {};
    for (const r of scoresSuivi) {
      if (!r.team_id) continue;
      const bonuses = [r.bonus_trace_1, r.bonus_trace_2, r.bonus_trace_3, r.bonus_trace_4, r.bonus_trace_5, r.bonus_trace_6].filter(Boolean).length * 5;
      const score = (r.distance_pct ?? 0) + (r.parcours_fini ? 50 : 0) + (r.calcul_500_temps ?? 0) + bonuses;
      if (best[r.team_id] == null || score > best[r.team_id]) best[r.team_id] = score;
    }
    return best;
  }

  function classementByTeam(epType: string): Record<string, number> {
    const best: Record<string, number> = {};
    for (const r of scoresClassement) {
      if (!r.team_id || !r.epreuve_id) continue;
      if (epreuveById[r.epreuve_id]?.type !== epType) continue;
      if (best[r.team_id] == null || r.points > best[r.team_id]) best[r.team_id] = r.points;
    }
    return best;
  }

  function makeRanking(scoreMap: Record<string, number>, categorie: 'college' | 'lycee', epreuveType?: string): RankEntry[] {
    const entries: RankEntry[] = [];
    for (const [teamId, score] of Object.entries(scoreMap)) {
      const team = teamById[teamId];
      if (!team) continue;
      if (team.categorie !== categorie) continue;
      if (epreuveType && team.epreuve !== epreuveType) continue;
      const etabName = team.etablissement_id ? etabs.byId[team.etablissement_id]?.nom ?? '—' : '—';
      entries.push({ rang: 0, teamId, nomRobot: team.nom_robot || '—', etab: etabName, score });
    }
    entries.sort((a, b) => b.score - a.score);
    let currentRang = 1;
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].score === entries[i - 1].score) {
        entries[i].rang = entries[i - 1].rang;
      } else {
        entries[i].rang = currentRang;
      }
      currentRang++;
    }
    return entries;
  }

  /* ---- Classement général collèges (par école) ---- */
  const generalCollege = useMemo((): SchoolEntry[] => {
    const designMap = bestScoreByTeam(scoresDesign);
    const presMap = bestScoreByTeam(scoresPresCollege);
    const suiviMap = bestSuiviByTeam();
    const formuleMap = classementByTeam('formule_robot');

    const schoolScores: Record<string, { design: number; presentation: number; suivi: number; formule: number }> = {};

    for (const team of teams) {
      if (team.categorie !== 'college' || !team.etablissement_id) continue;
      const etabId = team.etablissement_id;
      if (!schoolScores[etabId]) schoolScores[etabId] = { design: 0, presentation: 0, suivi: 0, formule: 0 };
      if (team.epreuve === 'design') schoolScores[etabId].design += designMap[team.id] ?? 0;
      if (team.epreuve === 'presentation_projet') schoolScores[etabId].presentation += presMap[team.id] ?? 0;
      if (team.epreuve === 'suivi_ligne') schoolScores[etabId].suivi += suiviMap[team.id] ?? 0;
      if (team.epreuve === 'formule_robot') schoolScores[etabId].formule += formuleMap[team.id] ?? 0;
    }

    const entries: SchoolEntry[] = Object.entries(schoolScores).map(([etabId, s]) => ({
      rang: 0,
      etabId,
      etabNom: etabs.byId[etabId]?.nom ?? etabId.slice(0, 8),
      scores: s,
      total: s.design + s.presentation + s.suivi + s.formule,
    }));

    entries.sort((a, b) => b.total - a.total);
    let rang = 1;
    for (let i = 0; i < entries.length; i++) {
      entries[i].rang = i > 0 && entries[i].total === entries[i - 1].total ? entries[i - 1].rang : rang;
      rang++;
    }
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, scoresDesign, scoresPresCollege, scoresSuivi, scoresClassement, etabs.byId, epreuveById]);

  /* ---- Classement général lycées ---- */
  const generalLycee = useMemo((): RankEntry[] => {
    const presMap = bestScoreByTeam(scoresPresLycee);
    const sumoMap = classementByTeam('sumo');
    const combined: Record<string, number> = {};
    for (const team of teams) {
      if (team.categorie !== 'lycee') continue;
      combined[team.id] = (presMap[team.id] ?? 0) + (sumoMap[team.id] ?? 0);
    }
    return makeRanking(combined, 'lycee');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, scoresPresLycee, scoresClassement, epreuveById, etabs.byId]);

  /* ---- Classements par épreuve ---- */
  const rankingMap = useMemo((): Record<ClassFilter, RankEntry[]> => ({
    general_college: [],
    general_lycee: [],
    design: makeRanking(bestScoreByTeam(scoresDesign), 'college', 'design'),
    presentation_college: makeRanking(bestScoreByTeam(scoresPresCollege), 'college', 'presentation_projet'),
    suivi_ligne: makeRanking(bestSuiviByTeam(), 'college', 'suivi_ligne'),
    formule_robot: makeRanking(classementByTeam('formule_robot'), 'college', 'formule_robot'),
    presentation_lycee: makeRanking(bestScoreByTeam(scoresPresLycee), 'lycee', 'presentation_projet'),
    sumo_lycee: makeRanking(classementByTeam('sumo'), 'lycee', 'sumo'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [teams, scoresDesign, scoresPresCollege, scoresPresLycee, scoresSuivi, scoresClassement, epreuveById, etabs.byId]);

  /* ---- Render ---- */
  return (
    <div className="form-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <main className="form-main">
        <div className="form-section active">
          <div className="form-section-head">
            <div className="form-section-eyebrow">// Classements</div>
            <h2>Classements.</h2>
            <p>
              Collèges : classement par épreuve et classement général par école (somme des 4 robots).<br />
              Lycées : classement unique combinant présentation + rencontres sumo.
            </p>
          </div>

          {/* Barre de filtres */}
          <div className="events-tabs" role="tablist" style={{ marginBottom: 28 }}>
            {(Object.keys(FILTER_LABELS) as ClassFilter[]).map((f) => (
              <button key={f} type="button" role="tab"
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {loading && (
            <div className="callout">
              <div className="callout-label">→ Chargement</div>
              Récupération des scores…
            </div>
          )}
          {error && (
            <div className="callout warn">
              <div className="callout-label">→ Erreur</div>
              {error}
            </div>
          )}

          {!loading && !error && filter === 'general_college' && (
            <SchoolRanking entries={generalCollege} />
          )}
          {!loading && !error && filter === 'general_lycee' && (
            <TeamRanking entries={generalLycee} subtitle="Points présentation + rencontres sumo" />
          )}
          {!loading && !error && filter !== 'general_college' && filter !== 'general_lycee' && (
            <TeamRanking entries={rankingMap[filter]} subtitle={FILTER_LABELS[filter]} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ======================== Vue classement par équipe ======================== */

function TeamRanking({ entries, subtitle }: { entries: RankEntry[]; subtitle: string }) {
  if (entries.length === 0) {
    return (
      <div className="callout">
        <div className="callout-label">→ Aucune note</div>
        Aucun score enregistré pour cette épreuve.
      </div>
    );
  }

  return (
    <div>
      <div className="field-group-title">{subtitle} · {entries.length} équipe{entries.length > 1 ? 's' : ''}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map((e) => (
          <div key={e.teamId} className="rank-card-grid" style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr auto',
            alignItems: 'center',
            gap: 12,
            background: e.rang <= 3 ? podiumBg(e.rang) : 'var(--paper)',
            border: `1px solid ${e.rang <= 3 ? podiumBorder(e.rang) : 'var(--line)'}`,
            borderRadius: 'var(--radius)',
            padding: '10px 16px',
          }}>
            <div style={{ fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 18, color: e.rang <= 3 ? podiumColor(e.rang) : 'var(--muted)', textAlign: 'center' }}>
              {e.rang === 1 ? '🥇' : e.rang === 2 ? '🥈' : e.rang === 3 ? '🥉' : `${e.rang}`}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nomRobot}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.etab}</div>
            </div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {typeof e.score === 'number' ? Math.round(e.score * 100) / 100 : e.score}
              <span className="rank-pts-label" style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================== Vue classement par école ======================== */

function SchoolRanking({ entries }: { entries: SchoolEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="callout">
        <div className="callout-label">→ Aucune note</div>
        Aucun score enregistré.
      </div>
    );
  }

  return (
    <div>
      <div className="field-group-title">Classement général collèges · {entries.length} école{entries.length > 1 ? 's' : ''}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--cream-2)', borderBottom: '2px solid var(--line)' }}>
              <th style={thStyle}>Rang</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>École</th>
              <th style={thStyle}>Design</th>
              <th style={thStyle}>Présentation</th>
              <th style={thStyle}>Suivi</th>
              <th style={thStyle}>Formule</th>
              <th style={{ ...thStyle, fontWeight: 700 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.etabId} style={{ borderBottom: '1px solid var(--line)', background: e.rang <= 3 ? podiumBg(e.rang) : 'var(--paper)' }}>
                <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 18, color: e.rang <= 3 ? podiumColor(e.rang) : 'var(--muted)' }}>
                  {e.rang === 1 ? '🥇' : e.rang === 2 ? '🥈' : e.rang === 3 ? '🥉' : `${e.rang}`}
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{e.etabNom}</td>
                <td style={numStyle}>{e.scores.design || '—'}</td>
                <td style={numStyle}>{e.scores.presentation || '—'}</td>
                <td style={numStyle}>{e.scores.suivi ? Math.round(e.scores.suivi * 10) / 10 : '—'}</td>
                <td style={numStyle}>{e.scores.formule || '—'}</td>
                <td style={{ ...numStyle, fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{Math.round(e.total * 10) / 10}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================== Helpers podium ======================== */

function podiumBg(rang: number) {
  if (rang === 1) return 'rgba(255, 209, 102, 0.15)';
  if (rang === 2) return 'rgba(180, 180, 180, 0.12)';
  return 'rgba(205, 127, 50, 0.1)';
}
function podiumBorder(rang: number) {
  if (rang === 1) return 'var(--yellow)';
  if (rang === 2) return '#b4b4b4';
  return '#cd7f32';
}
function podiumColor(rang: number) {
  if (rang === 1) return '#a07800';
  if (rang === 2) return '#555';
  return '#7a4a1e';
}

const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 400 };
const tdStyle: React.CSSProperties = { padding: '10px 12px' };
const numStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right', fontFamily: 'var(--ff-mono)', fontSize: 13 };
