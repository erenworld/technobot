import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTeams } from '../lib/useTeams';
import { api } from '../lib/api';
import {
  SCORING_CONFIGS,
  ScoreField,
  ScoreGroup,
  ScoringConfig,
} from '../lib/scoring';
import { Team } from '../types/api';

/**
 * Console de notation — 3 étapes (épreuve → groupe → grille).
 *
 * Rendu sans Nav/Footer/page-head : ces éléments sont fournis par AdminPage
 * (qui gère aussi l'authentification et la sélection d'onglet).
 */

type Values = Record<string, number | boolean>;

const STEPS = [
  { num: '01', name: 'Épreuve', desc: 'Grille de notation' },
  { num: '02', name: 'Groupe', desc: 'Équipe à évaluer' },
  { num: '03', name: 'Notation', desc: 'Saisie et envoi' },
];

function initialValues(config: ScoringConfig): Values {
  const values: Values = {};
  for (const group of config.groups) {
    for (const field of group.fields) {
      if (field.kind === 'grade') values[field.key] = 0;
      else if (field.kind === 'bool') values[field.key] = false;
      else if (field.kind === 'int') values[field.key] = field.min;
      else values[field.key] = 0;
    }
  }
  return values;
}

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

function gradeTotal(config: ScoringConfig, values: Values): number {
  let total = 0;
  for (const group of config.groups) {
    for (const field of group.fields) {
      if (field.kind === 'grade') total += Number(values[field.key] ?? 0);
    }
  }
  return total;
}

export function AdminScoring() {
  const { session, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ScoringConfig | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [values, setValues] = useState<Values>({});
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const teamsState = useTeams(config ? config.teamFilter : null);

  const total = useMemo(
    () => (config ? gradeTotal(config, values) : 0),
    [config, values],
  );

  const juryLabel = profile
    ? `${profile.prenom} ${profile.nom}`.trim() || profile.email
    : session?.user?.email ?? 'Non connecté';

  const selectConfig = (next: ScoringConfig) => {
    setConfig(next);
    setValues(initialValues(next));
    setTeam(null);
    setError(null);
    setStep(2);
  };

  const selectTeam = (next: Team) => {
    setTeam(next);
    setError(null);
    setStep(3);
  };

  const setValue = (key: string, value: number | boolean) => {
    setValues((cur) => ({ ...cur, [key]: value }));
  };

  const reset = () => {
    setStep(1);
    setConfig(null);
    setTeam(null);
    setValues({});
    setObservations('');
    setError(null);
    setDone(false);
  };

  const canAdvance =
    (step === 1 && !!config) || (step === 2 && !!team) || step === 3;

  const next = () => {
    if (step === 1 && config) setStep(2);
    else if (step === 2 && team) setStep(3);
    else if (step === 3) void submit();
  };

  const prev = () => {
    if (step > 1) setStep(step - 1);
  };

  async function submit() {
    if (!config || !team) return;
    setSubmitting(true);
    setError(null);

    // Le back exige le `profile.id` (pas l'id Supabase Auth) — voir
    // SupabaseAuthGuard qui résout le profil depuis auth_user_id.
    const juryId = profile?.id ?? session?.user?.id ?? '00000000-0000-0000-0000-000000000000';
    const payload: Record<string, unknown> = {
      team_id: team.id,
      jury_id: juryId,
      ...values,
    };
    if (observations.trim()) payload.observations = observations.trim();

    try {
      await api.scores.create(config.endpoint, payload);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'envoi de la note.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-layout">
      <aside className="stepper">
        <div className="stepper-label">// Étapes</div>

        {STEPS.map((s, i) => {
          const n = i + 1;
          const classes = ['step'];
          if (done) classes.push('done');
          else if (n === step) classes.push('active');
          else if (n < step) classes.push('done');
          const reachable = !done && n <= step;
          return (
            <div
              key={s.num}
              className={classes.join(' ')}
              onClick={() => reachable && setStep(n)}
              style={{ cursor: reachable ? 'pointer' : 'default' }}
            >
              <div className="step-num">
                <span>{s.num}</span>
              </div>
              <div>
                <div className="step-name">{s.name}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          );
        })}

        <div className="sidebar-note">
          <h4>→ Jury connecté</h4>
          <p>
            Notes envoyées au nom de <strong>{juryLabel}</strong>.
            {profile?.role ? (
              <>
                {' '}· Rôle <strong>{profile.role}</strong>.
              </>
            ) : null}
          </p>
        </div>
      </aside>

      <main className="form-main">
        {done && config && team ? (
          <div className="success-screen active">
            <div className="success-icon">✓</div>
            <h2>
              Note <em>enregistrée</em>.
            </h2>
            <p>
              La note de <strong>{team.immatriculation} · {team.nom_robot}</strong>{' '}
              pour l'épreuve <strong>{config.title}</strong> a bien été envoyée
              à l'API.
            </p>
            <div className="success-actions">
              <button type="button" className="btn btn-primary" onClick={reset}>
                Noter un autre groupe
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Étape 01 — épreuve */}
            <div className={`form-section${step === 1 ? ' active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 01 sur 03</div>
                <h2>L'épreuve à noter.</h2>
                <p>
                  Chaque épreuve a sa propre grille. Le choix détermine la
                  liste des groupes proposée à l'étape suivante.
                </p>
              </div>

              <div className="field-group-title">Grille de notation</div>
              <div className="event-picker">
                {SCORING_CONFIGS.map((c) => (
                  <label key={c.endpoint} className="event-pick">
                    <input
                      type="radio"
                      name="scoring-config"
                      checked={config?.endpoint === c.endpoint}
                      onChange={() => selectConfig(c)}
                    />
                    <div className="event-pick-card">
                      <div className="event-pick-num">
                        {c.num} · {c.tag}
                      </div>
                      <h4>{c.title}</h4>
                      <p>{c.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Étape 02 — groupe */}
            <div className={`form-section${step === 2 ? ' active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 02 sur 03</div>
                <h2>Le groupe qui passe.</h2>
                <p>
                  {config
                    ? `Groupes inscrits en « ${config.title} ».`
                    : 'Choisissez d\'abord une épreuve.'}
                </p>
              </div>

              {config && teamsState.loading && (
                <div className="callout">
                  <div className="callout-label">→ Chargement</div>
                  Récupération des groupes…
                </div>
              )}

              {config && !teamsState.loading && teamsState.usingMock && (
                <div className="callout new">
                  <div className="callout-label">→ Données de démonstration</div>
                  L'API n'a renvoyé aucun groupe (base non peuplée ou
                  inaccessible). Liste de démonstration affichée — l'envoi
                  d'une note échouera tant que le back n'expose pas de vraies
                  équipes.
                </div>
              )}

              {config && !teamsState.loading && teamsState.teams.length > 0 && (
                <>
                  <div className="field-group-title">
                    Groupes ({teamsState.teams.length})
                  </div>
                  <div className="event-picker">
                    {teamsState.teams.map((t) => (
                      <label key={t.id} className="event-pick">
                        <input
                          type="radio"
                          name="team"
                          checked={team?.id === t.id}
                          onChange={() => selectTeam(t)}
                        />
                        <div className="event-pick-card">
                          <div className="event-pick-num">
                            {t.immatriculation} · {t.statut.replace(/_/g, ' ')}
                          </div>
                          <h4>{t.nom_robot}</h4>
                          <p>{t.etablissement}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {config && !teamsState.loading && teamsState.teams.length === 0 && (
                <div className="callout warn">
                  <div className="callout-label">→ Aucun groupe</div>
                  Aucun groupe inscrit pour cette épreuve.
                </div>
              )}
            </div>

            {/* Étape 03 — notation */}
            <div className={`form-section${step === 3 ? ' active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 03 sur 03</div>
                <h2>La grille de notation.</h2>
                <p>
                  {config && team
                    ? `${config.title} — ${team.immatriculation} · ${team.nom_robot}.`
                    : 'Choisissez une épreuve et un groupe.'}
                </p>
              </div>

              {config &&
                config.groups.map((group) => (
                  <ScoreGroupFields
                    key={group.title}
                    group={group}
                    values={values}
                    onChange={setValue}
                  />
                ))}

              {config && (
                <>
                  <div className="field-group-title">Observations</div>
                  <div className="field-row single">
                    <div className="field">
                      <label htmlFor="observations">
                        Remarques du jury (optionnel)
                      </label>
                      <textarea
                        id="observations"
                        placeholder="Points forts, incidents de passage…"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="summary" style={{ marginTop: 28 }}>
                    <div className="summary-row">
                      <span className="key">Épreuve</span>
                      <span className="val">{config.title}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Groupe</span>
                      <span className="val">
                        {team
                          ? `${team.immatriculation} · ${team.nom_robot}`
                          : '—'}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Total critères</span>
                      <span className="val">{total} pts</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Jury</span>
                      <span className="val">{juryLabel}</span>
                    </div>
                  </div>
                </>
              )}

              {!profile && (
                <div className="callout warn" style={{ marginTop: 16 }}>
                  <div className="callout-label">→ Profil introuvable</div>
                  Aucun profil n'est associé à ton compte côté back. L'envoi
                  d'une note échouera tant que ton `auth_user_id` n'est pas
                  rattaché à un profil jury/admin/organisateur.{' '}
                  <Link to="/login">Se reconnecter</Link>
                </div>
              )}

              {error && (
                <div className="callout warn" style={{ marginTop: 16 }}>
                  <div className="callout-label">→ Erreur</div>
                  {error}
                </div>
              )}
            </div>

            <div className="form-nav">
              <button
                type="button"
                className="btn btn-ghost prev"
                onClick={prev}
                disabled={step === 1 || submitting}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M11 6L5 12l6 6" />
                </svg>
                Précédent
              </button>
              <div className="step-indicator">
                Étape <strong>{step}</strong> / 3
              </div>
              <button
                type="button"
                className="btn btn-primary next"
                onClick={next}
                disabled={!canAdvance || submitting}
              >
                {step === 3
                  ? submitting
                    ? 'Envoi…'
                    : 'Envoyer la note'
                  : 'Suivant'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function ScoreGroupFields({
  group,
  values,
  onChange,
}: {
  group: ScoreGroup;
  values: Values;
  onChange: (key: string, value: number | boolean) => void;
}) {
  const inputs = group.fields.filter((f) => f.kind !== 'bool');
  const bools = group.fields.filter((f) => f.kind === 'bool');

  return (
    <>
      <div className="field-group-title">{group.title}</div>

      {chunkPairs(inputs).map((row, i) => (
        <div key={i} className={`field-row${row.length === 1 ? ' single' : ''}`}>
          {row.map((field) => (
            <InputField
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={onChange}
            />
          ))}
        </div>
      ))}

      {bools.map((field) => (
        <label key={field.key} className="check">
          <input
            type="checkbox"
            checked={Boolean(values[field.key])}
            onChange={(e) => onChange(field.key, e.target.checked)}
          />
          <div className="check-txt">{field.label}</div>
        </label>
      ))}
    </>
  );
}

function InputField({
  field,
  value,
  onChange,
}: {
  field: ScoreField;
  value: number | boolean | undefined;
  onChange: (key: string, value: number | boolean) => void;
}) {
  if (field.kind === 'grade') {
    return (
      <div className="field">
        <label htmlFor={field.key}>
          {field.label}{' '}
          <span style={{ color: 'var(--muted)' }}>/ {field.max}</span>
        </label>
        <select
          id={field.key}
          value={String(Number(value ?? 0))}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
        >
          {Array.from({ length: field.max + 1 }, (_, n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const suffix = 'suffix' in field && field.suffix ? ` (${field.suffix})` : '';
  return (
    <div className="field">
      <label htmlFor={field.key}>
        {field.label}
        {suffix}
      </label>
      <input
        id={field.key}
        type="number"
        min={field.kind === 'int' ? field.min : 0}
        max={field.kind === 'int' ? field.max : undefined}
        value={String(Number(value ?? 0))}
        onChange={(e) => onChange(field.key, Number(e.target.value))}
      />
    </div>
  );
}
