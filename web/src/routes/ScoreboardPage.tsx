import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------
   MOCK DATA
------------------------------------------------------------ */
const collegesData = [
  { name: "Yutz", sub: "Jean Mermoz", suivi: 143, formule: 132, design: 112, projet: 137, delta: +2 },
  { name: "Hombourg-Haut", sub: "Robert Schuman", suivi: 157, formule: 110, design: 98, projet: 122, delta: +1 },
  { name: "Thionville", sub: "Saint Pierre Chanel", suivi: 119, formule: 88, design: 94, projet: 131, delta: -2 },
  { name: "Fameck", sub: "Charles De Gaulle", suivi: 88, formule: 132, design: 76, projet: 105, delta: 0 },
  { name: "Mirecourt", sub: "Guy Dolmaire", suivi: 0, formule: 66, design: 88, projet: 99, delta: +3 },
  { name: "Aumetz", sub: "Lionel TERRAY", suivi: 106, formule: 44, design: 72, projet: 76, delta: -1 },
  { name: "Algrange", sub: "Saint Vincent de Paul", suivi: 88, formule: 22, design: 85, projet: 69, delta: 0 },
  { name: "Corcieux", sub: "Paul Emile Victor", suivi: 0, formule: 66, design: 68, projet: 97, delta: +1 },
  { name: "Sarreguemines", sub: "Fulrad", suivi: 72, formule: 10, design: 45, projet: 71, delta: -2 },
  { name: "Vaubecourt", sub: "Emilie du Châtelet", suivi: 0, formule: 9, design: 62, projet: 83, delta: 0 },
  { name: "Puttelange aux Lacs", sub: "Jean-Baptiste Éblé", suivi: 0, formule: 0, design: 55, projet: 66, delta: +1 },
];

const lyceesData = [
  { name: "HTL Innsbrück", sub: "Hayange", sumo: 280, pres: 132, robots: 3, delta: +1 },
  { name: "Mermoz Saint-Louis", sub: "Saint-Louis", sumo: 295, pres: 115, robots: 8, delta: -1 },
  { name: "La Briquerie", sub: "Thionville", sumo: 260, pres: 128, robots: 4, delta: 0 },
  { name: "Julie Daubié", sub: "Rombas", sumo: 240, pres: 98, robots: 5, delta: 0 },
];

const tickerItems = [
  ["SL01 HTL Innsbrück", "bat SL04 La Briquerie", "2-1 · Poule A"],
  ["Yutz Mermoz", "passage suivi de ligne", "en direct"],
  ["Record du jour", "4.20s sur piste principale", "Hombourg-Haut"],
  ["Poule C", "terminée · Mermoz SL14 premier", "6 Yuko"],
  ["Fameck De Gaulle", "157 pts en formule robot", "nouveau leader"],
  ["Contrôle technique", "27 robots validés", "3 en attente"],
  ["SL13 Mermoz", "qualifiée pour demi-finale", "poule B"],
  ["Présentation projet", "commence à 14h30", "salle annexe"],
  ["Design collèges", "Thionville bonus ovale", "+10 pts"],
];

function computeCollegeTotal(r: any) {
  return r.suivi + r.formule + r.design + r.projet;
}

function computeLyceeTotal(r: any) {
  return r.sumo + r.pres + r.robots * 10;
}

function DeltaHtml({ d }: { d: number }) {
  if (d > 0) return <span className="rank-delta up"><span className="rank-arrow">▲</span>{d}</span>;
  if (d < 0) return <span className="rank-delta down"><span className="rank-arrow">▼</span>{Math.abs(d)}</span>;
  return <span className="rank-delta eq">-</span>;
}

function FmtPts({ n }: { n: number }) {
  return n === 0 ? <span className="zero">0</span> : <>{n}</>;
}

export function ScoreboardPage() {
  const [activePanel, setActivePanel] = useState('colleges');
  const [rotPaused, setRotPaused] = useState(false);
  const [rotElapsed, setRotElapsed] = useState(0);
  const ROTATION_MS = 15000;
  
  const [clock, setClock] = useState(new Date());
  const [sumoT, setSumoT] = useState(134); // 02:14

  useEffect(() => {
    // Add class to body
    document.body.classList.add('scoreboard-page');
    return () => {
      document.body.classList.remove('scoreboard-page');
    };
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setClock(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    const sumoInterval = setInterval(() => {
      setSumoT(t => {
        if (t <= 0) return 180;
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(sumoInterval);
  }, []);

  useEffect(() => {
    let interval: any;
    if (!rotPaused) {
      interval = setInterval(() => {
        setRotElapsed(prev => {
          const next = prev + 100;
          if (next >= ROTATION_MS) {
            const panelOrder = ['colleges', 'lycees', 'current', 'sumo'];
            const nextIdx = (panelOrder.indexOf(activePanel) + 1) % panelOrder.length;
            setActivePanel(panelOrder[nextIdx]);
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [rotPaused, activePanel]);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      const totals = document.querySelectorAll('.rank-total');
      if (!totals.length) return;
      const t = totals[Math.floor(Math.random() * totals.length)];
      t.classList.remove('flash');
      // force reflow
      void (t as HTMLElement).offsetWidth;
      t.classList.add('flash');
    }, 4500);
    return () => clearInterval(flashInterval);
  }, []);

  const handleTabClick = (panel: string) => {
    setActivePanel(panel);
    setRotElapsed(0);
  };

  const handleRotToggle = () => {
    setRotPaused(!rotPaused);
    if (!rotPaused) {
      // It is going to pause
    } else {
      setRotElapsed(0);
    }
  };

  const rotPct = Math.min(100, (rotElapsed / ROTATION_MS) * 100);
  const rotCountdown = Math.max(0, Math.ceil((ROTATION_MS - rotElapsed) / 1000));

  const sortedColleges = [...collegesData]
    .map(r => ({ ...r, total: computeCollegeTotal(r) }))
    .sort((a, b) => b.total - a.total);

  const sortedLycees = [...lyceesData]
    .map(r => ({ ...r, total: computeLyceeTotal(r) }))
    .sort((a, b) => b.total - a.total);

  const pad = (n: number) => String(n).padStart(2, '0');
  const mm = pad(Math.floor(sumoT / 60));
  const ss = pad(sumoT % 60);

  return (
    <>
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
            <Link to="/scoreboard" className="active">Scoreboard</Link>
            <Link to="/inscription" className="nav-cta">S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* top status strip */}
      <div className="topstrip">
        <div className="topstrip-left">
          <span className="live-indicator"><span className="live-dot"></span>EN DIRECT</span>
          <span>Gymnase Mermoz · Yutz</span>
        </div>
        <div className="topstrip-center mono">
          <span id="clock-h">{pad(clock.getHours())}</span><span className="sep">:</span>
          <span id="clock-m">{pad(clock.getMinutes())}</span><span className="sep">:</span>
          <span id="clock-s">{pad(clock.getSeconds())}</span>
        </div>
        <div className="topstrip-right">
          <span>Édition 15</span>
          <span className="dash"></span>
          <span>05.06.2026</span>
        </div>
      </div>

      {/* tabs */}
      <div className="tabs-wrap">
        <div className="tabs">
          <button className={`tab ${activePanel === 'colleges' ? 'active' : ''}`} onClick={() => handleTabClick('colleges')}>
            <span>Classement Collèges</span>
            <span className="tab-num">01</span>
          </button>
          <button className={`tab ${activePanel === 'lycees' ? 'active' : ''}`} onClick={() => handleTabClick('lycees')}>
            <span>Classement Lycées</span>
            <span className="tab-num">02</span>
          </button>
          <button className={`tab ${activePanel === 'current' ? 'active' : ''}`} onClick={() => handleTabClick('current')}>
            <span>Épreuve en cours</span>
            <span className="tab-num">03</span>
          </button>
          <button className={`tab ${activePanel === 'sumo' ? 'active' : ''}`} onClick={() => handleTabClick('sumo')}>
            <span>Combats Sumo</span>
            <span className="tab-num">04</span>
          </button>
        </div>
      </div>

      {/* rotation progress */}
      <div className="rotation-bar">
        <div className={`rotation-bar-fill ${rotPaused ? 'paused' : ''}`} style={{ width: `${rotPct}%` }}></div>
      </div>
      <div className="rotation-ctrl">
        {rotPaused ? (
          <span id="rot-status">Rotation en pause · navigation manuelle</span>
        ) : (
          <span id="rot-status">Rotation auto · prochain onglet dans <span id="rot-countdown">{rotCountdown}</span>s</span>
        )}
        <button className={`rotation-btn ${!rotPaused ? 'active' : ''}`} onClick={handleRotToggle}>
          {rotPaused ? '▶ Reprendre' : '⏸ Pause'}
        </button>
      </div>

      <main>

        {/* ===== PANEL 1 : CLASSEMENT COLLÈGES ===== */}
        <section className={`panel ${activePanel === 'colleges' ? 'active' : ''}`}>
          <div className="panel-head">
            <div>
              <h1 className="panel-title">Classement général <em>collèges</em></h1>
              <div className="panel-sub">11 établissements · 4 épreuves · mis à jour il y a 12 s</div>
            </div>
            <div className="panel-meta">
              Trophée en jeu<br />
              <strong>↑ 524 pts</strong>
              tête de course
            </div>
          </div>

          <table className="rank-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Pos.</th>
                <th>Établissement</th>
                <th className="n">Suivi</th>
                <th className="n">Formule</th>
                <th className="n">Design</th>
                <th className="n">Projet</th>
                <th className="n" style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedColleges.map((r, i) => {
                const pos = i + 1;
                return (
                  <tr key={r.name} className={pos <= 3 ? 'top' : ''}>
                    <td className="rank-pos num">{pad(pos)}</td>
                    <td>
                      <div className="rank-name">{r.name}</div>
                      <div className="rank-loc">Collège {r.sub}</div>
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}><FmtPts n={r.suivi} /></td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}><FmtPts n={r.formule} /></td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}><FmtPts n={r.design} /></td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}><FmtPts n={r.projet} /></td>
                    <td className="rank-total num">{r.total}<DeltaHtml d={r.delta} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ===== PANEL 2 : CLASSEMENT LYCÉES ===== */}
        <section className={`panel ${activePanel === 'lycees' ? 'active' : ''}`}>
          <div className="panel-head">
            <div>
              <h1 className="panel-title">Classement <em>lycées</em></h1>
              <div className="panel-sub">4 lycées · Sumo autonome + présentation anglais · 20 robots</div>
            </div>
            <div className="panel-meta">
              Leader provisoire<br />
              <strong>HTL Innsbrück</strong>
              496 pts cumulés
            </div>
          </div>

          <table className="rank-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Pos.</th>
                <th>Lycée</th>
                <th className="n">Sumo</th>
                <th className="n">Prés. LV</th>
                <th className="n">Robots</th>
                <th className="n" style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedLycees.map((r, i) => {
                const pos = i + 1;
                return (
                  <tr key={r.name} className={pos <= 3 ? 'top' : ''}>
                    <td className="rank-pos num">{pad(pos)}</td>
                    <td>
                      <div className="rank-name">{r.name}</div>
                      <div className="rank-loc">Lycée · {r.sub}</div>
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>{r.sumo}</td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>{r.pres}</td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>{r.robots}</td>
                    <td className="rank-total num">{r.total}<DeltaHtml d={r.delta} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ===== PANEL 3 : ÉPREUVE EN COURS ===== */}
        <section className={`panel ${activePanel === 'current' ? 'active' : ''}`}>
          <div className="current-hero">
            <div className="current-hero-tag">
              <span className="live-dot"></span>
              Piste 1 · Salle principale · en cours
            </div>
            <h1 className="current-hero-title">Suivi de <em>ligne</em> - collèges</h1>
            <p className="current-hero-sub">
              Chaque robot tente de parcourir le tracé principal de 9 m. Les 6 pistes bonus (angles, croisements,
              interruptions) donnent 5 points supplémentaires chacune.
            </p>

            <div className="current-stats">
              <div className="current-stat">
                <div className="current-stat-val num">08</div>
                <div className="current-stat-lbl">Robots passés</div>
              </div>
              <div className="current-stat">
                <div className="current-stat-val num">04</div>
                <div className="current-stat-lbl">En attente</div>
              </div>
              <div className="current-stat">
                <div className="current-stat-val num">157</div>
                <div className="current-stat-lbl">Meilleur score</div>
              </div>
              <div className="current-stat">
                <div className="current-stat-val num">4.2<span style={{ fontSize: 22 }}>s</span></div>
                <div className="current-stat-lbl">Temps record</div>
              </div>
            </div>
          </div>

          <div className="current-list">
            <div>
              <div className="current-col-title">Piste 1 - Planning du jour</div>

              <div className="current-row done">
                <div className="current-time">10:30</div>
                <div>
                  <div className="current-team">Thionville - Saint Pierre Chanel</div>
                  <div className="current-immat">SL04 · terminé</div>
                </div>
                <div className="current-result done">143 pts</div>
              </div>

              <div className="current-row done">
                <div className="current-time">10:45</div>
                <div>
                  <div className="current-team">Fameck - Charles De Gaulle</div>
                  <div className="current-immat">SL06 · terminé</div>
                </div>
                <div className="current-result done">119 pts</div>
              </div>

              <div className="current-row done">
                <div className="current-time">11:00</div>
                <div>
                  <div className="current-team">Hombourg-Haut - Robert Schuman</div>
                  <div className="current-immat">SL01 · terminé</div>
                </div>
                <div className="current-result done">157 pts</div>
              </div>

              <div className="current-row now">
                <div className="current-time">11:15</div>
                <div>
                  <div className="current-team">Yutz - Jean Mermoz</div>
                  <div className="current-immat">SL02 · passage en cours</div>
                </div>
                <div className="current-result">● live</div>
              </div>

              <div className="current-row">
                <div className="current-time">11:30</div>
                <div>
                  <div className="current-team">Puttelange aux Lacs - J.B. Éblé</div>
                  <div className="current-immat">SL03 · à venir</div>
                </div>
                <div className="current-result pending">-</div>
              </div>
            </div>

            <div>
              <div className="current-col-title">Piste 2 - Planning du jour</div>

              <div className="current-row done">
                <div className="current-time">10:30</div>
                <div>
                  <div className="current-team">Algrange - Saint Vincent de Paul</div>
                  <div className="current-immat">SL10 · terminé</div>
                </div>
                <div className="current-result done">88 pts</div>
              </div>

              <div className="current-row done">
                <div className="current-time">10:45</div>
                <div>
                  <div className="current-team">Aumetz - Lionel TERRAY</div>
                  <div className="current-immat">SL11 · terminé</div>
                </div>
                <div className="current-result done">106 pts</div>
              </div>

              <div className="current-row done">
                <div className="current-time">11:00</div>
                <div>
                  <div className="current-team">Sarreguemines - Fulrad</div>
                  <div className="current-immat">SL12 · terminé</div>
                </div>
                <div className="current-result done">72 pts</div>
              </div>

              <div className="current-row">
                <div className="current-time">11:15</div>
                <div>
                  <div className="current-team">Corcieux - Paul Emile Victor</div>
                  <div className="current-immat">SL07 · à venir</div>
                </div>
                <div className="current-result pending">-</div>
              </div>

              <div className="current-row">
                <div className="current-time">11:30</div>
                <div>
                  <div className="current-team">Mirecourt - Guy Dolmaire</div>
                  <div className="current-immat">SL08 · à venir</div>
                </div>
                <div className="current-result pending">-</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PANEL 4 : COMBATS SUMO ===== */}
        <section className={`panel ${activePanel === 'sumo' ? 'active' : ''}`}>
          <div className="panel-head">
            <div>
              <h1 className="panel-title">Combats <em>sumo</em> en direct</h1>
              <div className="panel-sub">Dohyo Ø 92 cm · robots 160×160 mm max 750 g · 2 Yuko = victoire</div>
            </div>
            <div className="panel-meta">
              Poules qualifications<br />
              <strong>24 / 40</strong>
              rencontres jouées
            </div>
          </div>

          <div className="live-grid" style={{ marginBottom: 40 }}>
            {/* SUMO 1 */}
            <div className="sumo-card live">
              <div className="sumo-head">
                <div>
                  <div className="sumo-label">Zone</div>
                  <div className="sumo-zone">Sumo 1 · Poule A</div>
                </div>
                <div className="sumo-status live-st"><span className="live-dot"></span>En cours</div>
              </div>

              <div className="dohyo-viz live">
                <div className="ring"></div>
                <div className="inner"></div>
                <div className="bot b1"></div>
                <div className="bot b2"></div>
              </div>

              <div className="sumo-vs">
                <div className="sumo-fighter winning">
                  <div className="sumo-fighter-immat">SL01</div>
                  <div className="sumo-fighter-name">HTL<br />Innsbrück</div>
                  <div className="sumo-fighter-score num">2</div>
                  <div className="sumo-round">
                    <div className="sumo-round-dot win"></div>
                    <div className="sumo-round-dot win"></div>
                    <div className="sumo-round-dot"></div>
                  </div>
                </div>
                <div className="sumo-vs-sep">vs</div>
                <div className="sumo-fighter">
                  <div className="sumo-fighter-immat">SL04</div>
                  <div className="sumo-fighter-name">La Briquerie<br />Thionville</div>
                  <div className="sumo-fighter-score num">1</div>
                  <div className="sumo-round">
                    <div className="sumo-round-dot lose"></div>
                    <div className="sumo-round-dot win"></div>
                    <div className="sumo-round-dot"></div>
                  </div>
                </div>
              </div>

              <div className="sumo-foot">
                <span>Manche 3 / 3</span>
                <span className="sumo-timer mono">{mm}:{ss}</span>
                <span>Arbitre · Heckel</span>
              </div>
            </div>

            {/* SUMO 2 */}
            <div className="sumo-card">
              <div className="sumo-head">
                <div>
                  <div className="sumo-label">Zone</div>
                  <div className="sumo-zone">Sumo 2 · Poule B</div>
                </div>
                <div className="sumo-status next-st">● Prochain combat</div>
              </div>

              <div className="dohyo-viz">
                <div className="ring"></div>
                <div className="inner"></div>
                <div className="bot b1" style={{ animation: 'none', left: '38%' }}></div>
                <div className="bot b2" style={{ animation: 'none', left: '62%' }}></div>
              </div>

              <div className="sumo-vs">
                <div className="sumo-fighter">
                  <div className="sumo-fighter-immat">SL09</div>
                  <div className="sumo-fighter-name">Mermoz<br />Saint-Louis</div>
                  <div className="sumo-fighter-score num" style={{ color: 'var(--muted)' }}>-</div>
                  <div className="sumo-round">
                    <div className="sumo-round-dot"></div>
                    <div className="sumo-round-dot"></div>
                    <div className="sumo-round-dot"></div>
                  </div>
                </div>
                <div className="sumo-vs-sep">vs</div>
                <div className="sumo-fighter">
                  <div className="sumo-fighter-immat">SL18</div>
                  <div className="sumo-fighter-name">Julie Daubié<br />Rombas</div>
                  <div className="sumo-fighter-score num" style={{ color: 'var(--muted)' }}>-</div>
                  <div className="sumo-round">
                    <div className="sumo-round-dot"></div>
                    <div className="sumo-round-dot"></div>
                    <div className="sumo-round-dot"></div>
                  </div>
                </div>
              </div>

              <div className="sumo-foot">
                <span>Démarrage dans</span>
                <span className="sumo-timer mono" style={{ color: 'var(--yellow)' }}>03:45</span>
                <span>Arbitre · La Neve</span>
              </div>
            </div>
          </div>

          {/* POULES */}
          <div className="poules-grid">
            <div className="poule">
              <div className="poule-head">
                <div className="poule-title">Poule <em>A</em></div>
                <div className="poule-sub">Sumo 1 · 12h30–13h50</div>
              </div>
              <div className="poule-row header">
                <span></span><span>Équipe</span>
                <span>V</span><span>D</span><span>Yuko</span><span>Pts</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">1</span>
                <div className="p-team">HTL Innsbrück <small>SL01</small></div>
                <span className="p-val">3</span><span className="p-val">0</span><span className="p-val">6</span>
                <span className="p-pts">150</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">2</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL08</small></div>
                <span className="p-val">2</span><span className="p-val">1</span><span className="p-val">4</span>
                <span className="p-pts">130</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">3</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL12</small></div>
                <span className="p-val">1</span><span className="p-val">2</span><span className="p-val">2</span>
                <span className="p-pts">115</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">4</span>
                <div className="p-team">La Briquerie <small>SL04</small></div>
                <span className="p-val">1</span><span className="p-val">2</span><span className="p-val">2</span>
                <span className="p-pts">100</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">5</span>
                <div className="p-team">Julie Daubié Rombas <small>SL17</small></div>
                <span className="p-val">0</span><span className="p-val">3</span><span className="p-val">0</span>
                <span className="p-pts">90</span>
              </div>
            </div>

            <div className="poule">
              <div className="poule-head">
                <div className="poule-title">Poule <em>B</em></div>
                <div className="poule-sub">Sumo 2 · 12h30–13h50</div>
              </div>
              <div className="poule-row header">
                <span></span><span>Équipe</span>
                <span>V</span><span>D</span><span>Yuko</span><span>Pts</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">1</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL13</small></div>
                <span className="p-val">3</span><span className="p-val">0</span><span className="p-val">6</span>
                <span className="p-pts">150</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">2</span>
                <div className="p-team">La Briquerie <small>SL05</small></div>
                <span className="p-val">2</span><span className="p-val">1</span><span className="p-val">5</span>
                <span className="p-pts">130</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">3</span>
                <div className="p-team">HTL Innsbrück <small>SL02</small></div>
                <span className="p-val">2</span><span className="p-val">1</span><span className="p-val">4</span>
                <span className="p-pts">115</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">4</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL09</small></div>
                <span className="p-val">1</span><span className="p-val">2</span><span className="p-val">2</span>
                <span className="p-pts">100</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">5</span>
                <div className="p-team">Julie Daubié Rombas <small>SL18</small></div>
                <span className="p-val">0</span><span className="p-val">3</span><span className="p-val">0</span>
                <span className="p-pts">90</span>
              </div>
            </div>

            <div className="poule">
              <div className="poule-head">
                <div className="poule-title">Poule <em>C</em></div>
                <div className="poule-sub">Sumo 1 · 10h30–11h50 · terminée</div>
              </div>
              <div className="poule-row header">
                <span></span><span>Équipe</span>
                <span>V</span><span>D</span><span>Yuko</span><span>Pts</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">1</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL14</small></div>
                <span className="p-val">4</span><span className="p-val">0</span><span className="p-val">8</span>
                <span className="p-pts">150</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">2</span>
                <div className="p-team">HTL Innsbrück <small>SL03</small></div>
                <span className="p-val">3</span><span className="p-val">1</span><span className="p-val">6</span>
                <span className="p-pts">130</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">3</span>
                <div className="p-team">Julie Daubié Rombas <small>SL19</small></div>
                <span className="p-val">2</span><span className="p-val">2</span><span className="p-val">4</span>
                <span className="p-pts">115</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">4</span>
                <div className="p-team">La Briquerie <small>SL06</small></div>
                <span className="p-val">1</span><span className="p-val">3</span><span className="p-val">2</span>
                <span className="p-pts">100</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">5</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL10</small></div>
                <span className="p-val">0</span><span className="p-val">4</span><span className="p-val">0</span>
                <span className="p-pts">90</span>
              </div>
            </div>

            <div className="poule">
              <div className="poule-head">
                <div className="poule-title">Poule <em>D</em></div>
                <div className="poule-sub">Sumo 2 · 10h30–11h50 · terminée</div>
              </div>
              <div className="poule-row header">
                <span></span><span>Équipe</span>
                <span>V</span><span>D</span><span>Yuko</span><span>Pts</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">1</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL11</small></div>
                <span className="p-val">3</span><span className="p-val">0</span><span className="p-val">6</span>
                <span className="p-pts">150</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">2</span>
                <div className="p-team">La Briquerie <small>SL07</small></div>
                <span className="p-val">2</span><span className="p-val">1</span><span className="p-val">5</span>
                <span className="p-pts">130</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">3</span>
                <div className="p-team">Mermoz Saint-Louis <small>SL15</small></div>
                <span className="p-val">2</span><span className="p-val">1</span><span className="p-val">3</span>
                <span className="p-pts">115</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">4</span>
                <div className="p-team">Julie Daubié Rombas <small>SL16</small></div>
                <span className="p-val">1</span><span className="p-val">2</span><span className="p-val">2</span>
                <span className="p-pts">100</span>
              </div>
              <div className="poule-row">
                <span className="p-pos">5</span>
                <div className="p-team">Julie Daubié Rombas <small>SL20</small></div>
                <span className="p-val">0</span><span className="p-val">3</span><span className="p-val">1</span>
                <span className="p-pts">90</span>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker">
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span className="ticker-item" key={i}><strong>{item[0]}</strong>{item[1]}<span className="ticker-sep">·</span>{item[2]}</span>
            ))}
          </div>
        </div>

      </main>

      <footer>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: 64, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span>TECHNOBOT 2026 · Scoreboard live · Affichage salle</span>
          <span>
            <Link to="/">Accueil</Link> · <Link to="/reglement">Règlement</Link> · <Link to="/inscription">Inscription</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
