import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  useEffect(() => {
    // ========== Countdown ==========
    const target = new Date('2026-06-05T09:30:00+02:00').getTime();
    const el = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs'),
      inline: document.getElementById('cd-days-inline'),
    };
    const pad = (n: number) => String(n).padStart(2, '0');
    
    let intervalId: any;
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        if (el.days) el.days.textContent = '00';
        if (el.hours) el.hours.textContent = '00';
        if (el.mins) el.mins.textContent = '00';
        if (el.secs) el.secs.textContent = '00';
        if (el.inline) el.inline.textContent = '0';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (el.days) el.days.textContent = pad(d);
      if (el.hours) el.hours.textContent = pad(h);
      if (el.mins) el.mins.textContent = pad(m);
      if (el.secs) el.secs.textContent = pad(s);
      if (el.inline) el.inline.textContent = String(d);
    }
    tick();
    intervalId = setInterval(tick, 1000);

    // ========== Events tabs ==========
    const handleTabClick = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const target = btn.dataset.tab;
      document.querySelectorAll('.events-tabs button').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.event-panel').forEach(p => {
        p.classList.toggle('active', p.id === 'panel-' + target);
      });
    };

    document.querySelectorAll('.events-tabs button').forEach(btn => {
      btn.addEventListener('click', handleTabClick as EventListener);
    });

    // ========== Scroll reveal ==========
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.reveal').forEach(element => io.observe(element));

    return () => {
      clearInterval(intervalId);
      document.querySelectorAll('.events-tabs button').forEach(btn => {
        btn.removeEventListener('click', handleTabClick as EventListener);
      });
      io.disconnect();
    };
  }, []);

  return (
    <>
      {/* ============ NAV ============ */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-dot"></span>
            <span>TECHNOBOT</span>
            <span className="brand-tag">/ 2026</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="active">Accueil</Link>
            <Link to="/reglement">Règlement</Link>
            <Link to="/scoreboard">Scoreboard</Link>
            <Link to="/inscription" className="nav-cta">S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header className="hero">
        <div className="hero-meta">
          <span>ÉDITION 15</span>
          <span className="sep"></span>
          <span>YUTZ · MOSELLE · 57</span>
          <span className="sep"></span>
          <span>05.06.2026</span>
        </div>

        <h1>Tournoi<br />de robots<br /><span className="accent">autonomes.</span></h1>

        <p className="hero-lead">
          Collèges et lycées de l'Académie <strong>Nancy-Metz</strong> s'affrontent le temps d'une journée.
          Suivi de ligne, sumo, formule robot, design. <strong>Une seule finale</strong>, au gymnase Mermoz.
        </p>

        <div className="hero-actions">
          <Link to="/inscription" className="btn btn-primary">
            Inscrire une équipe
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link to="/reglement" className="btn btn-ghost">Lire le règlement</Link>
        </div>

        <div className="hero-decor" aria-hidden="true">
          <svg viewBox="0 0 260 260">
            <g stroke="#0E0E10" strokeWidth="1" fill="none">
              <circle cx="130" cy="130" r="125" />
              <circle cx="130" cy="130" r="95" />
              <circle cx="130" cy="130" r="65" />
              <circle cx="130" cy="130" r="35" />
            </g>
            <g stroke="#0E0E10" strokeWidth="1">
              <line x1="130" y1="5" x2="130" y2="255" />
              <line x1="5" y1="130" x2="255" y2="130" />
            </g>
            <circle cx="130" cy="130" r="8" fill="#EF3E36" />
            <circle cx="130" cy="130" r="4" fill="#FAF7F0" />
            <g fontFamily="JetBrains Mono" fontSize="9" fill="#6B6B72">
              <text x="132" y="18">N · 0°</text>
              <text x="240" y="134">E · 90°</text>
              <text x="132" y="252">S · 180°</text>
              <text x="8" y="134">O · 270°</text>
            </g>
          </svg>
        </div>
      </header>

      {/* ============ COUNTDOWN ============ */}
      <section className="countdown-wrap">
        <div className="countdown-card reveal">
          <div>
            <div className="cd-label">// Finale · J-<span id="cd-days-inline">-</span></div>
            <h2 className="cd-title">Vendredi 5 juin 2026<br />Gymnase Mermoz, Yutz.</h2>
            <p className="cd-sub">Accueil des équipes dès 8h00 · Premières épreuves à 9h30</p>
          </div>
          <div className="countdown" id="countdown" role="timer" aria-live="polite">
            <div className="cd-unit"><span className="cd-num" id="cd-days">00</span>
              <div className="cd-txt">jours</div>
            </div>
            <div className="cd-unit"><span className="cd-num" id="cd-hours">00</span>
              <div className="cd-txt">heures</div>
            </div>
            <div className="cd-unit"><span className="cd-num" id="cd-mins">00</span>
              <div className="cd-txt">min</div>
            </div>
            <div className="cd-unit"><span className="cd-num" id="cd-secs">00</span>
              <div className="cd-txt">sec</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="about">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="section-eyebrow">// À propos</div>
              <h2 className="section-title">Un concours entre élèves. Pas une démo de kits.</h2>
            </div>
            <p className="section-note">Depuis 2012, TECHNOBOT réunit collégiens et lycéens autour d'épreuves qui demandent
              vraiment de concevoir, souder, programmer - et défendre son projet.</p>
          </div>

          <div className="about-grid">
            <p className="about-text reveal">
              Les élèves sont <em>les seuls</em> acteurs de l'étude, la conception, la réalisation et la programmation.
              Un robot, une équipe, une épreuve. <em>Règle d'or :</em> si un prof ou un kit l'a fait, le robot est
              disqualifié.
            </p>
            <div className="stat-col">
              <div className="stat reveal">
                <div className="stat-num">15</div>
                <div className="stat-label">Établissements engagés</div>
              </div>
              <div className="stat reveal">
                <div className="stat-num">40+</div>
                <div className="stat-label">Robots attendus en lice</div>
              </div>
              <div className="stat reveal">
                <div className="stat-num">6</div>
                <div className="stat-label">Épreuves distinctes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EVENTS ============ */}
      <section className="events">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="section-eyebrow">// Épreuves</div>
              <h2 className="section-title">Six manières de gagner, zéro moyen de tricher.</h2>
            </div>
            <p className="section-note">Un contrôle technique ouvre la journée. Des vérifications inopinées peuvent intervenir à
              tout moment. Les finalistes reprogramment en parc fermé.</p>
          </div>

          <div className="events-tabs reveal" role="tablist">
            <button className="active" data-tab="collège" role="tab">Collèges</button>
            <button data-tab="lycée" role="tab">Lycées</button>
          </div>

          {/* Collèges */}
          <div className="events-grid event-panel active" id="panel-collège">
            <article className="event reveal">
              <div className="event-num">01 / Collèges</div>
              <h3>Suivi de ligne</h3>
              <p>Un tracé noir sur fond blanc, 9 mètres, et le chrono qui tourne. Plus six pistes bonus (angle aigu,
                intersection, interruptions) pour les plus malins.</p>
              <div className="event-tags">
                <span className="event-tag">100 pts distance</span>
                <span className="event-tag ghost">500/temps</span>
                <span className="event-tag ghost">6 bonus</span>
              </div>
              <div className="event-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E0E10"
                  strokeWidth="2">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg></div>
            </article>

            <article className="event reveal">
              <div className="event-num">02 / Collèges</div>
              <h3>Formule robot</h3>
              <p>Course de vitesse à deux, ovale, trois tours. Le premier à boucler ou à rattraper l'adversaire l'emporte.
                Les lignes rouges, c'est la sortie.</p>
              <div className="event-tags">
                <span className="event-tag red">1v1</span>
                <span className="event-tag ghost">3 tours</span>
                <span className="event-tag ghost">3 min max</span>
              </div>
              <div className="event-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E0E10"
                  strokeWidth="2">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg></div>
            </article>

            <article className="event reveal">
              <div className="event-num">03 / Collèges</div>
              <h3>Design</h3>
              <p>Notation sur 120 : ergonomie, homogénéité, œuvre originale, qualité de l'affiche. Bonus 10 pts si le robot
                suit une piste ovale, 10 pts s'il est connecté.</p>
              <div className="event-tags">
                <span className="event-tag">/ 120 pts</span>
                <span className="event-tag ghost">Jury art-plastiques</span>
                <span className="event-tag ghost">Affiche A3</span>
              </div>
              <div className="event-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E0E10"
                  strokeWidth="2">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg></div>
            </article>

            <article className="event reveal">
              <div className="event-num">04 / Collèges</div>
              <h3>Présentation de projet</h3>
              <p>Trois minutes, un diaporama, des schémas SysML. Aisance, langue, justesse technique. Après trois minutes
                exactes, le micro se coupe.</p>
              <div className="event-tags">
                <span className="event-tag">/ 90 pts</span>
                <span className="event-tag ghost">3 min strict</span>
                <span className="event-tag ghost">SysML</span>
              </div>
              <div className="event-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E0E10"
                  strokeWidth="2">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg></div>
            </article>
          </div>

          {/* Lycées */}
          <div className="events-grid event-panel" id="panel-lycée">
            <article className="event reveal">
              <div className="event-num">05 / Lycées</div>
              <h3>Sumo autonome</h3>
              <p>Deux robots, un Dohyo de 92 cm. Expulser l'adversaire ou marquer au Yuko. Trois rencontres de trois
                minutes. Position de départ tirée au sort.</p>
              <div className="event-tags">
                <span className="event-tag red">160×160 mm</span>
                <span className="event-tag">750 g max</span>
                <span className="event-tag ghost">Best of 3</span>
              </div>
              <div className="event-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E0E10"
                  strokeWidth="2">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg></div>
            </article>

            <article className="event reveal">
              <div className="event-num">06 / Lycées</div>
              <h3>Présentation en anglais</h3>
              <p>Cinq minutes face à un jury bilingue, plus trois minutes d'interrogation technique. Dossier de 5 à 10 pages
                en LV, pitch écrit à déposer à l'arrivée.</p>
              <div className="event-tags">
                <span className="event-tag">/ 150 pts</span>
                <span className="event-tag ghost">Anglais</span>
                <span className="event-tag ghost">Dossier 5-10p</span>
              </div>
              <div className="event-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E0E10"
                  strokeWidth="2">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg></div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ TIMELINE ============ */}
      <section className="timeline">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="section-eyebrow">// Calendrier</div>
              <h2 className="section-title">Les dates à ne pas rater.</h2>
            </div>
            <p className="section-note">Tout est calé sur la finale du 5 juin. Les retards d'inscription ne passent pas.</p>
          </div>

          <div className="tl-list reveal">
            <div className="tl-item past">
              <div className="tl-date">12 DÉC 2025</div>
              <div className="tl-label">Clôture des inscriptions</div>
              <div className="tl-desc">Date limite pour remonter une fiche à Arnaud ROESSLINGER.</div>
            </div>
            <div className="tl-item current">
              <div className="tl-date">AVR – MAI 2026</div>
              <div className="tl-label">Qualifications</div>
              <div className="tl-desc">Manches organisées dans toute l'Académie selon inscriptions.</div>
            </div>
            <div className="tl-item">
              <div className="tl-date">JEU 4 JUIN 2026</div>
              <div className="tl-label">Contrôle technique</div>
              <div className="tl-desc">Vérification des robots, dimensions, masse, coût max 100€.</div>
            </div>
            <div className="tl-item">
              <div className="tl-date">VEN 5 JUIN 2026</div>
              <div className="tl-label">Finale - Gymnase Mermoz</div>
              <div className="tl-desc">Ouverture au public. Remise des trophées TECHNOBOT.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOCATION ============ */}
      <section className="location">
        <div className="container">
          <div className="location-grid">
            <div className="reveal">
              <div className="section-eyebrow">// Venir sur place</div>
              <h2 className="location-title">Gymnase Jean&#8209;Mermoz<br />à Yutz.</h2>
              <div className="location-addr">
                <span className="line">→ ADRESSE</span>
                <span>Place de l'arc en ciel</span>
                <span>57970 Yutz</span>
                <span>Moselle · France</span>
              </div>
              <div className="location-addr">
                <span className="line">→ ACCÈS</span>
                <span>Gare Thionville · 10 min en bus</span>
                <span>Parking gratuit sur place</span>
                <span>Entrée libre le jour de la finale</span>
              </div>
            </div>
            <div className="map-svg reveal">
              <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                {/* Grid background */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E3DFD6" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="300" fill="url(#grid)" />

                {/* Roads */}
                <path d="M 0 180 L 400 160" stroke="#0E0E10" strokeWidth="6" strokeLinecap="round" />
                <path d="M 160 0 L 180 300" stroke="#0E0E10" strokeWidth="6" strokeLinecap="round" />
                <path d="M 280 300 L 260 120 L 400 100" stroke="#0E0E10" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="4 3" />

                {/* Buildings */}
                <rect x="40" y="60" width="60" height="50" fill="#E3DFD6" />
                <rect x="40" y="210" width="70" height="50" fill="#E3DFD6" />
                <rect x="220" y="30" width="40" height="60" fill="#E3DFD6" />
                <rect x="300" y="180" width="60" height="80" fill="#E3DFD6" />

                {/* Gymnase target */}
                <rect x="200" y="175" width="50" height="45" fill="#EF3E36" />
                <circle cx="225" cy="197" r="28" fill="none" stroke="#EF3E36" strokeWidth="1.5" opacity="0.4">
                  <animate attributeName="r" values="28;50;28" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Labels */}
                <g fontFamily="JetBrains Mono" fontSize="9" fill="#0E0E10">
                  <text x="255" y="210" fontWeight="700">MERMOZ</text>
                  <text x="255" y="222" fill="#6B6B72">57970 YUTZ</text>
                </g>
                <g fontFamily="JetBrains Mono" fontSize="8" fill="#6B6B72">
                  <text x="10" y="15">N 49°21'26"</text>
                  <text x="320" y="290">E 6°11'33"</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PARTNERS ============ */}
      <section className="partners">
        <div className="container">
          <div className="partners-label reveal">// ORGANISATEURS ET PARTENAIRES DE LA FINALE</div>
          <div className="partners-list reveal">
            <div className="partner-cell">TechTic<span className="red">&amp;</span>Co<small>Organisation</small></div>
            <div className="partner-cell">UIMM Lorraine<small>Fabrique de l'avenir</small></div>
            <div className="partner-cell">Collège J. Mermoz<small>Yutz</small></div>
            <div className="partner-cell">La Briquerie<small>Lycée des sciences</small></div>
            <div className="partner-cell">Académie<small>Nancy-Metz</small></div>
            <div className="partner-cell">Région Grand Est<small>+ Ville de Yutz</small></div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="foot-inner">
          <div>
            <div className="foot-brand">TECHNO<span className="red">BOT</span><br />· 2026 ·</div>
            <p style={{ marginTop: 24, color: 'rgba(245,241,233,0.6)', maxWidth: 400, fontSize: 14 }}>
              Marque déposée · Tech Tic &amp; Co. Adaptation du règlement IUT GEII de Nîmes / Université Montpellier II.
            </p>
          </div>
          <div className="foot-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/reglement">Règlement</Link></li>
              <li><Link to="/inscription">Inscription</Link></li>
              <li><Link to="/scoreboard">Scoreboard live</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <ul>
              <li>Arnaud Roesslinger</li>
              <li>Inscriptions scolaires</li>
              <li>Collège Jean-Mermoz, Yutz</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Tech Tic &amp; Co</span>
          <span id="year-tag">Édition N°15 · Yutz, Moselle</span>
        </div>
      </footer>
    </>
  );
}
