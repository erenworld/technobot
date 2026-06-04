import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Categorie, Epreuve, Team } from '../types/api';
import { AdminScoringForm } from './AdminScoringForm';

/**
 * Console de notation — 3 étapes : épreuve → équipe → grille.
 * Réécrit sans scoring.ts (supprimé). Utilise AdminScoringForm pour la grille.
 */

type EpreuveChoice = {
  epreuveType: string;
  categorie: Categorie;
  label: string;
  tag: string;
  desc: string;
};

const EPREUVE_CHOICES: EpreuveChoice[] = [
  { epreuveType: 'design', categorie: 'college', label: 'Design', tag: 'Collèges', desc: 'Ergonomie, finition, originalité du robot.' },
  { epreuveType: 'presentation_projet', categorie: 'college', label: 'Présentation de projet', tag: 'Collèges', desc: 'Soutenance orale — aisance, contenu, langues, outils.' },
  { epreuveType: 'presentation_projet', categorie: 'lycee', label: 'Présentation SUMO', tag: 'Lycées', desc: 'Présentation en langue vivante — 7 critères.' },
  { epreuveType: 'suivi_ligne', categorie: 'college', label: 'Suivi de ligne', tag: 'Collèges', desc: 'Parcours chronométré + 6 pistes bonus.' },
  { epreuveType: 'formule_robot', categorie: 'college', label: 'Formule Robot', tag: 'Collèges', desc: 'Classement par place — grille de points officielle.' },
  { epreuveType: 'sumo', categorie: 'lycee', label: 'Sumo — rencontres', tag: 'Lycées', desc: 'Classement sumo lycée — ex-aequo possible après la 4e place.' },
];

const STEPS = [
  { num: '01', name: 'Épreuve', desc: 'Type de grille' },
  { num: '02', name: 'Équipe', desc: 'Robot à évaluer' },
  { num: '03', name: 'Notation', desc: 'Saisie et envoi' },
];

export function AdminScoring() {
  const { session, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [choice, setChoice] = useState<EpreuveChoice | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [done, setDone] = useState(false);

  // Find the matching epreuve_id from epreuves table (needed by AdminScoringForm)
  const [epreuveId, setEpreuveId] = useState('');

  const juryLabel = profile
    ? `${profile.prenom} ${profile.nom}`.trim() || profile.email
    : session?.user?.email ?? 'Non connecté';

  // Load teams when choice is set
  useEffect(() => {
    if (!choice || !supabase) return;
    setLoadingTeams(true);
    setTeam(null);
    supabase.from('teams')
      .select('*')
      .eq('epreuve', choice.epreuveType as Epreuve)
      .eq('categorie', choice.categorie)
      .order('immatriculation', { ascending: true })
      .then(({ data }) => {
        setTeams((data ?? []) as Team[]);
        setLoadingTeams(false);
      });
  }, [choice]);

  // Look up epreuve_id when choice + team are set
  useEffect(() => {
    if (!choice || !team || !supabase) return;
    supabase.from('epreuves')
      .select('id')
      .eq('type', choice.epreuveType)
      .then(({ data }) => {
        const byEdition = (data ?? []).find((e: { id: string }) => e);
        setEpreuveId(byEdition?.id ?? '');
      });
  }, [choice, team]);

  const filteredTeams = useMemo(() => {
    return teams;
  }, [teams]);

  function selectChoice(c: EpreuveChoice) {
    setChoice(c);
    setStep(2);
    setDone(false);
  }

  function selectTeam(t: Team) {
    setTeam(t);
    setStep(3);
  }

  function reset() {
    setStep(1);
    setChoice(null);
    setTeam(null);
    setTeams([]);
    setEpreuveId('');
    setDone(false);
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
          return (
            <div key={s.num} className={classes.join(' ')}
              onClick={() => !done && n <= step && setStep(n)}
              style={{ cursor: !done && n <= step ? 'pointer' : 'default' }}>
              <div className="step-num"><span>{s.num}</span></div>
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
            Notes au nom de <strong>{juryLabel}</strong>
            {profile?.role ? <> · <strong>{profile.role}</strong></> : null}.
          </p>
        </div>
      </aside>

      <main className="form-main">
        {done && choice && team ? (
          <div className="success-screen active">
            <div className="success-icon">✓</div>
            <h2>Note <em>enregistrée</em>.</h2>
            <p>
              <strong>{team.immatriculation} · {team.nom_robot}</strong> — {choice.label}.
            </p>
            <div className="success-actions">
              <button type="button" className="btn btn-primary" onClick={reset}>
                Noter un autre robot
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Étape 01 */}
            <div className={`form-section${step === 1 ? ' active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 01 sur 03</div>
                <h2>L'épreuve à noter.</h2>
                <p>Chaque épreuve a sa propre grille de notation.</p>
              </div>
              <div className="field-group-title">Grille de notation</div>
              <div className="event-picker">
                {EPREUVE_CHOICES.map((c, i) => (
                  <label key={i} className="event-pick">
                    <input type="radio" name="epreuve-choice"
                      checked={choice?.epreuveType === c.epreuveType && choice?.categorie === c.categorie}
                      onChange={() => selectChoice(c)} />
                    <div className="event-pick-card">
                      <div className="event-pick-num">{String(i + 1).padStart(2, '0')} · {c.tag}</div>
                      <h4>{c.label}</h4>
                      <p>{c.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Étape 02 */}
            <div className={`form-section${step === 2 ? ' active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 02 sur 03</div>
                <h2>L'équipe qui passe.</h2>
                <p>{choice ? `Équipes inscrites en « ${choice.label} » (${choice.categorie}).` : 'Choisissez d\'abord une épreuve.'}</p>
              </div>
              {loadingTeams && (
                <div className="callout">
                  <div className="callout-label">→ Chargement</div>
                  Récupération des équipes…
                </div>
              )}
              {!loadingTeams && filteredTeams.length === 0 && (
                <div className="callout warn">
                  <div className="callout-label">→ Aucune équipe</div>
                  Aucune équipe inscrite pour cette épreuve.
                </div>
              )}
              {!loadingTeams && filteredTeams.length > 0 && (
                <>
                  <div className="field-group-title">Équipes ({filteredTeams.length})</div>
                  <div className="event-picker">
                    {filteredTeams.map((t) => (
                      <label key={t.id} className="event-pick">
                        <input type="radio" name="team"
                          checked={team?.id === t.id}
                          onChange={() => selectTeam(t)} />
                        <div className="event-pick-card">
                          <div className="event-pick-num">{t.immatriculation} · {t.statut.replace(/_/g, ' ')}</div>
                          <h4>{t.nom_robot || '—'}</h4>
                          <p>{t.etablissement_id ?? '—'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div className="form-nav" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost prev" onClick={() => setStep(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M11 6L5 12l6 6" /></svg>
                  Précédent
                </button>
                <div className="step-indicator">Étape <strong>2</strong> / 3</div>
                <button type="button" className="btn btn-primary next" disabled={!team} onClick={() => setStep(3)}>
                  Suivant
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
              </div>
            </div>

            {/* Étape 03 */}
            <div className={`form-section${step === 3 ? ' active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 03 sur 03</div>
                <h2>La grille de notation.</h2>
                {choice && team && (
                  <p>{choice.label} — {team.immatriculation} · {team.nom_robot}.</p>
                )}
              </div>

              {!profile && (
                <div className="callout warn" style={{ marginBottom: 16 }}>
                  <div className="callout-label">→ Profil introuvable</div>
                  Aucun profil associé. L'envoi échouera. <Link to="/login">Se reconnecter</Link>
                </div>
              )}

              {choice && team && (
                <AdminScoringForm
                  team={team}
                  epreuveType={choice.epreuveType}
                  epreuveId={epreuveId}
                  onDone={() => setDone(true)}
                  onCancel={() => setStep(2)}
                />
              )}

              <div className="form-nav" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost prev" onClick={() => setStep(2)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M11 6L5 12l6 6" /></svg>
                  Précédent
                </button>
                <div className="step-indicator">Étape <strong>3</strong> / 3</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
