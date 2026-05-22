import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';

type Epreuve = 'ligne' | 'formule' | 'design' | 'presentation' | 'sumo' | 'lv';

const EPREUVE_LABELS: Record<Epreuve, string> = {
  ligne: 'Suivi de ligne · Collèges',
  formule: 'Formule robot · Collèges',
  design: 'Design · Collèges',
  presentation: 'Présentation projet · Collèges',
  sumo: 'Sumo autonome · Lycées',
  lv: 'Présentation LV · Lycées',
};

const EPREUVE_OPTIONS: { value: Epreuve; num: string; title: string; desc: string }[] = [
  { value: 'ligne', num: '01 · Collèges', title: 'Suivi de ligne', desc: 'Tracé complexe, chrono, 6 bonus' },
  { value: 'formule', num: '02 · Collèges', title: 'Formule robot', desc: 'Course ovale à deux, 3 tours' },
  { value: 'design', num: '03 · Collèges', title: 'Design', desc: 'Ergonomie, originalité, affiche' },
  { value: 'presentation', num: '04 · Collèges', title: 'Présentation de projet', desc: '3 min chrono, schémas SysML' },
  { value: 'sumo', num: '05 · Lycées', title: 'Sumo autonome', desc: 'Dohyo 92 cm, 750 g max' },
  { value: 'lv', num: '06 · Lycées', title: 'Présentation en anglais', desc: '5 min + dossier en LV' },
];

const STEPS = [
  { num: '01', name: 'Établissement', desc: 'Identité du collège ou lycée' },
  { num: '02', name: 'Responsable', desc: 'Enseignant-référent' },
  { num: '03', name: 'Épreuve & robot', desc: "Choix d'épreuve et détails" },
  { num: '04', name: 'Équipe & validation', desc: 'Élèves et charte' },
];

type FormState = {
  etabNom: string;
  etabType: string;
  etabVille: string;
  etabCp: string;
  etabAdresse: string;
  etabUai: string;
  etabAcademie: string;
  respNom: string;
  respPrenom: string;
  respDisc: string;
  respTel: string;
  respMail: string;
  coNom: string;
  coMail: string;
  epreuve: Epreuve;
  robotNom: string;
  robotSponsor: string;
  robotCout: string;
  robotCarte: string;
  robotDescr: string;
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
  etabAdresse: '',
  etabUai: '',
  etabAcademie: 'Nancy-Metz',
  respNom: '',
  respPrenom: '',
  respDisc: 'Technologie',
  respTel: '',
  respMail: '',
  coNom: '',
  coMail: '',
  epreuve: 'ligne',
  robotNom: '',
  robotSponsor: '',
  robotCout: '',
  robotCarte: 'Arduino UNO',
  robotDescr: '',
  charte1: false,
  charte2: false,
  charte3: false,
  charte4: false,
};

type Student = { id: number; nom: string; prenom: string };

function scrollToForm() {
  const el = document.querySelector('.form-main');
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function InscriptionPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [students, setStudents] = useState<Student[]>([
    { id: 1, nom: '', prenom: '' },
    { id: 2, nom: '', prenom: '' },
    { id: 3, nom: '', prenom: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  const totalSteps = 4;

  useEffect(() => {
    if (step === 1 && !submitted) return;
    scrollToForm();
  }, [step, submitted]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((cur) => ({ ...cur, [key]: value }));
  };

  const next = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submit();
    }
  };

  const prev = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = () => {
    const id = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
    setRefId(`#TB2026-${id}`);
    setSubmitted(true);
  };

  const addStudent = () => {
    if (students.length >= 5) return;
    setStudents((s) => [...s, { id: Date.now(), nom: '', prenom: '' }]);
  };

  const removeStudent = (id: number) => {
    if (students.length <= 1) return;
    setStudents((s) => s.filter((x) => x.id !== id));
  };

  const summary = useMemo(() => {
    const etab = form.etabNom || '-';
    const ville = form.etabVille ? ` · ${form.etabVille}` : '';
    const resp = `${form.respPrenom} ${form.respNom}`.trim() || '-';
    const robot = form.robotNom
      ? `${form.robotNom}${form.robotCout ? ` · ${form.robotCout}€` : ''}`
      : '-';
    const eleves = `${students.length} élève${students.length > 1 ? 's' : ''}`;
    return {
      etab: `${etab}${ville}`,
      resp,
      epreuve: EPREUVE_LABELS[form.epreuve],
      robot,
      eleves,
    };
  }, [form, students]);

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
          une <em>équipe.</em>
        </h1>
        <p>
          Quatre étapes, deux minutes. Votre établissement reçoit un mail de
          confirmation avec le numéro de dossier dans la foulée.
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
              Participation financière : <strong>50 €</strong> à régler à
              TechTic&amp;Co. Un seul robot par équipe, une seule épreuve.
            </p>
          </div>
        </aside>

        <main className="form-main">
          <form onSubmit={(e) => e.preventDefault()}>
            {!submitted && (
              <>
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
                  <div className="field-row single">
                    <div className="field">
                      <label htmlFor="etab-adresse">Adresse complète</label>
                      <input
                        type="text"
                        id="etab-adresse"
                        placeholder="Place de l'arc en ciel"
                        value={form.etabAdresse}
                        onChange={(e) => update('etabAdresse', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="etab-uai">Numéro UAI (RNE)</label>
                      <input
                        type="text"
                        id="etab-uai"
                        placeholder="0573456K"
                        value={form.etabUai}
                        onChange={(e) => update('etabUai', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="etab-academie">Académie</label>
                      <select
                        id="etab-academie"
                        value={form.etabAcademie}
                        onChange={(e) => update('etabAcademie', e.target.value)}
                      >
                        <option>Nancy-Metz</option>
                        <option>Strasbourg</option>
                        <option>Reims</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                </div>

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

                <div className={`form-section${step === 3 ? ' active' : ''}`}>
                  <div className="form-section-head">
                    <div className="form-section-eyebrow">// Étape 03 sur 04</div>
                    <h2>L'épreuve &amp; le robot.</h2>
                    <p>
                      Un robot ne peut participer qu'à une seule épreuve.
                      Choisissez avec soin - pas de changement après validation.
                    </p>
                  </div>

                  <div className="field-group-title">Épreuve choisie</div>
                  <div className="event-picker">
                    {EPREUVE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="event-pick">
                        <input
                          type="radio"
                          name="epreuve"
                          value={opt.value}
                          checked={form.epreuve === opt.value}
                          onChange={() => update('epreuve', opt.value)}
                        />
                        <div className="event-pick-card">
                          <div className="event-pick-num">{opt.num}</div>
                          <h4>{opt.title}</h4>
                          <p>{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="field-group-title">Identité du robot</div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="robot-nom">Nom du robot</label>
                      <input
                        type="text"
                        id="robot-nom"
                        placeholder="Colossus Mk-II"
                        value={form.robotNom}
                        onChange={(e) => update('robotNom', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="robot-sponsor">Sponsor éventuel</label>
                      <input
                        type="text"
                        id="robot-sponsor"
                        placeholder="-"
                        value={form.robotSponsor}
                        onChange={(e) => update('robotSponsor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="robot-cout">Coût estimé (€ HT)</label>
                      <input
                        type="number"
                        id="robot-cout"
                        placeholder="85"
                        max={100}
                        value={form.robotCout}
                        onChange={(e) => update('robotCout', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="robot-carte">Carte électronique</label>
                      <select
                        id="robot-carte"
                        value={form.robotCarte}
                        onChange={(e) => update('robotCarte', e.target.value)}
                      >
                        <option>Arduino UNO</option>
                        <option>Arduino Nano</option>
                        <option>ESP32</option>
                        <option>Raspberry Pi Pico</option>
                        <option>micro:bit</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-row single">
                    <div className="field">
                      <label htmlFor="robot-descr">
                        Description courte (démarche, originalité)
                      </label>
                      <textarea
                        id="robot-descr"
                        placeholder="Un robot inspiré de…"
                        value={form.robotDescr}
                        onChange={(e) => update('robotDescr', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={`form-section${step === 4 ? ' active' : ''}`}>
                  <div className="form-section-head">
                    <div className="form-section-eyebrow">// Étape 04 sur 04</div>
                    <h2>L'équipe &amp; la charte.</h2>
                    <p>
                      Jusqu'à 5 élèves par robot. Vérifiez les noms - ils
                      serviront pour les badges et le diplôme.
                    </p>
                  </div>

                  <div className="field-group-title">Élèves (1 à 5)</div>
                  <div className="students-grid">
                    {students.map((stu, i) => (
                      <div className="student-row" key={stu.id}>
                        <span className="num">{String(i + 1).padStart(2, '0')}</span>
                        <input
                          type="text"
                          placeholder="Nom"
                          value={stu.nom}
                          onChange={(e) =>
                            setStudents((cur) =>
                              cur.map((x) =>
                                x.id === stu.id ? { ...x, nom: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="Prénom · Classe"
                          value={stu.prenom}
                          onChange={(e) =>
                            setStudents((cur) =>
                              cur.map((x) =>
                                x.id === stu.id ? { ...x, prenom: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <button
                          type="button"
                          aria-label="Supprimer"
                          onClick={() => removeStudent(stu.id)}
                        >
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M6 6l12 12M6 18L18 6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="add-student"
                    onClick={addStudent}
                    disabled={students.length >= 5}
                  >
                    + Ajouter un élève
                  </button>

                  <div className="field-group-title">Charte du concours</div>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.charte1}
                      onChange={(e) => update('charte1', e.target.checked)}
                    />
                    <div className="check-txt">
                      <strong>Je certifie</strong> que l'étude, la conception, la
                      réalisation, la mise au point et la programmation du robot
                      ont été menées <strong>par les élèves uniquement</strong>,
                      conformément au règlement général du concours.
                    </div>
                  </label>

                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.charte2}
                      onChange={(e) => update('charte2', e.target.checked)}
                    />
                    <div className="check-txt">
                      J'accepte que le robot respecte{' '}
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
                      <span className="key">Épreuve</span>
                      <span className="val">{summary.epreuve}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Robot</span>
                      <span className="val">{summary.robot}</span>
                    </div>
                    <div className="summary-row">
                      <span className="key">Élèves</span>
                      <span className="val">{summary.eleves}</span>
                    </div>
                  </div>
                </div>

                <div className="form-nav">
                  <button
                    type="button"
                    className="btn btn-ghost prev"
                    onClick={prev}
                    disabled={step === 1}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 12H5M11 6L5 12l6 6" />
                    </svg>
                    Précédent
                  </button>
                  <div className="step-indicator">
                    Étape <strong>{step}</strong> / 4
                  </div>
                  <button type="button" className="btn btn-primary next" onClick={next}>
                    {step === totalSteps ? "Envoyer l'inscription" : 'Suivant'}
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
                  Inscription <em>envoyée</em>.
                </h2>
                <p>
                  Votre dossier part dans la file d'attente. Un e-mail de
                  confirmation vous sera envoyé sous 48h, et le responsable du
                  concours (Arnaud Roesslinger) vous recontactera avant le 20
                  décembre.
                </p>
                <div className="success-id">
                  DOSSIER <strong>{refId}</strong>
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
