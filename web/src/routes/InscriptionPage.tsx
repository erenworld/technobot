import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';
import { supabase } from '../lib/supabase';

/**
 * Inscription d'un établissement à TECHNOBOT.
 *
 * Règle métier — **un robot = une épreuve = jusqu'à 5 élèves**.
 *  - Collèges : suivi_ligne / formule_robot / design / presentation_projet
 *    sont obligatoires. Le sumo est facultatif.
 *  - Lycées : sumo + presentation_projet (en LV) sont obligatoires.
 *
 * Chaque robot porte donc sa propre composition d'équipe (la table `team_members`
 * côté back lie `team_id` → `profile_id`). Le formulaire est encore mock-only
 * mais sa structure reflète ce mapping pour le futur branchement.
 */

type EpreuveKey =
  | 'suivi_ligne'
  | 'formule_robot'
  | 'design'
  | 'presentation_projet'
  | 'sumo';

type Categorie = 'college' | 'lycee';

type EpreuveDef = { num: string; title: string; desc: string };

const EPREUVE_DEFS: Record<EpreuveKey, EpreuveDef> = {
  suivi_ligne: {
    num: '01',
    title: 'Suivi de ligne',
    desc: 'Tracé complexe, chrono, 6 pistes bonus.',
  },
  formule_robot: {
    num: '02',
    title: 'Formule robot',
    desc: 'Course ovale à deux, 3 tours.',
  },
  design: {
    num: '03',
    title: 'Design',
    desc: 'Ergonomie, originalité, affiche.',
  },
  presentation_projet: {
    num: '04',
    title: 'Présentation de projet',
    desc: '3 min chrono, schémas SysML.',
  },
  sumo: {
    num: '05',
    title: 'Sumo autonome',
    desc: 'Dohyo Ø 92 cm, 750 g max.',
  },
};

function defFor(key: EpreuveKey, categorie: Categorie): EpreuveDef {
  if (key === 'presentation_projet' && categorie === 'lycee') {
    return {
      num: '04',
      title: 'Présentation en LV',
      desc: '5 min en anglais + dossier technique.',
    };
  }
  return EPREUVE_DEFS[key];
}

function categorieOf(etabType: string): Categorie {
  return etabType.startsWith('Collège') ? 'college' : 'lycee';
}

function epreuvesForType(
  etabType: string,
): Array<{ key: EpreuveKey; mandatory: boolean }> {
  if (categorieOf(etabType) === 'college') {
    return [
      { key: 'suivi_ligne', mandatory: true },
      { key: 'formule_robot', mandatory: true },
      { key: 'design', mandatory: true },
      { key: 'presentation_projet', mandatory: true },
      { key: 'sumo', mandatory: false },
    ];
  }
  return [
    { key: 'sumo', mandatory: true },
    { key: 'presentation_projet', mandatory: true },
  ];
}

const STEPS = [
  { num: '01', name: 'Établissement', desc: 'Identité du collège ou lycée' },
  { num: '02', name: 'Responsable', desc: 'Enseignant-référent' },
  { num: '03', name: 'Robots & équipes', desc: '1 robot = 1 épreuve = 5 élèves max' },
  { num: '04', name: 'Charte & envoi', desc: 'Validation finale' },
];

type FormState = {
  etabNom: string;
  etabType: string;
  etabVille: string;
  etabCp: string;
  respNom: string;
  respPrenom: string;
  respDisc: string;
  respTel: string;
  respMail: string;
  coNom: string;
  coMail: string;
  charte1: boolean;
  charte2: boolean;
  charte3: boolean;
  charte4: boolean;
};

const INITIAL_FORM: FormState = {
  etabNom: '',
  etabType: 'Collège',
  etabVille: '',
  etabCp: '',
  respNom: '',
  respPrenom: '',
  respDisc: 'Technologie',
  respTel: '',
  respMail: '',
  coNom: '',
  coMail: '',
  charte1: false,
  charte2: false,
  charte3: false,
  charte4: false,
};

type Student = { id: number; nom: string; prenom: string };

type RobotInfo = {
  nom: string;
  cout: string;
  descr: string;
  /** 1 à 5 élèves par robot (table `team_members` côté back). */
  students: Student[];
};

let studentIdSeq = 1000;
const newStudent = (): Student => ({
  id: ++studentIdSeq,
  nom: '',
  prenom: '',
});

const emptyRobot = (): RobotInfo => ({
  nom: '',
  cout: '',
  descr: '',
  students: [newStudent(), newStudent(), newStudent()],
});

type Robots = Partial<Record<EpreuveKey, RobotInfo>>;

function initialRobots(etabType: string): Robots {
  const robots: Robots = {};
  for (const { key, mandatory } of epreuvesForType(etabType)) {
    if (mandatory) robots[key] = emptyRobot();
  }
  return robots;
}

function scrollToForm() {
  const el = document.querySelector('.form-main');
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function InscriptionPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [robots, setRobots] = useState<Robots>(() =>
    initialRobots(INITIAL_FORM.etabType),
  );
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdTeams, setCreatedTeams] = useState<
    Array<{ immatriculation: string; epreuve: string }>
  >([]);

  const totalSteps = 4;
  const categorie = categorieOf(form.etabType);
  const epreuvesList = useMemo(
    () => epreuvesForType(form.etabType),
    [form.etabType],
  );

  // Quand le type d'établissement change, on garde les robots saisis qui sont
  // toujours applicables et on initialise des slots vides pour les nouvelles
  // épreuves obligatoires.
  useEffect(() => {
    setRobots((cur) => {
      const next: Robots = {};
      for (const { key, mandatory } of epreuvesList) {
        if (mandatory) next[key] = cur[key] ?? emptyRobot();
        else if (cur[key]) next[key] = cur[key];
      }
      return next;
    });
  }, [epreuvesList]);

  useEffect(() => {
    if (step === 1 && !submitted) return;
    scrollToForm();
  }, [step, submitted]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((cur) => ({ ...cur, [key]: value }));
  };

  const toggleEpreuve = (key: EpreuveKey, on: boolean) => {
    setRobots((cur) => {
      const next = { ...cur };
      if (on) next[key] = next[key] ?? emptyRobot();
      else delete next[key];
      return next;
    });
  };

  const updateRobot = (
    key: EpreuveKey,
    field: Exclude<keyof RobotInfo, 'students'>,
    value: string,
  ) => {
    setRobots((cur) => {
      const r = cur[key];
      if (!r) return cur;
      return { ...cur, [key]: { ...r, [field]: value } };
    });
  };

  const updateStudent = (
    key: EpreuveKey,
    sid: number,
    field: 'nom' | 'prenom',
    value: string,
  ) => {
    setRobots((cur) => {
      const r = cur[key];
      if (!r) return cur;
      return {
        ...cur,
        [key]: {
          ...r,
          students: r.students.map((s) =>
            s.id === sid ? { ...s, [field]: value } : s,
          ),
        },
      };
    });
  };

  const addStudent = (key: EpreuveKey) => {
    setRobots((cur) => {
      const r = cur[key];
      if (!r || r.students.length >= 5) return cur;
      return { ...cur, [key]: { ...r, students: [...r.students, newStudent()] } };
    });
  };

  const removeStudent = (key: EpreuveKey, sid: number) => {
    setRobots((cur) => {
      const r = cur[key];
      if (!r || r.students.length <= 1) return cur;
      return {
        ...cur,
        [key]: { ...r, students: r.students.filter((s) => s.id !== sid) },
      };
    });
  };

  const next = () => {
    if (step < totalSteps) setStep(step + 1);
    else void submit();
  };

  const prev = () => {
    if (step > 1) setStep(step - 1);
  };

  /**
   * Envoie l'inscription à Supabase via la fonction RPC
   * `register_school_inscription` (transactionnelle, security definer).
   * Crée en une seule transaction : l'établissement, le profil responsable,
   * les robots, les profils élèves et leur rattachement à chaque robot via
   * `team_members`.
   */
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    if (!supabase) {
      setSubmitError(
        "Supabase n'est pas configuré côté front (VITE_SUPABASE_URL manquant).",
      );
      setSubmitting(false);
      return;
    }

    if (
      !form.charte1 ||
      !form.charte2 ||
      !form.charte3 ||
      !form.charte4
    ) {
      setSubmitError(
        'Merci de cocher les quatre engagements de la charte avant d\'envoyer.',
      );
      setSubmitting(false);
      return;
    }

    if (activeRobots.length === 0) {
      setSubmitError(
        'Aucune épreuve sélectionnée : revenez à l\'étape 03 et cochez au moins un robot.',
      );
      setSubmitting(false);
      return;
    }

    const payload = {
      categorie,
      etab_nom: form.etabNom,
      etab_type: form.etabType,
      etab_ville: form.etabVille,
      etab_cp: form.etabCp,
      resp_nom: form.respNom,
      resp_prenom: form.respPrenom,
      resp_nom_complet: `${form.respPrenom} ${form.respNom}`.trim(),
      resp_disc: form.respDisc,
      resp_tel: form.respTel,
      resp_mail: form.respMail,
      co_nom: form.coNom,
      co_mail: form.coMail,
      robots: activeRobots.map(({ key, robot }) => ({
        epreuve: key,
        nom: robot.nom,
        cout: robot.cout,
        descr: robot.descr,
        students: robot.students
          .filter((s) => s.nom.trim() || s.prenom.trim())
          .map((s) => ({ nom: s.nom.trim(), prenom: s.prenom.trim() })),
      })),
    };

    try {
      const { data, error } = await supabase.rpc(
        'register_school_inscription',
        { payload },
      );

      if (error) throw error;

      const result = data as {
        edition_id: string;
        etablissement_id: string;
        teams: Array<{
          team_id: string;
          immatriculation: string;
          epreuve: string;
          students: Array<{ profile_id: string; nom: string; prenom: string }>;
        }>;
      };

      const firstImmat = result.teams[0]?.immatriculation;
      setRefId(firstImmat ? `#${firstImmat}` : `#${result.etablissement_id.slice(0, 8).toUpperCase()}`);
      setCreatedTeams(
        result.teams.map((t) => ({
          immatriculation: t.immatriculation,
          epreuve: t.epreuve,
        })),
      );
      setSubmitted(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Échec de l\'envoi.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activeRobots = useMemo(
    () =>
      epreuvesList
        .filter(({ key }) => robots[key])
        .map(({ key }) => ({ key, robot: robots[key] as RobotInfo })),
    [epreuvesList, robots],
  );

  const summary = useMemo(() => {
    const etab = form.etabNom || '-';
    const ville = form.etabVille ? ` · ${form.etabVille}` : '';
    const resp = `${form.respPrenom} ${form.respNom}`.trim() || '-';
    const epreuveLabels = activeRobots
      .map(({ key }) => defFor(key, categorie).title)
      .join(' · ');
    const totalEleves = activeRobots.reduce(
      (acc, { robot }) => acc + robot.students.length,
      0,
    );
    return {
      etab: `${etab}${ville}`,
      resp,
      robots: `${activeRobots.length} robot${activeRobots.length > 1 ? 's' : ''}`,
      epreuves: epreuveLabels || '-',
      eleves: `${totalEleves} élève${totalEleves > 1 ? 's' : ''} au total`,
    };
  }, [form, activeRobots, categorie]);

  return (
    <>
      <Nav active="inscription" />

      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>Inscription</span>
        </div>
        <h1>
          Inscrire
          <br />
          un <em>établissement.</em>
        </h1>
        <p>
          Quatre étapes. <strong>Un robot par épreuve</strong>, et chaque robot
          a sa propre équipe d'élèves (jusqu'à 5 par robot).
        </p>
      </header>

      <div className="form-layout">
        <aside className="stepper">
          <div className="stepper-label">// Étapes</div>

          {STEPS.map((s, i) => {
            const n = i + 1;
            const classes = ['step'];
            if (submitted) classes.push('done');
            else if (n === step) classes.push('active');
            else if (n < step) classes.push('done');
            return (
              <div
                key={s.num}
                className={classes.join(' ')}
                onClick={() => !submitted && setStep(n)}
                style={{ cursor: submitted ? 'default' : 'pointer' }}
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
            <h4>→ Rappel</h4>
            <p>
              Les inscriptions closent le <strong>12 décembre 2025</strong>.
              Participation : <strong>50 €</strong> à TechTic&amp;Co.{' '}
              <strong>1 robot = 1 épreuve = 5 élèves max</strong>.
            </p>
          </div>
        </aside>

        <main className="form-main">
          <form onSubmit={(e) => e.preventDefault()}>
            {!submitted && (
              <>
                {/* Étape 01 — Établissement */}
                <div className={`form-section${step === 1 ? ' active' : ''}`}>
                  <div className="form-section-head">
                    <div className="form-section-eyebrow">// Étape 01 sur 04</div>
                    <h2>L'établissement.</h2>
                    <p>
                      On a besoin de vos infos officielles pour le dossier et la
                      facture de participation.
                    </p>
                  </div>

                  <div className="field-group-title">Identité</div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="etab-nom">Nom de l'établissement</label>
                      <input
                        type="text"
                        id="etab-nom"
                        placeholder="Collège Jean-Mermoz"
                        value={form.etabNom}
                        onChange={(e) => update('etabNom', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="etab-type">Type</label>
                      <select
                        id="etab-type"
                        value={form.etabType}
                        onChange={(e) => update('etabType', e.target.value)}
                      >
                        <option>Collège</option>
                        <option>Lycée général</option>
                        <option>Lycée technologique</option>
                        <option>Lycée professionnel</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="etab-ville">Ville</label>
                      <input
                        type="text"
                        id="etab-ville"
                        placeholder="Yutz"
                        value={form.etabVille}
                        onChange={(e) => update('etabVille', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="etab-cp">Code postal</label>
                      <input
                        type="text"
                        id="etab-cp"
                        placeholder="57970"
                        value={form.etabCp}
                        onChange={(e) => update('etabCp', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Étape 02 — Responsable */}
                <div className={`form-section${step === 2 ? ' active' : ''}`}>
                  <div className="form-section-head">
                    <div className="form-section-eyebrow">// Étape 02 sur 04</div>
                    <h2>Le responsable pédagogique.</h2>
                    <p>
                      C'est la personne-référente qui signera la charte et
                      recevra toutes les communications.
                    </p>
                  </div>

                  <div className="field-group-title">Enseignant-référent</div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="resp-nom">Nom</label>
                      <input
                        type="text"
                        id="resp-nom"
                        placeholder="Durand"
                        value={form.respNom}
                        onChange={(e) => update('respNom', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="resp-prenom">Prénom</label>
                      <input
                        type="text"
                        id="resp-prenom"
                        placeholder="Marie"
                        value={form.respPrenom}
                        onChange={(e) => update('respPrenom', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="resp-disc">Discipline</label>
                      <select
                        id="resp-disc"
                        value={form.respDisc}
                        onChange={(e) => update('respDisc', e.target.value)}
                      >
                        <option>Technologie</option>
                        <option>Sciences de l'ingénieur</option>
                        <option>STI2D</option>
                        <option>Enseignement professionnel</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="resp-tel">Téléphone direct</label>
                      <input
                        type="tel"
                        id="resp-tel"
                        placeholder="06 __ __ __ __"
                        value={form.respTel}
                        onChange={(e) => update('respTel', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-row single">
                    <div className="field">
                      <label htmlFor="resp-mail">E-mail académique</label>
                      <input
                        type="email"
                        id="resp-mail"
                        placeholder="marie.durand@ac-nancy-metz.fr"
                        value={form.respMail}
                        onChange={(e) => update('respMail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field-group-title">Co-responsable (optionnel)</div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="co-nom">Nom &amp; prénom</label>
                      <input
                        type="text"
                        id="co-nom"
                        placeholder="Thomas Leroy"
                        value={form.coNom}
                        onChange={(e) => update('coNom', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="co-mail">E-mail</label>
                      <input
                        type="email"
                        id="co-mail"
                        placeholder="thomas.leroy@ac-nancy-metz.fr"
                        value={form.coMail}
                        onChange={(e) => update('coMail', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Étape 03 — Robots, épreuves & équipes */}
                <div className={`form-section${step === 3 ? ' active' : ''}`}>
                  <div className="form-section-head">
                    <div className="form-section-eyebrow">// Étape 03 sur 04</div>
                    <h2>Les robots, épreuves &amp; équipes.</h2>
                    <p>
                      <strong>Un robot par épreuve, jusqu'à 5 élèves par robot.</strong>{' '}
                      {categorie === 'college' ? (
                        <>
                          Les quatre épreuves « collèges » sont obligatoires.
                          Le sumo autonome est facultatif — cochez-le si votre
                          établissement engage un robot dédié.
                        </>
                      ) : (
                        <>
                          Les lycées engagent un robot sumo autonome et une
                          présentation projet en langue vivante.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="field-group-title">
                    Épreuves engagées
                    <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                      {' '}· {activeRobots.length} robot
                      {activeRobots.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="event-picker">
                    {epreuvesList.map(({ key, mandatory }) => {
                      const def = defFor(key, categorie);
                      const checked = mandatory || !!robots[key];
                      return (
                        <label
                          key={key}
                          className="event-pick"
                          style={mandatory ? { cursor: 'default' } : undefined}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={mandatory}
                            onChange={(e) =>
                              !mandatory && toggleEpreuve(key, e.target.checked)
                            }
                          />
                          <div className="event-pick-card">
                            <div className="event-pick-num">
                              {def.num} ·{' '}
                              {mandatory ? 'Obligatoire' : 'Facultatif'}
                            </div>
                            <h4>{def.title}</h4>
                            <p>{def.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {activeRobots.map(({ key, robot }, idx) => {
                    const def = defFor(key, categorie);
                    return (
                      <div key={key}>
                        <div
                          className="field-group-title"
                          style={{ marginTop: idx === 0 ? 28 : 32 }}
                        >
                          Robot {def.num} · {def.title}
                        </div>
                        <div className="field-row">
                          <div className="field">
                            <label htmlFor={`robot-nom-${key}`}>
                              Nom du robot
                            </label>
                            <input
                              type="text"
                              id={`robot-nom-${key}`}
                              placeholder="Colossus Mk-II"
                              value={robot.nom}
                              onChange={(e) =>
                                updateRobot(key, 'nom', e.target.value)
                              }
                            />
                          </div>
                          <div className="field">
                            <label htmlFor={`robot-cout-${key}`}>
                              Coût estimé (€ HT)
                            </label>
                            <input
                              type="number"
                              id={`robot-cout-${key}`}
                              placeholder="85"
                              max={100}
                              value={robot.cout}
                              onChange={(e) =>
                                updateRobot(key, 'cout', e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="field-row single">
                          <div className="field">
                            <label htmlFor={`robot-descr-${key}`}>
                              Description courte (démarche, originalité)
                            </label>
                            <textarea
                              id={`robot-descr-${key}`}
                              placeholder="Un robot inspiré de…"
                              value={robot.descr}
                              onChange={(e) =>
                                updateRobot(key, 'descr', e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Élèves de CE robot */}
                        <div
                          className="field-group-title"
                          style={{ marginTop: 18 }}
                        >
                          Équipe du robot
                          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                            {' '}· {robot.students.length} / 5 élève
                            {robot.students.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="students-grid">
                          {robot.students.map((stu, i) => (
                            <div className="student-row" key={stu.id}>
                              <span className="num">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <input
                                type="text"
                                placeholder="Nom Prénom"
                                value={stu.nom}
                                onChange={(e) =>
                                  updateStudent(key, stu.id, 'nom', e.target.value)
                                }
                              />
                              <input
                                type="text"
                                placeholder="Classe"
                                value={stu.prenom}
                                onChange={(e) =>
                                  updateStudent(
                                    key,
                                    stu.id,
                                    'prenom',
                                    e.target.value,
                                  )
                                }
                              />
                              <button
                                type="button"
                                aria-label="Supprimer cet élève"
                                onClick={() => removeStudent(key, stu.id)}
                                disabled={robot.students.length <= 1}
                              >
                                <svg
                                  width={14}
                                  height={14}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path d="M6 6l12 12M6 18L18 6" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="add-student"
                          onClick={() => addStudent(key)}
                          disabled={robot.students.length >= 5}
                        >
                          + Ajouter un élève à ce robot
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Étape 04 — Charte & validation */}
                <div className={`form-section${step === 4 ? ' active' : ''}`}>
                  <div className="form-section-head">
                    <div className="form-section-eyebrow">// Étape 04 sur 04</div>
                    <h2>La charte &amp; envoi.</h2>
                    <p>
                      Vérifiez le récap puis cochez les engagements de la
                      charte avant d'envoyer le dossier.
                    </p>
                  </div>

                  <div className="field-group-title">Charte du concours</div>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.charte1}
                      onChange={(e) => update('charte1', e.target.checked)}
                    />
                    <div className="check-txt">
                      <span style={{ color: 'var(--red)' }}>* </span>
                      <strong>Je certifie</strong> que l'étude, la conception, la
                      réalisation, la mise au point et la programmation de
                      chaque robot ont été menées{' '}
                      <strong>par les élèves uniquement</strong>, conformément
                      au règlement général du concours.
                    </div>
                  </label>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.charte2}
                      onChange={(e) => update('charte2', e.target.checked)}
                    />
                    <div className="check-txt">
                      <span style={{ color: 'var(--red)' }}>* </span>
                      J'accepte que chaque robot respecte{' '}
                      <strong>les dimensions et la masse imposées</strong>, et
                      que le coût total reste{' '}
                      <strong>inférieur à 100 € HT</strong> (justificatifs
                      disponibles sur demande).
                    </div>
                  </label>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.charte3}
                      onChange={(e) => update('charte3', e.target.checked)}
                    />
                    <div className="check-txt">
                      <span style={{ color: 'var(--red)' }}>* </span>
                      J'accepte les prises de vue photos et vidéos réalisées
                      pendant l'événement dans le cadre de la{' '}
                      <strong>communication TECHNOBOT</strong> (site, réseaux
                      sociaux, presse locale).
                    </div>
                  </label>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.charte4}
                      onChange={(e) => update('charte4', e.target.checked)}
                    />
                    <div className="check-txt">
                      <span style={{ color: 'var(--red)' }}>* </span>
                      L'établissement s'engage à verser la{' '}
                      <strong>participation de 50 €</strong> à l'association
                      TechTic&amp;Co avant le 15 mai 2026.
                    </div>
                  </label>

                  <div className="summary" style={{ marginTop: 28 }}>
                    <div className="summary-row">
                      <span className="key">Établissement</span>
                      <span className="val">{summary.etab}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Responsable</span>
                      <span className="val">{summary.resp}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Robots engagés</span>
                      <span className="val">{summary.robots}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Épreuves</span>
                      <span className="val">{summary.epreuves}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Effectif total</span>
                      <span className="val">{summary.eleves}</span>
                    </div>
                  </div>

                  <p
                    style={{
                      marginTop: 20,
                      fontSize: 12,
                      color: 'var(--muted)',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    En envoyant ce formulaire, vous acceptez les{' '}
                    <Link
                      to="/cgu-confidentialite"
                      target="_blank"
                      style={{ textDecoration: 'underline', color: 'var(--red)' }}
                    >
                      Conditions Générales d'Utilisation
                    </Link>{' '}
                    et confirmez avoir lu la{' '}
                    <Link
                      to="/cgu-confidentialite"
                      target="_blank"
                      style={{ textDecoration: 'underline', color: 'var(--red)' }}
                    >
                      Politique de Confidentialité
                    </Link>{' '}
                    de la plateforme TechnoBot.
                  </p>

                  {submitError && (
                    <div className="callout warn" style={{ marginTop: 20 }}>
                      <div className="callout-label">→ Envoi impossible</div>
                      {submitError}
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
                    Étape <strong>{step}</strong> / 4
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary next"
                    onClick={next}
                    disabled={submitting}
                  >
                    {step === totalSteps
                      ? submitting
                        ? 'Envoi…'
                        : "Envoyer l'inscription"
                      : 'Suivant'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {submitted && (
              <div className="success-screen active">
                <div className="success-icon">✓</div>
                <h2>
                  Inscription <em>enregistrée</em>.
                </h2>
                <p>
                  Votre dossier ({createdTeams.length} robot
                  {createdTeams.length > 1 ? 's' : ''}, {summary.eleves}) est
                  bien enregistré en base. Les robots ont reçu les
                  immatriculations suivantes :
                </p>
                {createdTeams.length > 0 && (
                  <div className="summary" style={{ margin: '16px auto 24px', maxWidth: 460 }}>
                    {createdTeams.map((t) => (
                      <div key={t.immatriculation} className="summary-row">
                        <span className="key">
                          {t.immatriculation}
                        </span>
                        <span className="val">{t.epreuve.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="success-id">
                  RÉFÉRENCE <strong>{refId}</strong>
                </div>
                <div className="success-actions">
                  <Link to="/reglement" className="btn btn-ghost">
                    Relire le règlement
                  </Link>
                  <Link to="/" className="btn btn-primary">
                    Retour à l'accueil
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </form>
        </main>
      </div>

      <FooterCompact />
    </>
  );
}
