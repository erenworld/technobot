import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useEtablissements } from '../lib/useEtablissements';
import { useResponsables } from '../lib/useResponsables';
import {
  Categorie,
  ControleTechniquePayload,
  Epreuve,
  Etablissement,
  Profile,
  StatutTeam,
  Team,
} from '../types/api';

/**
 * Liste des équipes inscrites avec filtres, recherche et fiche détaillée.
 *
 * Ergonomie : chaque équipe est rendue comme une carte ; un clic déplie la
 * fiche complète (toutes les colonnes renvoyées par GET /api/teams + données
 * d'établissement résolues via Supabase JS) et expose les actions « modifier
 * le contrôle technique » et « supprimer ».
 */

type Filters = {
  categorie: '' | Categorie;
  epreuve: '' | Epreuve;
  statut: '' | StatutTeam;
};

const INITIAL_FILTERS: Filters = { categorie: '', epreuve: '', statut: '' };

const EPREUVE_LABELS: Record<Epreuve, string> = {
  suivi_ligne: 'Suivi de ligne',
  formule_robot: 'Formule robot',
  design: 'Design',
  presentation_projet: 'Présentation projet',
  sumo: 'Sumo autonome',
};

const STATUT_LABELS: Record<StatutTeam, string> = {
  inscrit: 'Inscrit',
  valide: 'Validé',
  controle_technique_ok: 'CT validé',
  disqualifie: 'Disqualifié',
};

const STATUT_COLORS: Record<StatutTeam, string> = {
  inscrit: 'var(--muted)',
  valide: 'var(--cyan)',
  controle_technique_ok: 'var(--green)',
  disqualifie: 'var(--red)',
};

export function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const etabs = useEtablissements();
  const responsables = useResponsables();

  // Lecture directe via Supabase JS plutôt que via /api/teams : le back ne
  // renvoie pas la colonne `description` saisie à l'inscription. RLS se
  // charge de filtrer ce que l'utilisateur a le droit de voir (admin =
  // toutes les éditions, enseignant = son établissement uniquement, etc.).
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError("Supabase n'est pas configuré côté front.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from('teams')
      .select('*')
      .order('immatriculation', { ascending: true })
      .then(({ data, error: qErr }) => {
        if (cancelled) return;
        if (qErr) {
          setError(qErr.message);
          setLoading(false);
          return;
        }
        setTeams((data ?? []) as Team[]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teams.filter((t) => {
      if (filters.categorie && t.categorie !== filters.categorie) return false;
      if (filters.epreuve && t.epreuve !== filters.epreuve) return false;
      if (filters.statut && t.statut !== filters.statut) return false;
      if (q) {
        const etabName = t.etablissement_id
          ? etabs.byId[t.etablissement_id]?.nom ?? ''
          : '';
        const hay =
          `${t.immatriculation} ${t.nom_robot ?? ''} ${etabName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teams, filters, search, etabs.byId]);

  const stats = useMemo(() => {
    const byCat = { college: 0, lycee: 0 };
    const byStatut: Record<StatutTeam, number> = {
      inscrit: 0,
      valide: 0,
      controle_technique_ok: 0,
      disqualifie: 0,
    };
    for (const t of teams) {
      byCat[t.categorie] += 1;
      byStatut[t.statut] += 1;
    }
    return { byCat, byStatut };
  }, [teams]);

  const updateTeam = (updated: Team) => {
    setTeams((cur) => cur.map((t) => (t.id === updated.id ? updated : t)));
  };

  const removeTeam = (id: string) => {
    setTeams((cur) => cur.filter((t) => t.id !== id));
    setExpandedId((cur) => (cur === id ? null : cur));
  };

  return (
    <div className="form-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <main className="form-main">
        <div className="form-section active">
          <div className="form-section-head">
            <div className="form-section-eyebrow">// Suivi</div>
            <h2>Équipes inscrites.</h2>
            <p>
              Cliquez sur une carte pour déplier la fiche complète. Le statut
              de contrôle technique et les notes peuvent être modifiés en place.
            </p>
          </div>

          {/* Stats globales */}
          {!loading && !error && teams.length > 0 && (
            <div style={statRowStyle}>
              <StatCard label="Total équipes" value={teams.length} />
              <StatCard label="Collèges" value={stats.byCat.college} />
              <StatCard label="Lycées" value={stats.byCat.lycee} />
              <StatCard
                label="CT validés"
                value={stats.byStatut.controle_technique_ok}
                color="var(--green)"
              />
              <StatCard
                label="En attente"
                value={stats.byStatut.inscrit}
                color="var(--muted)"
              />
              <StatCard
                label="Disqualifiés"
                value={stats.byStatut.disqualifie}
                color="var(--red)"
              />
            </div>
          )}

          {/* Filtres */}
          <div className="field-group-title">Filtres</div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="filter-categorie">Catégorie</label>
              <select
                id="filter-categorie"
                value={filters.categorie}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    categorie: e.target.value as Filters['categorie'],
                  }))
                }
              >
                <option value="">Toutes</option>
                <option value="college">Collège</option>
                <option value="lycee">Lycée</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="filter-epreuve">Épreuve</label>
              <select
                id="filter-epreuve"
                value={filters.epreuve}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    epreuve: e.target.value as Filters['epreuve'],
                  }))
                }
              >
                <option value="">Toutes</option>
                {(Object.keys(EPREUVE_LABELS) as Epreuve[]).map((k) => (
                  <option key={k} value={k}>
                    {EPREUVE_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="filter-statut">Statut</label>
              <select
                id="filter-statut"
                value={filters.statut}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    statut: e.target.value as Filters['statut'],
                  }))
                }
              >
                <option value="">Tous</option>
                {(Object.keys(STATUT_LABELS) as StatutTeam[]).map((k) => (
                  <option key={k} value={k}>
                    {STATUT_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="filter-search">Recherche</label>
              <input
                id="filter-search"
                type="text"
                placeholder="Robot, établissement, immatriculation…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="callout">
              <div className="callout-label">→ Chargement</div>
              Récupération des équipes…
            </div>
          )}

          {error && (
            <div className="callout warn">
              <div className="callout-label">→ Erreur</div>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div
                className="field-group-title"
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Liste ({filtered.length})</span>
                {filtered.length !== teams.length && (
                  <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                    {teams.length - filtered.length} masquée
                    {teams.length - filtered.length > 1 ? 's' : ''} par filtres
                  </span>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="callout">
                  <div className="callout-label">→ Aucun résultat</div>
                  Aucune équipe ne correspond aux filtres.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((t) => (
                    <TeamCard
                      key={t.id}
                      team={t}
                      etablissement={
                        t.etablissement_id
                          ? etabs.byId[t.etablissement_id] ?? null
                          : null
                      }
                      responsables={
                        t.etablissement_id
                          ? responsables.byEtab[t.etablissement_id] ?? []
                          : []
                      }
                      expanded={expandedId === t.id}
                      onToggle={() =>
                        setExpandedId((cur) => (cur === t.id ? null : t.id))
                      }
                      onUpdated={updateTeam}
                      onDeleted={() => removeTeam(t.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Sous-composants ---------------------------- */

const statRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: 10,
  marginBottom: 24,
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: color ?? 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ statut }: { statut: StatutTeam }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: STATUT_COLORS[statut],
        border: `1px solid ${STATUT_COLORS[statut]}`,
        background: 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {STATUT_LABELS[statut]}
    </span>
  );
}

function TeamCard({
  team,
  etablissement,
  responsables,
  expanded,
  onToggle,
  onUpdated,
  onDeleted,
}: {
  team: Team;
  etablissement: Etablissement | null;
  responsables: Profile[];
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (t: Team) => void;
  onDeleted: () => void;
}) {
  const etabLine = etablissement
    ? `${etablissement.nom}${etablissement.ville ? ' · ' + etablissement.ville : ''}`
    : team.etablissement_id
      ? `Étab. ${team.etablissement_id.slice(0, 8)}…`
      : '—';

  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        transition: 'border-color .15s',
        borderColor: expanded ? 'var(--ink-2)' : 'var(--line)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="team-card-btn"
      >
        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 0.4,
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '6px 10px',
            textAlign: 'center',
          }}
        >
          {team.immatriculation}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {team.nom_robot || <em style={{ color: 'var(--muted)' }}>Sans nom</em>}
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {etabLine}
          </div>
        </div>
        <span className="team-card-epreuve">
          {EPREUVE_LABELS[team.epreuve]} · {team.categorie}
        </span>
        <StatusBadge statut={team.statut} />
        <span
          aria-hidden="true"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .15s',
            color: 'var(--muted)',
            fontSize: 14,
          }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <TeamCardBody
          team={team}
          etablissement={etablissement}
          responsables={responsables}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}

function TeamCardBody({
  team,
  etablissement,
  responsables,
  onUpdated,
  onDeleted,
}: {
  team: Team;
  etablissement: Etablissement | null;
  responsables: Profile[];
  onUpdated: (t: Team) => void;
  onDeleted: () => void;
}) {
  const [nomRobot, setNomRobot] = useState<string>(team.nom_robot ?? '');
  const [statut, setStatut] = useState<ControleTechniquePayload['statut']>(
    team.statut === 'disqualifie' ? 'disqualifie'
    : team.statut === 'inscrit' ? 'inscrit'
    : 'controle_technique_ok',
  );
  const [notes, setNotes] = useState<string>(team.notes_technique ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty =
    (nomRobot.trim() || '') !== (team.nom_robot ?? '') ||
    statut !== team.statut ||
    (notes || '') !== (team.notes_technique ?? '');

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const newNom = nomRobot.trim();

      if (!supabase) throw new Error("Supabase n'est pas configuré.");

      // Tout via Supabase directement (l'API REST NestJS n'est pas requise)
      const { data, error } = await supabase
        .from('teams')
        .update({
          nom_robot: newNom || null,
          statut,
          notes_technique: notes.trim() || null,
        })
        .eq('id', team.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      onUpdated(data as Team);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  async function performDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.teams.delete(team.id);
      onDeleted();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Échec de la suppression.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--bg-2)',
        padding: '20px 18px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <DetailField label="Immatriculation" value={team.immatriculation} mono />
        <DetailField
          label="Établissement"
          value={
            etablissement
              ? `${etablissement.nom}${etablissement.ville ? ' · ' + etablissement.ville : ''}`
              : team.etablissement_id ?? '—'
          }
        />
        <DetailField
          label="Code postal"
          value={etablissement?.code_postal ?? '—'}
          mono
        />
        {etablissement?.contact_nom && (
          <DetailField
            label="Contact"
            value={`${etablissement.contact_nom}${etablissement.contact_email ? ' · ' + etablissement.contact_email : ''}${etablissement.contact_tel ? ' · ' + etablissement.contact_tel : ''}`}
          />
        )}
        <DetailField
          label={responsables.length > 1 ? 'Responsables péda.' : 'Responsable péda.'}
          value={
            responsables.length === 0
              ? '—'
              : responsables
                  .map(
                    (r) =>
                      `${r.prenom} ${r.nom}${r.discipline ? ' · ' + r.discipline : ''}`,
                  )
                  .join(' / ')
          }
        />
        <DetailField label="Catégorie" value={team.categorie} />
        <DetailField label="Épreuve" value={EPREUVE_LABELS[team.epreuve]} />
        {/* <DetailField
          label="Coût HT"
          value={team.cout_ht != null ? `${team.cout_ht} €` : '—'}
        /> */}
      </div>

      {team.description && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 6,
            }}
          >
            Description du robot
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--ink)',
              lineHeight: 1.55,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {team.description}
          </div>
        </div>
      )}

      <div className="field-group-title">Nom du robot</div>
      <div className="field-row single">
        <div className="field">
          <label htmlFor={`nom-robot-${team.id}`}>Nom du robot</label>
          <input
            id={`nom-robot-${team.id}`}
            type="text"
            placeholder="Nom du robot…"
            value={nomRobot}
            onChange={(e) => setNomRobot(e.target.value)}
          />
        </div>
      </div>

      <div className="field-group-title">Contrôle technique</div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`statut-${team.id}`}>Statut</label>
          <select
            id={`statut-${team.id}`}
            value={statut}
            onChange={(e) =>
              setStatut(e.target.value as ControleTechniquePayload['statut'])
            }
          >
            <option value="inscrit">Inscrit</option>
            <option value="controle_technique_ok">CT validé</option>
            <option value="disqualifie">Disqualifié</option>
          </select>
        </div>
        <div className="field">
          <label>Statut actuel</label>
          <div style={{ paddingTop: 8 }}>
            <StatusBadge statut={team.statut} />
          </div>
        </div>
      </div>
      <div className="field-row single">
        <div className="field">
          <label htmlFor={`notes-${team.id}`}>
            Notes techniques (visibles aux organisateurs)
          </label>
          <textarea
            id={`notes-${team.id}`}
            placeholder="Remarques sur le contrôle technique…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {saveError && (
        <div className="callout warn" style={{ marginTop: 12 }}>
          <div className="callout-label">→ Erreur</div>
          {saveError}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!dirty || saving}
            onClick={save}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
          {dirty && !saving && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setNomRobot(team.nom_robot ?? '');
                setStatut(team.statut === 'disqualifie' ? 'disqualifie' : team.statut === 'inscrit' ? 'inscrit' : 'controle_technique_ok');
                setNotes(team.notes_technique ?? '');
                setSaveError(null);
              }}
            >
              Annuler
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {!confirmDelete ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmDelete(true)}
              style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
            >
              Supprimer
            </button>
          ) : (
            <>
              <span style={{ color: 'var(--red)', fontSize: 13 }}>
                Sûr ? Action irréversible.
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  background: 'var(--red)',
                  borderColor: 'var(--red)',
                }}
                disabled={deleting}
                onClick={performDelete}
              >
                {deleting ? 'Suppression…' : 'Confirmer'}
              </button>
            </>
          )}
        </div>
      </div>

      {deleteError && (
        <div className="callout warn" style={{ marginTop: 12 }}>
          <div className="callout-label">→ Suppression impossible</div>
          {deleteError}
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            ⚠ Le back n'expose pas encore <code>DELETE /api/teams/:id</code>.
            Cette action sera fonctionnelle dès que l'endpoint sera ajouté.
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: small ? 12 : 14,
          color: 'var(--ink)',
          fontFamily: mono ? 'var(--ff-mono)' : undefined,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
}
