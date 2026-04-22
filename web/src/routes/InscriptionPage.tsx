import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function InscriptionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [students, setStudents] = useState([{ id: 1 }, { id: 2 }, { id: 3 }]);
  
  // Form state for summary
  const [etabNom, setEtabNom] = useState('');
  const [etabVille, setEtabVille] = useState('');
  const [respNom, setRespNom] = useState('');
  const [respPrenom, setRespPrenom] = useState('');
  const [epreuve, setEpreuve] = useState('ligne');
  const [robotNom, setRobotNom] = useState('');
  const [robotCout, setRobotCout] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: document.querySelector('.form-main')?.getBoundingClientRect().top! + window.scrollY - 80, behavior: 'smooth' });
    } else {
      submitForm();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: document.querySelector('.form-main')?.getBoundingClientRect().top! + window.scrollY - 80, behavior: 'smooth' });
    }
  };

  const addStudent = () => {
    if (students.length >= 5) return;
    setStudents([...students, { id: Date.now() }]);
  };

  const removeStudent = (idToRemove: number) => {
    if (students.length <= 1) return;
    setStudents(students.filter(s => s.id !== idToRemove));
  };

  const submitForm = () => {
    const id = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
    setRefId('#TB2026-' + id);
    setSubmitted(true);
    window.scrollTo({ top: document.querySelector('.form-main')?.getBoundingClientRect().top! + window.scrollY - 80, behavior: 'smooth' });
  };

  const epreuveLabels: Record<string, string> = {
    ligne: 'Suivi de ligne · Collèges',
    formule: 'Formule robot · Collèges',
    design: 'Design · Collèges',
    presentation: 'Présentation projet · Collèges',
    sumo: 'Sumo autonome · Lycées',
    lv: 'Présentation LV · Lycées',
  };

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-dot"></span>
            <span>TECHNOBOT</span>
            <span className="brand-tag">/ 2026</span>
          </Link>
          <div className="nav-links">
            <Link to="/">Accueil</Link>
            <Link to="/reglement">Règlement</Link>
            <Link to="/scoreboard">Scoreboard</Link>
            <Link to="/inscription" className="nav-cta active">S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>Inscription</span>
        </div>
        <h1>Inscrire<br />une <em>équipe.</em></h1>
        <p>Quatre étapes, deux minutes. Votre établissement reçoit un mail de confirmation avec le numéro de dossier dans la foulée.</p>
      </header>

      {/* FORM LAYOUT */}
      <div className="form-layout">

        {/* STEPPER */}
        <aside className="stepper" id="stepper">
          <div className="stepper-label">// Étapes</div>

          <div className={`step ${currentStep === 1 && !submitted ? 'active' : ''} ${currentStep > 1 || submitted ? 'done' : ''}`} onClick={() => !submitted && setCurrentStep(1)}>
            <div className="step-num"><span>01</span></div>
            <div>
              <div className="step-name">Établissement</div>
              <div className="step-desc">Identité du collège ou lycée</div>
            </div>
          </div>

          <div className={`step ${currentStep === 2 && !submitted ? 'active' : ''} ${currentStep > 2 || submitted ? 'done' : ''}`} onClick={() => !submitted && setCurrentStep(2)}>
            <div className="step-num"><span>02</span></div>
            <div>
              <div className="step-name">Responsable</div>
              <div className="step-desc">Enseignant-référent</div>
            </div>
          </div>

          <div className={`step ${currentStep === 3 && !submitted ? 'active' : ''} ${currentStep > 3 || submitted ? 'done' : ''}`} onClick={() => !submitted && setCurrentStep(3)}>
            <div className="step-num"><span>03</span></div>
            <div>
              <div className="step-name">Épreuve &amp; robot</div>
              <div className="step-desc">Choix d'épreuve et détails</div>
            </div>
          </div>

          <div className={`step ${currentStep === 4 && !submitted ? 'active' : ''} ${submitted ? 'done' : ''}`} onClick={() => !submitted && setCurrentStep(4)}>
            <div className="step-num"><span>04</span></div>
            <div>
              <div className="step-name">Équipe &amp; validation</div>
              <div className="step-desc">Élèves et charte</div>
            </div>
          </div>

          <div className="sidebar-note">
            <h4>→ Rappel</h4>
            <p>Les inscriptions closent le <strong>12 décembre 2025</strong>. Participation financière : <strong>50
                €</strong> à régler à TechTic&amp;Co. Un seul robot par équipe, une seule épreuve.</p>
          </div>
        </aside>

        {/* FORM */}
        <main className="form-main">
          <form id="technobot-form" onSubmit={(e) => e.preventDefault()}>

            {/* STEP 1 - Établissement */}
            <div className={`form-section ${currentStep === 1 && !submitted ? 'active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 01 sur 04</div>
                <h2>L'établissement.</h2>
                <p>On a besoin de vos infos officielles pour le dossier et la facture de participation.</p>
              </div>

              <div className="field-group-title">Identité</div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="etab-nom">Nom de l'établissement</label>
                  <input type="text" id="etab-nom" value={etabNom} onChange={e => setEtabNom(e.target.value)} placeholder="Collège Jean-Mermoz" />
                </div>
                <div className="field">
                  <label htmlFor="etab-type">Type</label>
                  <select id="etab-type">
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
                  <input type="text" id="etab-ville" value={etabVille} onChange={e => setEtabVille(e.target.value)} placeholder="Yutz" />
                </div>
                <div className="field">
                  <label htmlFor="etab-cp">Code postal</label>
                  <input type="text" id="etab-cp" placeholder="57970" />
                </div>
              </div>
              <div className="field-row single">
                <div className="field">
                  <label htmlFor="etab-adresse">Adresse complète</label>
                  <input type="text" id="etab-adresse" placeholder="Place de l'arc en ciel" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="etab-uai">Numéro UAI (RNE)</label>
                  <input type="text" id="etab-uai" placeholder="0573456K" />
                </div>
                <div className="field">
                  <label htmlFor="etab-academie">Académie</label>
                  <select id="etab-academie">
                    <option>Nancy-Metz</option>
                    <option>Strasbourg</option>
                    <option>Reims</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 2 - Responsable */}
            <div className={`form-section ${currentStep === 2 && !submitted ? 'active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 02 sur 04</div>
                <h2>Le responsable pédagogique.</h2>
                <p>C'est la personne-référente qui signera la charte et recevra toutes les communications.</p>
              </div>

              <div className="field-group-title">Enseignant-référent</div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="resp-nom">Nom</label>
                  <input type="text" id="resp-nom" value={respNom} onChange={e => setRespNom(e.target.value)} placeholder="Durand" />
                </div>
                <div className="field">
                  <label htmlFor="resp-prenom">Prénom</label>
                  <input type="text" id="resp-prenom" value={respPrenom} onChange={e => setRespPrenom(e.target.value)} placeholder="Marie" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="resp-disc">Discipline</label>
                  <select id="resp-disc">
                    <option>Technologie</option>
                    <option>Sciences de l'ingénieur</option>
                    <option>STI2D</option>
                    <option>Enseignement professionnel</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="resp-tel">Téléphone direct</label>
                  <input type="tel" id="resp-tel" placeholder="06 __ __ __ __" />
                </div>
              </div>
              <div className="field-row single">
                <div className="field">
                  <label htmlFor="resp-mail">E-mail académique</label>
                  <input type="email" id="resp-mail" placeholder="marie.durand@ac-nancy-metz.fr" />
                </div>
              </div>

              <div className="field-group-title">Co-responsable (optionnel)</div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="co-nom">Nom &amp; prénom</label>
                  <input type="text" id="co-nom" placeholder="Thomas Leroy" />
                </div>
                <div className="field">
                  <label htmlFor="co-mail">E-mail</label>
                  <input type="email" id="co-mail" placeholder="thomas.leroy@ac-nancy-metz.fr" />
                </div>
              </div>
            </div>

            {/* STEP 3 - Épreuve & robot */}
            <div className={`form-section ${currentStep === 3 && !submitted ? 'active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 03 sur 04</div>
                <h2>L'épreuve &amp; le robot.</h2>
                <p>Un robot ne peut participer qu'à une seule épreuve. Choisissez avec soin - pas de changement après validation.</p>
              </div>

              <div className="field-group-title">Épreuve choisie</div>
              <div className="event-picker">
                <label className="event-pick">
                  <input type="radio" name="epreuve" value="ligne" checked={epreuve === 'ligne'} onChange={() => setEpreuve('ligne')} />
                  <div className="event-pick-card">
                    <div className="event-pick-num">01 · Collèges</div>
                    <h4>Suivi de ligne</h4>
                    <p>Tracé complexe, chrono, 6 bonus</p>
                  </div>
                </label>
                <label className="event-pick">
                  <input type="radio" name="epreuve" value="formule" checked={epreuve === 'formule'} onChange={() => setEpreuve('formule')} />
                  <div className="event-pick-card">
                    <div className="event-pick-num">02 · Collèges</div>
                    <h4>Formule robot</h4>
                    <p>Course ovale à deux, 3 tours</p>
                  </div>
                </label>
                <label className="event-pick">
                  <input type="radio" name="epreuve" value="design" checked={epreuve === 'design'} onChange={() => setEpreuve('design')} />
                  <div className="event-pick-card">
                    <div className="event-pick-num">03 · Collèges</div>
                    <h4>Design</h4>
                    <p>Ergonomie, originalité, affiche</p>
                  </div>
                </label>
                <label className="event-pick">
                  <input type="radio" name="epreuve" value="presentation" checked={epreuve === 'presentation'} onChange={() => setEpreuve('presentation')} />
                  <div className="event-pick-card">
                    <div className="event-pick-num">04 · Collèges</div>
                    <h4>Présentation de projet</h4>
                    <p>3 min chrono, schémas SysML</p>
                  </div>
                </label>
                <label className="event-pick">
                  <input type="radio" name="epreuve" value="sumo" checked={epreuve === 'sumo'} onChange={() => setEpreuve('sumo')} />
                  <div className="event-pick-card">
                    <div className="event-pick-num">05 · Lycées</div>
                    <h4>Sumo autonome</h4>
                    <p>Dohyo 92 cm, 750 g max</p>
                  </div>
                </label>
                <label className="event-pick">
                  <input type="radio" name="epreuve" value="lv" checked={epreuve === 'lv'} onChange={() => setEpreuve('lv')} />
                  <div className="event-pick-card">
                    <div className="event-pick-num">06 · Lycées</div>
                    <h4>Présentation en anglais</h4>
                    <p>5 min + dossier en LV</p>
                  </div>
                </label>
              </div>

              <div className="field-group-title">Identité du robot</div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="robot-nom">Nom du robot</label>
                  <input type="text" id="robot-nom" value={robotNom} onChange={e => setRobotNom(e.target.value)} placeholder="Colossus Mk-II" />
                </div>
                <div className="field">
                  <label htmlFor="robot-sponsor">Sponsor éventuel</label>
                  <input type="text" id="robot-sponsor" placeholder="-" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="robot-cout">Coût estimé (€ HT)</label>
                  <input type="number" id="robot-cout" value={robotCout} onChange={e => setRobotCout(e.target.value)} placeholder="85" max="100" />
                </div>
                <div className="field">
                  <label htmlFor="robot-carte">Carte électronique</label>
                  <select id="robot-carte">
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
                  <label htmlFor="robot-descr">Description courte (démarche, originalité)</label>
                  <textarea id="robot-descr" placeholder="Un robot inspiré de…"></textarea>
                </div>
              </div>
            </div>

            {/* STEP 4 - Équipe + charte */}
            <div className={`form-section ${currentStep === 4 && !submitted ? 'active' : ''}`}>
              <div className="form-section-head">
                <div className="form-section-eyebrow">// Étape 04 sur 04</div>
                <h2>L'équipe &amp; la charte.</h2>
                <p>Jusqu'à 5 élèves par robot. Vérifiez les noms - ils serviront pour les badges et le diplôme.</p>
              </div>

              <div className="field-group-title">Élèves (1 à 5)</div>
              <div className="students-grid">
                {students.map((student, index) => (
                  <div className="student-row" key={student.id}>
                    <span className="num">{String(index + 1).padStart(2, '0')}</span>
                    <input type="text" placeholder="Nom" />
                    <input type="text" placeholder="Prénom · Classe" />
                    <button type="button" aria-label="Supprimer" onClick={() => removeStudent(student.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 6l12 12M6 18L18 6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="add-student" onClick={addStudent}>+ Ajouter un élève</button>

              <div className="field-group-title">Charte du concours</div>

              <label className="check">
                <input type="checkbox" />
                <div className="check-txt">
                  <strong>Je certifie</strong> que l'étude, la conception, la réalisation, la mise au point et la
                  programmation du robot ont été menées <strong>par les élèves uniquement</strong>, conformément au
                  règlement général du concours.
                </div>
              </label>

              <label className="check">
                <input type="checkbox" />
                <div className="check-txt">
                  J'accepte que le robot respecte <strong>les dimensions et la masse imposées</strong>, et que le coût total
                  reste <strong>inférieur à 100 € HT</strong> (justificatifs disponibles sur demande).
                </div>
              </label>

              <label className="check">
                <input type="checkbox" />
                <div className="check-txt">
                  J'accepte les prises de vue photos et vidéos réalisées pendant l'événement dans le cadre de la
                  <strong> communication TECHNOBOT</strong> (site, réseaux sociaux, presse locale).
                </div>
              </label>

              <label className="check">
                <input type="checkbox" />
                <div className="check-txt">
                  L'établissement s'engage à verser la <strong>participation de 50 €</strong> à l'association TechTic&amp;Co
                  avant le 15 mai 2026.
                </div>
              </label>

              <div className="summary" style={{ marginTop: 28 }}>
                <div className="summary-row"><span className="key">Établissement</span><span className="val">{etabNom || '-'}{etabVille ? ` · ${etabVille}` : ''}</span></div>
                <div className="summary-row"><span className="key">Responsable</span><span className="val">{(respPrenom + ' ' + respNom).trim() || '-'}</span></div>
                <div className="summary-row"><span className="key">Épreuve</span><span className="val">{epreuveLabels[epreuve] || '-'}</span></div>
                <div className="summary-row"><span className="key">Robot</span><span className="val">{robotNom ? `${robotNom}${robotCout ? ` · ${robotCout}€` : ''}` : '-'}</span></div>
                <div className="summary-row"><span className="key">Élèves</span><span className="val">{students.length} élève{students.length > 1 ? 's' : ''}</span></div>
              </div>
            </div>

            {/* SUCCESS SCREEN */}
            <div className={`success-screen ${submitted ? 'active' : ''}`}>
              <div className="success-icon">✓</div>
              <h2>Inscription <em>envoyée</em>.</h2>
              <p>Votre dossier part dans la file d'attente. Un e-mail de confirmation vous sera envoyé sous 48h, et le responsable du concours (Arnaud Roesslinger) vous recontactera avant le 20 décembre.</p>
              <div className="success-id">DOSSIER <strong>{refId}</strong></div>
              <div className="success-actions">
                <Link to="/reglement" className="btn btn-ghost">Relire le règlement</Link>
                <Link to="/" className="btn btn-primary">
                  Retour à l'accueil
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* FORM NAVIGATION */}
            {!submitted && (
              <div className="form-nav">
                <button type="button" className="btn btn-ghost prev" onClick={prevStep} disabled={currentStep === 1}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M11 6L5 12l6 6" />
                  </svg>
                  Précédent
                </button>
                <div className="step-indicator">Étape <strong>{currentStep}</strong> / 4</div>
                <button type="button" className="btn btn-primary next" onClick={nextStep}>
                  {currentStep === totalSteps ? (
                    <>Envoyer l'inscription <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
                  ) : (
                    <>Suivant <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
                  )}
                </button>
              </div>
            )}
          </form>
        </main>
      </div>

      <footer>
        <div className="foot-inner">
          <div className="b">TECHNO<span className="red">BOT</span> · 2026</div>
          <div className="links">
            <Link to="/">Accueil</Link>
            <Link to="/reglement">Règlement</Link>
            <Link to="/inscription">Inscription</Link>
            <Link to="/scoreboard">Scoreboard</Link>
          </div>
          <div className="meta">© 2026 Tech Tic &amp; Co · Marque déposée</div>
        </div>
      </footer>
    </>
  );
}
