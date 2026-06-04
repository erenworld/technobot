import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Categorie, Team } from '../types/api';

/**
 * Formulaire de notation inline — utilisé depuis le planning.
 * Détermine automatiquement la grille en fonction du type d'épreuve + catégorie.
 */

/* ======================== Grilles de classement ======================== */

/** Formule Robot collège — barème officiel du règlement. */
const FORMULE_POINTS: Record<number, number> = {
  1: 275, 2: 198, 3: 165, 4: 132, 5: 110, 6: 88,
  7: 66, 8: 44, 9: 22, 10: 11, 11: 10, 12: 9,
  13: 8, 14: 7, 15: 6, 16: 5, 17: 4, 18: 3, 19: 2, 20: 1,
};

/**
 * Sumo Lycée rencontres — à valider avec l'organisateur.
 * Ex-aequo possible à partir de la 5e place.
 */
const SUMO_LYCEE_POINTS: Record<number, number> = {
  1: 150, 2: 130, 3: 110, 4: 90, 5: 75, 6: 64,
  7: 57, 8: 53, 9: 50, 10: 45, 11: 40, 12: 35,
};

/* ======================== Type de scoring ======================== */

type ScoreType =
  | 'design'
  | 'presentation_college'
  | 'presentation_lycee'
  | 'suivi_ligne'
  | 'formule_robot'
  | 'sumo_lycee';

function getScoreType(epreuveType: string, categorie: Categorie): ScoreType | null {
  if (epreuveType === 'design') return 'design';
  if (epreuveType === 'presentation_projet' && categorie === 'college') return 'presentation_college';
  if (epreuveType === 'presentation_projet' && categorie === 'lycee') return 'presentation_lycee';
  if (epreuveType === 'suivi_ligne') return 'suivi_ligne';
  if (epreuveType === 'formule_robot') return 'formule_robot';
  if (epreuveType === 'sumo' && categorie === 'lycee') return 'sumo_lycee';
  return null;
}

const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  design: 'Design',
  presentation_college: 'Présentation de projet — Collèges',
  presentation_lycee: 'Présentation SUMO — Lycées',
  suivi_ligne: 'Suivi de ligne',
  formule_robot: 'Formule robot — Classement',
  sumo_lycee: 'Sumo lycée — Classement',
};

/* ======================== État des formulaires ======================== */

type DesignValues = {
  access_interrupteur: number; refroid_carte: number;
  acces_cable_prog: number; facilite_piles: number; solidite: number;
  homogeneite: number; oeuvre_originale: number; qualite_visuelle: number;
  dissimulation_pieces: number; qualite_affiche: number; qualite_echange: number;
  bonus_suivi_ovale: boolean; bonus_connecte: boolean;
};

type PresentationCollegeValues = {
  aisance: number; langues: number; contenu: number; outils: number;
  bonus_suivi_ovale: boolean; bonus_connecte: boolean;
};

type PresentationLyceeValues = {
  repartition_temps_parole: number; qualite_visuel_presentation: number;
  justesse_technique: number; competences_linguistiques: number;
  vocabulaire_technique: number; dossier_technique_lv: number; echanges_techniques: number;
};

type SuiviLigneValues = {
  distance_pct: number; parcours_fini: boolean; temps_secondes: number;
  bonus_trace_1: boolean; bonus_trace_2: boolean; bonus_trace_3: boolean;
  bonus_trace_4: boolean; bonus_trace_5: boolean; bonus_trace_6: boolean;
};

type ClassementValues = { rang: number };

/* ======================== Helpers table ======================== */

function tableForType(t: ScoreType): string {
  switch (t) {
    case 'design': return 'scores_design';
    case 'presentation_college': return 'scores_presentation_colleges';
    case 'presentation_lycee': return 'scores_presentation_lycees';
    case 'suivi_ligne': return 'scores_suivi_ligne';
    case 'formule_robot':
    case 'sumo_lycee': return 'scores_classement';
  }
}

type ExistingScore = { id: string; label: string; createdAt: string | null };

async function fetchExisting(scoreType: ScoreType, teamId: string, epreuveId: string): Promise<ExistingScore[]> {
  if (!supabase) return [];
  const table = tableForType(scoreType);
  const isClassement = scoreType === 'formule_robot' || scoreType === 'sumo_lycee';

  const query = supabase
    .from(table)
    .select(isClassement ? 'id, rang, points, created_at' : 'id, total, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (isClassement) query.eq('epreuve_id', epreuveId);

  const { data } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    label: isClassement
      ? `${r.rang}e place — ${r.points} pts`
      : `Total : ${typeof r.total === 'number' ? Math.round(r.total * 100) / 100 : r.total} pts`,
    createdAt: (r.created_at ?? null) as string | null,
  }));
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

/* ======================== Calculs de totaux ======================== */

function totalDesign(v: DesignValues): number {
  return v.access_interrupteur + v.refroid_carte + v.acces_cable_prog +
    v.facilite_piles + v.solidite + v.homogeneite + v.oeuvre_originale +
    v.qualite_visuelle + v.dissimulation_pieces + v.qualite_affiche + v.qualite_echange +
    (v.bonus_suivi_ovale ? 10 : 0) + (v.bonus_connecte ? 10 : 0);
}

function totalPresentationCollege(v: PresentationCollegeValues): number {
  return v.aisance + v.langues + v.contenu + v.outils +
    (v.bonus_suivi_ovale ? 10 : 0) + (v.bonus_connecte ? 10 : 0);
}

function totalPresentationLycee(v: PresentationLyceeValues): number {
  return v.repartition_temps_parole + v.qualite_visuel_presentation +
    v.justesse_technique + v.competences_linguistiques +
    v.vocabulaire_technique + v.dossier_technique_lv + v.echanges_techniques;
}

function totalSuiviLigne(v: SuiviLigneValues): number {
  const calcul = v.temps_secondes > 0 ? 500 / v.temps_secondes : 0;
  const bonuses = [v.bonus_trace_1, v.bonus_trace_2, v.bonus_trace_3,
    v.bonus_trace_4, v.bonus_trace_5, v.bonus_trace_6].filter(Boolean).length * 5;
  return v.distance_pct + (v.parcours_fini ? 50 : 0) + calcul + bonuses;
}

/* ======================== Composant principal ======================== */

export function AdminScoringForm({
  team,
  epreuveType,
  epreuveId,
  onDone,
  onCancel,
}: {
  team: Team;
  epreuveType: string;
  epreuveId: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const { profile } = useAuth();
  const scoreType = getScoreType(epreuveType, team.categorie);

  const [existing, setExisting] = useState<ExistingScore[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!scoreType) return;
    fetchExisting(scoreType, team.id, epreuveId).then(setExisting);
  }, [scoreType, team.id, epreuveId]);

  async function handleDelete(id: string) {
    if (!supabase || !scoreType) return;
    setDeletingId(id);
    const { error } = await supabase.from(tableForType(scoreType)).delete().eq('id', id);
    if (!error) {
      setExisting((cur) => cur.filter((s) => s.id !== id));
      setConfirmId(null);
    }
    setDeletingId(null);
  }

  if (!scoreType) {
    return (
      <div className="callout warn">
        <div className="callout-label">→ Non supporté</div>
        Aucune grille de notation pour : épreuve <em>{epreuveType}</em> / catégorie <em>{team.categorie}</em>.
      </div>
    );
  }

  const juryId = profile?.id ?? null;

  function onScoreSaved() {
    fetchExisting(scoreType!, team.id, epreuveId).then(setExisting);
    onDone();
  }

  const commonProps = { team, epreuveId, juryId, onDone: onScoreSaved, onCancel };

  return (
    <div style={{ borderTop: '2px solid var(--ink)', background: 'var(--cream)', padding: '20px 20px' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        // Notation · {SCORE_TYPE_LABELS[scoreType]}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
        {team.immatriculation} · {team.nom_robot || <em style={{ color: 'var(--muted)' }}>Sans nom</em>}
      </div>

      {/* Notes existantes */}
      {existing.length > 0 && (
        <div style={{ marginBottom: 20, border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', background: 'var(--cream-2)', fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>
            Notes enregistrées ({existing.length})
          </div>
          {existing.map((s) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--muted)' }}>{fmtDate(s.createdAt)}</div>
              </div>
              {confirmId === s.id ? (
                <>
                  <span style={{ fontSize: 12, color: 'var(--red)' }}>Confirmer ?</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setConfirmId(null)} disabled={deletingId === s.id}>Annuler</button>
                    <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }} disabled={deletingId === s.id} onClick={() => handleDelete(s.id)}>
                      {deletingId === s.id ? '…' : 'Supprimer'}
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => setConfirmId(s.id)}>
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {scoreType === 'design' && <DesignForm {...commonProps} />}
      {scoreType === 'presentation_college' && <PresentationCollegeForm {...commonProps} />}
      {scoreType === 'presentation_lycee' && <PresentationLyceeForm {...commonProps} />}
      {scoreType === 'suivi_ligne' && <SuiviLigneForm {...commonProps} />}
      {scoreType === 'formule_robot' && <ClassementForm {...commonProps} grid={FORMULE_POINTS} maxRang={20} exAequoAfter={4} />}
      {scoreType === 'sumo_lycee' && <ClassementForm {...commonProps} grid={SUMO_LYCEE_POINTS} maxRang={12} exAequoAfter={4} />}
    </div>
  );
}

/* ======================== Formulaire Design ======================== */

function DesignForm({ team, epreuveId, juryId, onDone, onCancel }: FormProps) {
  const [v, setV] = useState<DesignValues>({
    access_interrupteur: 0, refroid_carte: 0, acces_cable_prog: 0,
    facilite_piles: 0, solidite: 0, homogeneite: 0, oeuvre_originale: 0,
    qualite_visuelle: 0, dissimulation_pieces: 0, qualite_affiche: 0,
    qualite_echange: 0, bonus_suivi_ovale: false, bonus_connecte: false,
  });
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !team.id) return;
    supabase
      .from('scores_design')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const row = data[0];
          setExistingId(row.id);
          setV({
            access_interrupteur: row.access_interrupteur ?? 0,
            refroid_carte: row.refroid_carte ?? 0,
            acces_cable_prog: row.acces_cable_prog ?? 0,
            facilite_piles: row.facilite_piles ?? 0,
            solidite: row.solidite ?? 0,
            homogeneite: row.homogeneite ?? 0,
            oeuvre_originale: row.oeuvre_originale ?? 0,
            qualite_visuelle: row.qualite_visuelle ?? 0,
            dissimulation_pieces: row.dissimulation_pieces ?? 0,
            qualite_affiche: row.qualite_affiche ?? 0,
            qualite_echange: row.qualite_echange ?? 0,
            bonus_suivi_ovale: row.bonus_suivi_ovale ?? false,
            bonus_connecte: row.bonus_connecte ?? false,
          });
          setObs(row.observations ?? '');
        }
      });
  }, [team.id]);

  const total = totalDesign(v);

  async function submit() {
    if (!supabase) return;
    setSaving(true); setError(null);
    const payload = {
      team_id: team.id, jury_id: juryId,
      access_interrupteur: v.access_interrupteur, refroid_carte: v.refroid_carte,
      acces_cable_prog: v.acces_cable_prog, facilite_piles: v.facilite_piles,
      solidite: v.solidite, homogeneite: v.homogeneite, oeuvre_originale: v.oeuvre_originale,
      qualite_visuelle: v.qualite_visuelle, dissimulation_pieces: v.dissimulation_pieces,
      qualite_affiche: v.qualite_affiche, qualite_echange: v.qualite_echange,
      bonus_suivi_ovale: v.bonus_suivi_ovale, bonus_connecte: v.bonus_connecte,
      observations: obs.trim() || null,
      // `total` est une colonne générée par le DB — ne pas l'envoyer
    };
    const query = existingId
      ? supabase.from('scores_design').update(payload).eq('id', existingId)
      : supabase.from('scores_design').insert(payload);
    const { error: e } = await query;
    if (e) { setError(e.message); setSaving(false); } else { onDone(); }
  }

  return (
    <>
      <div className="field-group-title">Ergonomie fonctionnelle</div>
      <div className="field-row">
        <GradeField label="Accès interrupteur" max={5} value={v.access_interrupteur} onChange={(n) => setV((p) => ({ ...p, access_interrupteur: n }))} />
        <GradeField label="Refroidissement carte" max={5} value={v.refroid_carte} onChange={(n) => setV((p) => ({ ...p, refroid_carte: n }))} />
        <GradeField label="Accès câble prog." max={5} value={v.acces_cable_prog} onChange={(n) => setV((p) => ({ ...p, acces_cable_prog: n }))} />
      </div>
      <div className="field-row">
        <GradeField label="Facilité changement piles" max={5} value={v.facilite_piles} onChange={(n) => setV((p) => ({ ...p, facilite_piles: n }))} />
        <GradeField label="Solidité / résistance" max={5} value={v.solidite} onChange={(n) => setV((p) => ({ ...p, solidite: n }))} />
      </div>

      <div className="field-group-title">Esthétique &amp; mise en œuvre</div>
      <div className="field-row">
        <GradeField label="Homogénéité" max={15} value={v.homogeneite} onChange={(n) => setV((p) => ({ ...p, homogeneite: n }))} />
        <GradeField label="Œuvre originale" max={15} value={v.oeuvre_originale} onChange={(n) => setV((p) => ({ ...p, oeuvre_originale: n }))} />
        <GradeField label="Qualité visuelle" max={20} value={v.qualite_visuelle} onChange={(n) => setV((p) => ({ ...p, qualite_visuelle: n }))} />
      </div>
      <div className="field-row">
        <GradeField label="Dissimulation des pièces" max={10} value={v.dissimulation_pieces} onChange={(n) => setV((p) => ({ ...p, dissimulation_pieces: n }))} />
        <GradeField label="Qualité de l'affiche" max={10} value={v.qualite_affiche} onChange={(n) => setV((p) => ({ ...p, qualite_affiche: n }))} />
        <GradeField label="Qualité de l'échange" max={25} value={v.qualite_echange} onChange={(n) => setV((p) => ({ ...p, qualite_echange: n }))} />
      </div>

      <div className="field-group-title">Bonus</div>
      <BoolCheck label="Suivi ovale R53,5 (+10 pts)" checked={v.bonus_suivi_ovale} onChange={(b) => setV((p) => ({ ...p, bonus_suivi_ovale: b }))} />
      <BoolCheck label="Robot connecté (+10 pts)" checked={v.bonus_connecte} onChange={(b) => setV((p) => ({ ...p, bonus_connecte: b }))} />

      <ObsField value={obs} onChange={setObs} />
      <FormFooter total={total} maxTotal={140} saving={saving} error={error} onSubmit={submit} onCancel={onCancel} isUpdate={!!existingId} />
    </>
  );
}

/* ======================== Présentation Collège ======================== */

function PresentationCollegeForm({ team, juryId, onDone, onCancel }: FormProps) {
  const [v, setV] = useState<PresentationCollegeValues>({
    aisance: 0, langues: 0, contenu: 0, outils: 0,
    bonus_suivi_ovale: false, bonus_connecte: false,
  });
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !team.id) return;
    supabase
      .from('scores_presentation_colleges')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const row = data[0];
          setExistingId(row.id);
          setV({
            aisance: row.aisance ?? 0,
            langues: row.langues ?? 0,
            contenu: row.contenu ?? 0,
            outils: row.outils ?? 0,
            bonus_suivi_ovale: row.bonus_suivi_ovale ?? false,
            bonus_connecte: row.bonus_connecte ?? false,
          });
          setObs(row.observations ?? '');
        }
      });
  }, [team.id]);

  const total = totalPresentationCollege(v);

  async function submit() {
    if (!supabase) return;
    setSaving(true); setError(null);
    const payload = {
      team_id: team.id, jury_id: juryId,
      aisance: v.aisance, langues: v.langues, contenu: v.contenu, outils: v.outils,
      bonus_suivi_ovale: v.bonus_suivi_ovale, bonus_connecte: v.bonus_connecte,
      observations: obs.trim() || null,
    };
    const query = existingId
      ? supabase.from('scores_presentation_colleges').update(payload).eq('id', existingId)
      : supabase.from('scores_presentation_colleges').insert(payload);
    const { error: e } = await query;
    if (e) { setError(e.message); setSaving(false); } else { onDone(); }
  }

  return (
    <>
      <div className="field-group-title">Présentation orale</div>
      <div className="field-row">
        <GradeField label="Aisance, attitude, travail de groupe, durée, ressenti, originalité" max={20} value={v.aisance} onChange={(n) => setV((p) => ({ ...p, aisance: n }))} />
        <GradeField label="Langues — prise de risque, qualité linguistique" max={20} value={v.langues} onChange={(n) => setV((p) => ({ ...p, langues: n }))} />
      </div>
      <div className="field-row">
        <GradeField label="Contenu — cohérence et justification des choix" max={30} value={v.contenu} onChange={(n) => setV((p) => ({ ...p, contenu: n }))} />
        <GradeField label="Outils — schémas, tableaux, termes techniques" max={20} value={v.outils} onChange={(n) => setV((p) => ({ ...p, outils: n }))} />
      </div>

      <div className="field-group-title">Bonus</div>
      <BoolCheck label="Suivi ovale R53,5 (+10 pts)" checked={v.bonus_suivi_ovale} onChange={(b) => setV((p) => ({ ...p, bonus_suivi_ovale: b }))} />
      <BoolCheck label="Robot connecté (+10 pts)" checked={v.bonus_connecte} onChange={(b) => setV((p) => ({ ...p, bonus_connecte: b }))} />

      <ObsField value={obs} onChange={setObs} />
      <FormFooter total={total} maxTotal={110} saving={saving} error={error} onSubmit={submit} onCancel={onCancel} isUpdate={!!existingId} />
    </>
  );
}

/* ======================== Présentation Lycée (SUMO) ======================== */

function PresentationLyceeForm({ team, juryId, onDone, onCancel }: FormProps) {
  const [v, setV] = useState<PresentationLyceeValues>({
    repartition_temps_parole: 0, qualite_visuel_presentation: 0,
    justesse_technique: 0, competences_linguistiques: 0,
    vocabulaire_technique: 0, dossier_technique_lv: 0, echanges_techniques: 0,
  });
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !team.id) return;
    supabase
      .from('scores_presentation_lycees')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const row = data[0];
          setExistingId(row.id);
          setV({
            repartition_temps_parole: row.repartition_temps_parole ?? 0,
            qualite_visuel_presentation: row.qualite_visuel_presentation ?? 0,
            justesse_technique: row.justesse_technique ?? 0,
            competences_linguistiques: row.competences_linguistiques ?? 0,
            vocabulaire_technique: row.vocabulaire_technique ?? 0,
            dossier_technique_lv: row.dossier_technique_lv ?? 0,
            echanges_techniques: row.echanges_techniques ?? 0,
          });
          setObs(row.observations ?? '');
        }
      });
  }, [team.id]);

  const total = totalPresentationLycee(v);

  async function submit() {
    if (!supabase) return;
    setSaving(true); setError(null);
    const payload = {
      team_id: team.id, jury_id: juryId,
      repartition_temps_parole: v.repartition_temps_parole,
      qualite_visuel_presentation: v.qualite_visuel_presentation,
      justesse_technique: v.justesse_technique,
      competences_linguistiques: v.competences_linguistiques,
      vocabulaire_technique: v.vocabulaire_technique,
      dossier_technique_lv: v.dossier_technique_lv,
      echanges_techniques: v.echanges_techniques,
      observations: obs.trim() || null,
    };
    const query = existingId
      ? supabase.from('scores_presentation_lycees').update(payload).eq('id', existingId)
      : supabase.from('scores_presentation_lycees').insert(payload);
    const { error: e } = await query;
    if (e) { setError(e.message); setSaving(false); } else { onDone(); }
  }

  return (
    <>
      <div className="field-group-title">Présentation en langue vivante</div>
      <div className="field-row">
        <GradeField label="Répartition du temps de parole" max={20} value={v.repartition_temps_parole} onChange={(n) => setV((p) => ({ ...p, repartition_temps_parole: n }))} />
        <GradeField label="Qualité du visuel de présentation" max={30} value={v.qualite_visuel_presentation} onChange={(n) => setV((p) => ({ ...p, qualite_visuel_presentation: n }))} />
        <GradeField label="Justesse technique" max={15} value={v.justesse_technique} onChange={(n) => setV((p) => ({ ...p, justesse_technique: n }))} />
      </div>
      <div className="field-row">
        <GradeField label="Compétences linguistiques collectives" max={20} value={v.competences_linguistiques} onChange={(n) => setV((p) => ({ ...p, competences_linguistiques: n }))} />
        <GradeField label="Vocabulaire technique adapté" max={15} value={v.vocabulaire_technique} onChange={(n) => setV((p) => ({ ...p, vocabulaire_technique: n }))} />
        <GradeField label="Dossier technique en LV (5-10 pages)" max={20} value={v.dossier_technique_lv} onChange={(n) => setV((p) => ({ ...p, dossier_technique_lv: n }))} />
      </div>
      <div className="field-row" style={{ gridTemplateColumns: '1fr' }}>
        <GradeField label="Échanges techniques avec le jury" max={30} value={v.echanges_techniques} onChange={(n) => setV((p) => ({ ...p, echanges_techniques: n }))} />
      </div>

      <ObsField value={obs} onChange={setObs} />
      <FormFooter total={total} maxTotal={150} saving={saving} error={error} onSubmit={submit} onCancel={onCancel} isUpdate={!!existingId} />
    </>
  );
}

/* ======================== Suivi de Ligne ======================== */

function SuiviLigneForm({ team, juryId, onDone, onCancel }: FormProps) {
  const [v, setV] = useState<SuiviLigneValues>({
    distance_pct: 0, parcours_fini: false, temps_secondes: 0,
    bonus_trace_1: false, bonus_trace_2: false, bonus_trace_3: false,
    bonus_trace_4: false, bonus_trace_5: false, bonus_trace_6: false,
  });
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !team.id) return;
    supabase
      .from('scores_suivi_ligne')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const row = data[0];
          setExistingId(row.id);
          setV({
            distance_pct: row.distance_pct ?? 0,
            parcours_fini: row.parcours_fini ?? false,
            temps_secondes: row.temps_secondes ?? 0,
            bonus_trace_1: row.bonus_trace_1 ?? false,
            bonus_trace_2: row.bonus_trace_2 ?? false,
            bonus_trace_3: row.bonus_trace_3 ?? false,
            bonus_trace_4: row.bonus_trace_4 ?? false,
            bonus_trace_5: row.bonus_trace_5 ?? false,
            bonus_trace_6: row.bonus_trace_6 ?? false,
          });
          setObs(row.observations ?? '');
        }
      });
  }, [team.id]);

  const calcul = v.temps_secondes > 0 ? parseFloat((500 / v.temps_secondes).toFixed(3)) : 0;
  const total = totalSuiviLigne(v);

  async function submit() {
    if (!supabase) return;
    setSaving(true); setError(null);
    const payload = {
      team_id: team.id, jury_id: juryId,
      distance_pct: v.distance_pct,
      parcours_fini: v.parcours_fini,
      temps_secondes: v.temps_secondes || null,
      // calcul_500_temps et total : colonnes générées par le DB, ne pas envoyer
      bonus_trace_1: v.bonus_trace_1, bonus_trace_2: v.bonus_trace_2,
      bonus_trace_3: v.bonus_trace_3, bonus_trace_4: v.bonus_trace_4,
      bonus_trace_5: v.bonus_trace_5, bonus_trace_6: v.bonus_trace_6,
      observations: obs.trim() || null,
    };
    const query = existingId
      ? supabase.from('scores_suivi_ligne').update(payload).eq('id', existingId)
      : supabase.from('scores_suivi_ligne').insert(payload);
    const { error: e } = await query;
    if (e) { setError(e.message); setSaving(false); } else { onDone(); }
  }

  return (
    <>
      <div className="field-group-title">Piste principale</div>
      <div className="field-row">
        <div className="field">
          <label>Distance parcourue <span style={{ color: 'var(--muted)' }}>/ 100%</span></label>
          <input type="number" min={0} max={100} value={v.distance_pct}
            onChange={(e) => setV((p) => ({ ...p, distance_pct: Number(e.target.value) }))} />
        </div>
        <div className="field">
          <label>Temps (secondes)</label>
          <input type="number" min={0} step={0.01} value={v.temps_secondes || ''}
            placeholder="ex. 37.42"
            onChange={(e) => setV((p) => ({ ...p, temps_secondes: Number(e.target.value) }))} />
        </div>
        <div className="field">
          <label>Calcul 500/temps <span style={{ color: 'var(--muted)' }}>(auto)</span></label>
          <input type="number" readOnly value={calcul} style={{ background: 'var(--cream-2)', color: 'var(--muted)' }} />
        </div>
      </div>
      <BoolCheck label="Parcours terminé (+50 pts)" checked={v.parcours_fini} onChange={(b) => setV((p) => ({ ...p, parcours_fini: b }))} />

      <div className="field-group-title">Pistes secondaires (5 pts chacune)</div>
      {([1, 2, 3, 4, 5, 6] as const).map((n) => {
        const key = `bonus_trace_${n}` as keyof SuiviLigneValues;
        return (
          <BoolCheck key={n} label={`Bonus tracé ${n}`}
            checked={v[key] as boolean}
            onChange={(b) => setV((p) => ({ ...p, [key]: b }))} />
        );
      })}

      <ObsField value={obs} onChange={setObs} />
      <FormFooter total={total} saving={saving} error={error} onSubmit={submit} onCancel={onCancel} isUpdate={!!existingId} />
    </>
  );
}

/* ======================== Classement (Formule Robot / Sumo Lycée) ======================== */

function ClassementForm({
  team, epreuveId, juryId, onDone, onCancel, grid, maxRang, exAequoAfter,
}: FormProps & { grid: Record<number, number>; maxRang: number; exAequoAfter: number }) {
  const [rang, setRang] = useState<number>(1);
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !team.id || !epreuveId) return;
    supabase
      .from('scores_classement')
      .select('*')
      .eq('team_id', team.id)
      .eq('epreuve_id', epreuveId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const row = data[0];
          setExistingId(row.id);
          setRang(row.rang);
          setObs(row.observations ?? '');
        }
      });
  }, [team.id, epreuveId]);

  const points = grid[rang] ?? 0;

  async function submit() {
    if (!supabase) return;
    setSaving(true); setError(null);
    const payload = {
      team_id: team.id, epreuve_id: epreuveId, jury_id: juryId,
      rang, points, observations: obs.trim() || null,
    };
    const query = existingId
      ? supabase.from('scores_classement').update(payload).eq('id', existingId)
      : supabase.from('scores_classement').insert(payload);
    const { error: e } = await query;
    if (e) { setError(e.message); setSaving(false); } else { onDone(); }
  }

  return (
    <>
      <div className="field-group-title">Placement</div>
      {exAequoAfter < maxRang && (
        <div className="callout" style={{ marginBottom: 12 }}>
          <div className="callout-label">→ Ex-aequo</div>
          À partir de la {exAequoAfter + 1}e place, plusieurs équipes peuvent avoir le même rang.
        </div>
      )}
      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field">
          <label>Rang obtenu</label>
          <select value={rang} onChange={(e) => setRang(Number(e.target.value))}>
            {Array.from({ length: maxRang }, (_, i) => i + 1).map((r) => (
              <option key={r} value={r}>
                {r === 1 ? '1er' : `${r}ème`}{r > exAequoAfter ? ' (ex-aequo possible)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Points attribués</label>
          <input readOnly value={points} style={{ background: 'var(--cream-2)', color: 'var(--ink)', fontWeight: 700, fontFamily: 'var(--ff-mono)' }} />
        </div>
      </div>

      <ObsField value={obs} onChange={setObs} />
      <FormFooter total={points} saving={saving} error={error} onSubmit={submit} onCancel={onCancel} />
    </>
  );
}

/* ======================== Micro-composants réutilisables ======================== */

type FormProps = {
  team: Team;
  epreuveId: string;
  juryId: string | null;
  onDone: () => void;
  onCancel?: () => void;
};

function GradeField({ label, max, value, onChange }: {
  label: string; max: number; value: number; onChange: (n: number) => void;
}) {
  return (
    <div className="field">
      <label>{label} <span style={{ color: 'var(--muted)' }}>/ {max}</span></label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {Array.from({ length: max + 1 }, (_, n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

function BoolCheck({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (b: boolean) => void;
}) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="check-txt">{label}</div>
    </label>
  );
}

function ObsField({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <>
      <div className="field-group-title">Observations</div>
      <div className="field-row single">
        <div className="field">
          <label>Remarques du jury (optionnel)</label>
          <textarea rows={2} placeholder="Points forts, incidents…" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
    </>
  );
}

function FormFooter({ total, maxTotal, saving, error, onSubmit, onCancel, isUpdate }: {
  total: number; maxTotal?: number; saving: boolean; error: string | null;
  onSubmit: () => void; onCancel?: () => void; isUpdate?: boolean;
}) {
  return (
    <>
      {maxTotal !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>Total</span>
          <span style={{ fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 22 }}>{typeof total === 'number' ? total.toFixed ? total.toFixed(2).replace('.00', '') : total : total}</span>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>/ {maxTotal} pts</span>
        </div>
      )}
      {error && (
        <div className="callout warn" style={{ marginTop: 8 }}>
          <div className="callout-label">→ Erreur</div>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button type="button" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }} disabled={saving} onClick={onSubmit}>
          {saving ? 'Envoi…' : isUpdate ? 'Mettre à jour la note' : 'Enregistrer la note'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: 14 }} disabled={saving} onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </>
  );
}
