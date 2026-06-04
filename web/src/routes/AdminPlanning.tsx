import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useEtablissements } from '../lib/useEtablissements';
import { Epreuve, EpreuveDB, PlanningSlot, Team } from '../types/api';
import { AdminScoringForm } from './AdminScoringForm';

/**
 * Onglet Planning — console admin.
 * planning_slots: team_id, epreuve_id (FK → epreuves), heure_presentation,
 * heure_debut_rencontres, heure_fin_rencontres, poule, observations.
 */

const COMPETITION_DATE = '5 juin 2026';

type PlanningFilter = 'all' | Epreuve;

const EPREUVE_LABELS: Record<Epreuve, string> = {
  sumo: 'Sumo autonome',
  suivi_ligne: 'Suivi de ligne',
  formule_robot: 'Formule robot',
  design: 'Design',
  presentation_projet: 'Présentation projet',
};

const EPREUVE_COLORS: Record<Epreuve, string> = {
  sumo: 'var(--red)',
  suivi_ligne: 'var(--cyan)',
  formule_robot: 'var(--yellow)',
  design: 'var(--green)',
  presentation_projet: 'var(--navy)',
};

const EPREUVE_ORDER: Epreuve[] = [
  'sumo',
  'suivi_ligne',
  'formule_robot',
  'design',
  'presentation_projet',
];

/** Design et présentation utilisent heure_presentation (créneau ponctuel). */
function isPresentation(epreuve: Epreuve) {
  return epreuve === 'design' || epreuve === 'presentation_projet';
}

type SlotForm = {
  teamId: string;
  epreuveId: string;
  epreuveType: Epreuve;
  heurePresentation: string;
  heureDebut: string;
  heureFin: string;
  zone: string;
};

function fmtTime(raw: string | null | undefined) {
  return raw?.slice(0, 5) ?? '—';
}

function parseMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Heure principale à afficher pour un slot donné. */
function slotDisplayTime(slot: PlanningSlot, epreuveType: Epreuve): string {
  if (isPresentation(epreuveType)) return fmtTime(slot.heure_presentation);
  const debut = fmtTime(slot.heure_debut_rencontres);
  const fin = fmtTime(slot.heure_fin_rencontres);
  return fin !== '—' ? `${debut} → ${fin}` : debut;
}

/** Heure de tri pour la timeline. */
function slotSortTime(slot: PlanningSlot, epreuveType: Epreuve): string {
  return (isPresentation(epreuveType)
    ? slot.heure_presentation
    : slot.heure_debut_rencontres) ?? '99:99';
}

export function AdminPlanning() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [epreuves, setEpreuves] = useState<EpreuveDB[]>([]);
  const [scoringSlotId, setScoringSlotId] = useState<string | null>(null);
  const [slots, setSlots] = useState<PlanningSlot[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingEpreuves, setLoadingEpreuves] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PlanningFilter>('all');
  const [editingSlot, setEditingSlot] = useState<PlanningSlot | null>(null);
  const [addingForTeam, setAddingForTeam] = useState<Team | null>(null);
  const [form, setForm] = useState<SlotForm>({ teamId: '', epreuveId: '', epreuveType: 'sumo', heurePresentation: '08:00', heureDebut: '08:00', heureFin: '08:30', zone: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const etabs = useEtablissements();

  useEffect(() => {
    if (!supabase) { setLoadingTeams(false); setError("Supabase n'est pas configuré."); return; }
    let cancelled = false;
    supabase.from('teams').select('*').order('immatriculation', { ascending: true })
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) setError(e.message);
        else setTeams((data ?? []) as Team[]);
        setLoadingTeams(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!supabase) { setLoadingEpreuves(false); return; }
    let cancelled = false;
    supabase.from('epreuves').select('*')
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) setError(e.message);
        else setEpreuves((data ?? []) as EpreuveDB[]);
        setLoadingEpreuves(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!supabase) { setLoadingSlots(false); return; }
    let cancelled = false;
    supabase.from('planning_slots').select('*')
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (!e) setSlots((data ?? []) as PlanningSlot[]);
        setLoadingSlots(false);
      });
    return () => { cancelled = true; };
  }, []);

  const loading = loadingTeams || loadingEpreuves || loadingSlots;

  /**
   * Map "type_categorie" → EpreuveDB — clé composée pour distinguer
   * presentation_projet collège vs lycée (même type, catégorie différente).
   */
  const epreuveByKey = useMemo(() => {
    const map: Record<string, EpreuveDB> = {};
    for (const ep of epreuves) {
      // Clé précise : type + categorie + edition
      const full = `${ep.type}__${ep.categorie ?? ''}__${ep.edition_id ?? ''}`;
      map[full] = ep;
      // Clé de fallback sans edition (au cas où edition_id NULL)
      const noEd = `${ep.type}__${ep.categorie ?? ''}`;
      if (!map[noEd]) map[noEd] = ep;
    }
    return map;
  }, [epreuves]);

  const epreuveById = useMemo(() => {
    const m: Record<string, EpreuveDB> = {};
    for (const ep of epreuves) m[ep.id] = ep;
    return m;
  }, [epreuves]);

  function getEpreuveId(team: Team): string | null {
    const full = `${team.epreuve}__${team.categorie}__${team.edition_id ?? ''}`;
    const noEd = `${team.epreuve}__${team.categorie}`;
    const match = epreuveByKey[full] ?? epreuveByKey[noEd];
    return match?.id ?? null;
  }

  const slotByTeam = useMemo(() => {
    const map: Record<string, PlanningSlot[]> = {};
    for (const s of slots) {
      if (s.team_id) (map[s.team_id] ??= []).push(s);
    }
    return map;
  }, [slots]);

  const stats = useMemo(() => {
    const total = slots.length;
    const unscheduled: Record<Epreuve, number> = {
      sumo: 0, suivi_ligne: 0, formule_robot: 0, design: 0, presentation_projet: 0,
    };
    for (const ep of EPREUVE_ORDER) {
      const scheduled = new Set(
        slots
          .filter((s) => s.epreuve_id && epreuveById[s.epreuve_id]?.type === ep)
          .map((s) => s.team_id),
      );
      unscheduled[ep] = teams.filter((t) => t.epreuve === ep && !scheduled.has(t.id)).length;
    }
    return { total, unscheduled };
  }, [teams, slots, epreuveById]);

  function openAddForm(team: Team) {
    const epreuveId = getEpreuveId(team) ?? '';
    const ep = team.epreuve as Epreuve;
    setAddingForTeam(team);
    setEditingSlot(null);
    setForm({ teamId: team.id, epreuveId, epreuveType: ep, heurePresentation: '08:00', heureDebut: '08:00', heureFin: '08:30', zone: '' });
    setFormError(null);
  }

  function openEditForm(slot: PlanningSlot, epreuveType: Epreuve) {
    setEditingSlot(slot);
    setAddingForTeam(null);
    setForm({
      teamId: slot.team_id ?? '',
      epreuveId: slot.epreuve_id ?? '',
      epreuveType,
      heurePresentation: fmtTime(slot.heure_presentation) === '—' ? '08:00' : fmtTime(slot.heure_presentation),
      heureDebut: fmtTime(slot.heure_debut_rencontres) === '—' ? '08:00' : fmtTime(slot.heure_debut_rencontres),
      heureFin: fmtTime(slot.heure_fin_rencontres) === '—' ? '08:30' : fmtTime(slot.heure_fin_rencontres),
      zone: slot.zone_rencontres ?? slot.salle_presentation ?? '',
    });
    setFormError(null);
  }

  function closeForm() {
    setAddingForTeam(null);
    setEditingSlot(null);
    setFormError(null);
  }

  function openScoring(slotId: string) {
    setScoringSlotId(slotId);
    closeForm();
  }

  function closeScoring() {
    setScoringSlotId(null);
  }

  async function saveSlot() {
    if (!supabase) return;
    if (!form.epreuveId) { setFormError("Aucune épreuve trouvée dans la base pour ce type. Vérifiez la table `epreuves`."); return; }
    const pres = isPresentation(form.epreuveType);
    if (!pres && parseMinutes(form.heureFin) <= parseMinutes(form.heureDebut)) {
      setFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload: Record<string, string | null> = {
      team_id: form.teamId,
      epreuve_id: form.epreuveId,
      zone_rencontres: !pres ? (form.zone.trim() || null) : null,
      salle_presentation: pres ? (form.zone.trim() || null) : null,
      heure_presentation: pres ? form.heurePresentation : null,
      heure_debut_rencontres: pres ? null : form.heureDebut,
      heure_fin_rencontres: pres ? null : form.heureFin,
    };

    try {
      if (editingSlot) {
        const { data, error: e } = await supabase.from('planning_slots').update(payload).eq('id', editingSlot.id).select().single();
        if (e) throw e;
        setSlots((cur) => cur.map((s) => (s.id === editingSlot.id ? (data as PlanningSlot) : s)));
      } else {
        const { data, error: e } = await supabase.from('planning_slots').insert(payload).select().single();
        if (e) throw e;
        setSlots((cur) => [...cur, data as PlanningSlot]);
      }
      closeForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(id: string) {
    if (!supabase) return;
    setDeletingId(id);
    const { error: e } = await supabase.from('planning_slots').delete().eq('id', id);
    if (!e) setSlots((cur) => cur.filter((s) => s.id !== id));
    setDeletingId(null);
    if (editingSlot?.id === id) closeForm();
  }

  const filteredTeams = useMemo(
    () => (filter === 'all' ? teams : teams.filter((t) => t.epreuve === filter)),
    [teams, filter],
  );

  const filteredSlots = useMemo(() => {
    if (filter === 'all') return slots;
    return slots.filter((s) => s.epreuve_id && epreuveById[s.epreuve_id]?.type === filter);
  }, [slots, filter, epreuveById]);

  /** Slots triés chronologiquement avec leur type résolu. */
  const timelineEntries = useMemo(() => {
    return filteredSlots
      .map((s) => ({ slot: s, epreuveType: (epreuveById[s.epreuve_id ?? '']?.type ?? 'sumo') as Epreuve }))
      .sort((a, b) => slotSortTime(a.slot, a.epreuveType).localeCompare(slotSortTime(b.slot, b.epreuveType)));
  }, [filteredSlots, epreuveById]);

  const teamById = useMemo(() => {
    const m: Record<string, Team> = {};
    for (const t of teams) m[t.id] = t;
    return m;
  }, [teams]);

  return (
    <div className="form-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <main className="form-main">
        <div className="form-section active">
          <div className="form-section-head">
            <div className="form-section-eyebrow">// Planning · {COMPETITION_DATE}</div>
            <h2>Planning du jour.</h2>
            <p>
              Assignez les créneaux horaires aux équipes selon leur type d'épreuve.
              La compétition se déroule le <strong>5 juin</strong> — seule cette journée est planifiée.
            </p>
          </div>

          {!loading && !error && (
            <div style={statRowStyle}>
              <StatCard label="Créneaux planifiés" value={stats.total} />
              {EPREUVE_ORDER.map((ep) => (
                <StatCard
                  key={ep}
                  label={`${EPREUVE_LABELS[ep]} sans créneau`}
                  value={stats.unscheduled[ep]}
                  color={stats.unscheduled[ep] > 0 ? 'var(--red)' : 'var(--green)'}
                />
              ))}
            </div>
          )}

          <div className="events-tabs" role="tablist" style={{ marginBottom: 24 }}>
            <button type="button" role="tab" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              Tout le planning
            </button>
            {EPREUVE_ORDER.map((ep) => (
              <button key={ep} type="button" role="tab" className={filter === ep ? 'active' : ''} onClick={() => setFilter(ep)}>
                {EPREUVE_LABELS[ep]}
              </button>
            ))}
          </div>

          {loading && (
            <div className="callout">
              <div className="callout-label">→ Chargement</div>
              Récupération des données…
            </div>
          )}

          {error && (
            <div className="callout warn">
              <div className="callout-label">→ Erreur</div>
              {error}
            </div>
          )}

          {!loading && !error && filter === 'all' && (
            <TimelineView
              entries={timelineEntries}
              teamById={teamById}
              etabsById={etabs.byId}
              deletingId={deletingId}
              editingSlot={editingSlot}
              scoringSlotId={scoringSlotId}
              onEdit={openEditForm}
              onDelete={deleteSlot}
              onScore={openScoring}
              onCloseScoring={closeScoring}
              form={form}
              setForm={setForm}
              formError={formError}
              saving={saving}
              onSave={saveSlot}
              onCancel={closeForm}
            />
          )}

          {!loading && !error && filter !== 'all' && (
            <EpreuveView
              epreuve={filter as Epreuve}
              teams={filteredTeams}
              slotByTeam={slotByTeam}
              epreuveById={epreuveById}
              etabsById={etabs.byId}
              addingForTeam={addingForTeam}
              editingSlot={editingSlot}
              scoringSlotId={scoringSlotId}
              deletingId={deletingId}
              form={form}
              setForm={setForm}
              formError={formError}
              saving={saving}
              onAdd={openAddForm}
              onEdit={openEditForm}
              onDelete={deleteSlot}
              onScore={openScoring}
              onCloseScoring={closeScoring}
              onSave={saveSlot}
              onCancel={closeForm}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ============================= Vue complète (timeline) ============================= */

function TimelineView({
  entries, teamById, etabsById, deletingId, editingSlot, scoringSlotId, onEdit, onDelete, onScore, onCloseScoring,
  form, setForm, formError, saving, onSave, onCancel,
}: {
  entries: { slot: PlanningSlot; epreuveType: Epreuve }[];
  teamById: Record<string, Team>;
  etabsById: Record<string, { nom: string }>;
  deletingId: string | null;
  editingSlot: PlanningSlot | null;
  scoringSlotId: string | null;
  onEdit: (s: PlanningSlot, type: Epreuve) => void;
  onDelete: (id: string) => void;
  onScore: (slotId: string) => void;
  onCloseScoring: () => void;
  form: SlotForm;
  setForm: React.Dispatch<React.SetStateAction<SlotForm>>;
  formError: string | null;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="callout">
        <div className="callout-label">→ Planning vide</div>
        Aucun créneau planifié. Sélectionnez une épreuve pour commencer à assigner des créneaux.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(({ slot, epreuveType }) => {
        const team = teamById[slot.team_id ?? ''];
        const etabName = team?.etablissement_id ? etabsById[team.etablissement_id]?.nom ?? '—' : '—';
        const isEditing = editingSlot?.id === slot.id;
        const isScoring = scoringSlotId === slot.id;
        const timeDisplay = slotDisplayTime(slot, epreuveType);

        return (
          <div key={slot.id}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr auto auto',
              alignItems: 'center',
              gap: 14,
              background: 'var(--paper)',
              border: `1px solid ${isEditing || isScoring ? 'var(--ink-2)' : 'var(--line)'}`,
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
            }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 13 }}>
                {timeDisplay}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {team?.nom_robot ?? <em style={{ color: 'var(--muted)' }}>Équipe inconnue</em>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{etabName}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <EpreuveBadge epreuve={epreuveType} />
                {(slot.zone_rencontres || slot.salle_presentation) && (
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--muted)' }}>
                    {slot.zone_rencontres ?? slot.salle_presentation}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {team && slot.epreuve_id && (
                  <button type="button" className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: 12, background: isScoring ? 'var(--muted)' : 'var(--green)', borderColor: isScoring ? 'var(--muted)' : 'var(--green)' }}
                    onClick={() => isScoring ? onCloseScoring() : onScore(slot.id)}>
                    {isScoring ? 'Fermer' : 'Noter'}
                  </button>
                )}
                <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => (isEditing ? onCancel() : onEdit(slot, epreuveType))}>
                  {isEditing ? 'Fermer' : 'Modifier'}
                </button>
                <button type="button" className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }}
                  disabled={deletingId === slot.id} onClick={() => onDelete(slot.id)}>
                  {deletingId === slot.id ? '…' : '✕'}
                </button>
              </div>
            </div>
            {isEditing && (
              <SlotFormInline form={form} setForm={setForm} formError={formError}
                saving={saving} onSave={onSave} onCancel={onCancel} isEdit />
            )}
            {isScoring && team && slot.epreuve_id && (
              <AdminScoringForm
                team={team}
                epreuveType={epreuveType}
                epreuveId={slot.epreuve_id}
                onDone={onCloseScoring}
                onCancel={onCloseScoring}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================= Vue par épreuve ============================= */

function EpreuveView({
  epreuve, teams, slotByTeam, epreuveById, etabsById, addingForTeam, editingSlot, scoringSlotId, deletingId,
  form, setForm, formError, saving, onAdd, onEdit, onDelete, onScore, onCloseScoring, onSave, onCancel,
}: {
  epreuve: Epreuve;
  teams: Team[];
  slotByTeam: Record<string, PlanningSlot[]>;
  epreuveById: Record<string, EpreuveDB>;
  etabsById: Record<string, { nom: string }>;
  addingForTeam: Team | null;
  editingSlot: PlanningSlot | null;
  scoringSlotId: string | null;
  deletingId: string | null;
  form: SlotForm;
  setForm: React.Dispatch<React.SetStateAction<SlotForm>>;
  formError: string | null;
  saving: boolean;
  onAdd: (t: Team) => void;
  onEdit: (s: PlanningSlot, type: Epreuve) => void;
  onDelete: (id: string) => void;
  onScore: (slotId: string) => void;
  onCloseScoring: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (teams.length === 0) {
    return (
      <div className="callout">
        <div className="callout-label">→ Aucune équipe</div>
        Aucune équipe inscrite pour l'épreuve {EPREUVE_LABELS[epreuve]}.
      </div>
    );
  }

  const plannedCount = teams.filter((t) => (slotByTeam[t.id]?.length ?? 0) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="field-group-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{EPREUVE_LABELS[epreuve]} · {teams.length} équipe{teams.length > 1 ? 's' : ''}</span>
        <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
          {plannedCount} planifiée{plannedCount > 1 ? 's' : ''}
        </span>
      </div>

      {teams.map((team) => {
        const teamSlots = slotByTeam[team.id] ?? [];
        const etabName = team.etablissement_id ? etabsById[team.etablissement_id]?.nom ?? '—' : '—';
        const isAddingHere = addingForTeam?.id === team.id;

        return (
          <div key={team.id} style={{
            background: 'var(--paper)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', overflow: 'hidden',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
              <span style={{
                fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 13,
                background: 'var(--cream-2)', border: '1px solid var(--line)',
                borderRadius: 6, padding: '5px 8px', textAlign: 'center', letterSpacing: 0.4,
              }}>
                {team.immatriculation}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {team.nom_robot || <em style={{ color: 'var(--muted)' }}>Sans nom</em>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{etabName} · {team.categorie}</div>
              </div>
              <button type="button" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}
                onClick={() => (isAddingHere ? onCancel() : onAdd(team))}>
                {isAddingHere ? 'Annuler' : '+ Créneau'}
              </button>
            </div>

            {isAddingHere && (
              <SlotFormInline form={form} setForm={setForm} formError={formError}
                saving={saving} onSave={onSave} onCancel={onCancel} isEdit={false} />
            )}

            {teamSlots.length > 0 && (
              <div style={{ borderTop: '1px solid var(--line)' }}>
                {teamSlots.map((slot) => {
                  const epType = (epreuveById[slot.epreuve_id ?? '']?.type ?? epreuve) as Epreuve;
                  const isEditing = editingSlot?.id === slot.id;
                  const isScoring = scoringSlotId === slot.id;
                  const timeDisplay = slotDisplayTime(slot, epType);
                  return (
                    <div key={slot.id}>
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr auto',
                        alignItems: 'center', gap: 12, padding: '10px 18px',
                        background: isEditing || isScoring ? 'var(--cream-2)' : 'transparent',
                        borderBottom: '1px solid var(--line)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontFamily: 'var(--ff-mono)', fontWeight: 700, fontSize: 13 }}>{timeDisplay}</span>
                          {(slot.zone_rencontres || slot.salle_presentation) && (
                            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--muted)' }}>
                              {slot.zone_rencontres ?? slot.salle_presentation}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {slot.epreuve_id && (
                            <button type="button" className="btn btn-primary"
                              style={{ padding: '5px 10px', fontSize: 12, background: isScoring ? 'var(--muted)' : 'var(--green)', borderColor: isScoring ? 'var(--muted)' : 'var(--green)' }}
                              onClick={() => isScoring ? onCloseScoring() : onScore(slot.id)}>
                              {isScoring ? 'Fermer' : 'Noter'}
                            </button>
                          )}
                          <button type="button" className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}
                            onClick={() => (isEditing ? onCancel() : onEdit(slot, epType))}>
                            {isEditing ? 'Fermer' : 'Modifier'}
                          </button>
                          <button type="button" className="btn btn-ghost"
                            style={{ padding: '5px 10px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }}
                            disabled={deletingId === slot.id} onClick={() => onDelete(slot.id)}>
                            {deletingId === slot.id ? '…' : '✕'}
                          </button>
                        </div>
                      </div>
                      {isEditing && (
                        <SlotFormInline form={form} setForm={setForm} formError={formError}
                          saving={saving} onSave={onSave} onCancel={onCancel} isEdit />
                      )}
                      {isScoring && slot.epreuve_id && (
                        <AdminScoringForm
                          team={team}
                          epreuveType={epType}
                          epreuveId={slot.epreuve_id}
                          onDone={onCloseScoring}
                          onCancel={onCloseScoring}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {teamSlots.length === 0 && !isAddingHere && (
              <div style={{ borderTop: '1px solid var(--line)', padding: '10px 18px', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                Aucun créneau assigné.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================= Formulaire inline ============================= */

function SlotFormInline({ form, setForm, formError, saving, onSave, onCancel, isEdit }: {
  form: SlotForm;
  setForm: React.Dispatch<React.SetStateAction<SlotForm>>;
  formError: string | null;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
}) {
  const pres = isPresentation(form.epreuveType);

  return (
    <div style={{ borderTop: '1px solid var(--line)', background: 'var(--cream)', padding: '16px 18px' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        {isEdit ? '// Modifier le créneau' : '// Nouveau créneau'}
      </div>

      <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {pres ? (
          <div className="field">
            <label>Heure de passage</label>
            <input type="time" value={form.heurePresentation} min="07:00" max="19:00"
              onChange={(e) => setForm((f) => ({ ...f, heurePresentation: e.target.value }))} />
          </div>
        ) : (
          <>
            <div className="field">
              <label>Heure de début</label>
              <input type="time" value={form.heureDebut} min="07:00" max="19:00"
                onChange={(e) => setForm((f) => ({ ...f, heureDebut: e.target.value }))} />
            </div>
            <div className="field">
              <label>Heure de fin</label>
              <input type="time" value={form.heureFin} min="07:00" max="19:00"
                onChange={(e) => setForm((f) => ({ ...f, heureFin: e.target.value }))} />
            </div>
          </>
        )}
        <div className="field">
          <label>{pres ? 'Salle' : 'Zone / piste'}</label>
          <input type="text" placeholder={pres ? 'ex. Salle A' : 'ex. Piste 1'}
            value={form.zone}
            onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} />
        </div>
      </div>

      {formError && (
        <div className="callout warn" style={{ marginTop: 8, marginBottom: 8 }}>
          <div className="callout-label">→ Erreur</div>
          {formError}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button type="button" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}
          disabled={saving} onClick={onSave}>
          {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Ajouter le créneau'}
        </button>
        <button type="button" className="btn btn-ghost" style={{ padding: '10px 20px', fontSize: 14 }}
          disabled={saving} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
}

/* ============================= Utilitaires ============================= */

const statRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 10,
  marginBottom: 24,
};

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function EpreuveBadge({ epreuve }: { epreuve: Epreuve }) {
  const color = EPREUVE_COLORS[epreuve];
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
      color, border: `1px solid ${color}`, whiteSpace: 'nowrap',
    }}>
      {EPREUVE_LABELS[epreuve]}
    </span>
  );
}
