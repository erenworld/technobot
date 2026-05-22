import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterScoreboard } from '../components/Footer';
import { useClassements } from '../lib/useClassements';
import {
  ClassementCollegeEntry,
  ClassementLyceeEntry,
} from '../types/api';

type PanelKey = 'colleges' | 'lycees' | 'current' | 'sumo';
const PANEL_ORDER: PanelKey[] = ['colleges', 'lycees', 'current', 'sumo'];
const ROTATION_MS = 15_000;

type CollegeRow = {
  key: string;
  name: string;
  sub: string;
  suivi: number;
  formule: number;
  design: number;
  projet: number;
  total: number;
  delta: number;
};

type LyceeRow = {
  key: string;
  name: string;
  sub: string;
  sumo: number;
  pres: number;
  robots: number;
  total: number;
  delta: number;
};

const MOCK_COLLEGES: CollegeRow[] = [
  { key: 'yutz', name: 'Yutz', sub: 'Jean Mermoz', suivi: 143, formule: 132, design: 112, projet: 137, total: 524, delta: 2 },
  { key: 'hombourg', name: 'Hombourg-Haut', sub: 'Robert Schuman', suivi: 157, formule: 110, design: 98, projet: 122, total: 487, delta: 1 },
  { key: 'thionville', name: 'Thionville', sub: 'Saint Pierre Chanel', suivi: 119, formule: 88, design: 94, projet: 131, total: 432, delta: -2 },
  { key: 'fameck', name: 'Fameck', sub: 'Charles De Gaulle', suivi: 88, formule: 132, design: 76, projet: 105, total: 401, delta: 0 },
  { key: 'mirecourt', name: 'Mirecourt', sub: 'Guy Dolmaire', suivi: 0, formule: 66, design: 88, projet: 99, total: 253, delta: 3 },
  { key: 'aumetz', name: 'Aumetz', sub: 'Lionel TERRAY', suivi: 106, formule: 44, design: 72, projet: 76, total: 298, delta: -1 },
  { key: 'algrange', name: 'Algrange', sub: 'Saint Vincent de Paul', suivi: 88, formule: 22, design: 85, projet: 69, total: 264, delta: 0 },
  { key: 'corcieux', name: 'Corcieux', sub: 'Paul Emile Victor', suivi: 0, formule: 66, design: 68, projet: 97, total: 231, delta: 1 },
  { key: 'sarreguemines', name: 'Sarreguemines', sub: 'Fulrad', suivi: 72, formule: 10, design: 45, projet: 71, total: 198, delta: -2 },
  { key: 'vaubecourt', name: 'Vaubecourt', sub: 'Emilie du Châtelet', suivi: 0, formule: 9, design: 62, projet: 83, total: 154, delta: 0 },
  { key: 'puttelange', name: 'Puttelange aux Lacs', sub: 'Jean-Baptiste Éblé', suivi: 0, formule: 0, design: 55, projet: 66, total: 121, delta: 1 },
];

const MOCK_LYCEES: LyceeRow[] = [
  { key: 'htl', name: 'HTL Innsbrück', sub: 'Hayange', sumo: 280, pres: 132, robots: 3, total: 442, delta: 1 },
  { key: 'mermoz', name: 'Mermoz Saint-Louis', sub: 'Saint-Louis', sumo: 295, pres: 115, robots: 8, total: 490, delta: -1 },
  { key: 'briquerie', name: 'La Briquerie', sub: 'Thionville', sumo: 260, pres: 128, robots: 4, total: 428, delta: 0 },
  { key: 'daubie', name: 'Julie Daubié', sub: 'Rombas', sumo: 240, pres: 98, robots: 5, total: 388, delta: 0 },
];

const TICKER_ITEMS: Array<[string, string, string]> = [
  ['SL01 HTL Innsbrück', 'bat SL04 La Briquerie', '2-1 · Poule A'],
  ['Yutz Mermoz', 'passage suivi de ligne', 'en direct'],
  ['Record du jour', '4.20s sur piste principale', 'Hombourg-Haut'],
  ['Poule C', 'terminée · Mermoz SL14 premier', '6 Yuko'],
  ['Fameck De Gaulle', '157 pts en formule robot', 'nouveau leader'],
  ['Contrôle technique', '27 robots validés', '3 en attente'],
  ['SL13 Mermoz', 'qualifiée pour demi-finale', 'poule B'],
  ['Présentation projet', 'commence à 14h30', 'salle annexe'],
  ['Design collèges', 'Thionville bonus ovale', '+10 pts'],
];

const pad = (n: number) => String(n).padStart(2, '0');

function mapApiColleges(entries: ClassementCollegeEntry[]): CollegeRow[] {
  return entries.map((e) => ({
    key: e.team_id,
    name: e.etablissement,
    sub: e.nom_robot || e.immatriculation,
    suivi: e.detail_scores.suivi_ligne ?? 0,
    formule: e.detail_scores.formule_robot ?? 0,
    design: e.detail_scores.design ?? 0,
    projet: e.detail_scores.presentation ?? 0,
    total: e.total_points,
    delta: 0,
  }));
}

function mapApiLycees(entries: ClassementLyceeEntry[]): LyceeRow[] {
  return entries.map((e) => ({
    key: e.team_id,
    name: e.etablissement,
    sub: e.nom_robot || e.immatriculation,
    sumo: e.detail_scores.points_rencontres_sumo ?? 0,
    pres: e.detail_scores.presentation_lycee ?? 0,
    robots: 0,
    total: e.total_points,
    delta: 0,
  }));
}

function Delta({ d }: { d: number }) {
  if (d > 0) return <span className="rank-delta up"><span className="rank-arrow">▲</span>{d}</span>;
  if (d < 0) return <span className="rank-delta down"><span className="rank-arrow">▼</span>{Math.abs(d)}</span>;
  return <span className="rank-delta eq">-</span>;
}

function FmtPts({ n }: { n: number }) {
  return n === 0 ? <span className="zero">0</span> : <>{n}</>;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useSumoTimer() {
  const [t, setT] = useState(134);
  useEffect(() => {
    const id = setInterval(() => {
      setT((cur) => (cur <= 0 ? 180 : cur - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

export function ScoreboardPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rotElapsed, setRotElapsed] = useState(0);

  const { data, error, lastUpdate } = useClassements();

  const now = useClock();
  const sumoTimer = useSumoTimer();

  const colleges = useMemo<CollegeRow[]>(() => {
    if (data?.colleges?.length) return mapApiColleges(data.colleges);
    return MOCK_COLLEGES;
  }, [data]);

  const lycees = useMemo<LyceeRow[]>(() => {
    if (data?.lycees?.length) return mapApiLycees(data.lycees);
    return MOCK_LYCEES;
  }, [data]);

  useEffect(() => {
    document.body.classList.add('scoreboard-page');
    return () => document.body.classList.remove('scoreboard-page');
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setRotElapsed((cur) => {
        const next = cur + 100;
        if (next >= ROTATION_MS) {
          setActiveIdx((idx) => (idx + 1) % PANEL_ORDER.length);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [paused]);

  const rotPct = Math.min(100, (rotElapsed / ROTATION_MS) * 100);
  const rotCountdown = Math.max(0, Math.ceil((ROTATION_MS - rotElapsed) / 1000));
  const activePanel = PANEL_ORDER[activeIdx];

  const sortedColleges = useMemo(
    () => [...colleges].sort((a, b) => b.total - a.total),
    [colleges],
  );
  const sortedLycees = useMemo(
    () => [...lycees].sort((a, b) => b.total - a.total),
    [lycees],
  );

  const setPanel = (idx: number) => {
    setActiveIdx(idx);
    setRotElapsed(0);
  };

  const togglePause = () => {
    setPaused((p) => !p);
    setRotElapsed(0);
  };

  const updatedAgo = lastUpdate
    ? `il y a ${Math.max(1, Math.floor((Date.now() - lastUpdate) / 1000))} s`
    : '—';

  return (
    <>
      <Nav active="scoreboard" />

      <div className="topstrip">
        <div className="topstrip-left">
          <span className="live-indicator">
            <span className="live-dot"></span>EN DIRECT
          </span>
          <span>Gymnase Mermoz · Yutz</span>
        </div>
        <div className="topstrip-center mono">
          <span>{pad(now.getHours())}</span>
          <span className="sep">:</span>
          <span>{pad(now.getMinutes())}</span>
          <span className="sep">:</span>
          <span>{pad(now.getSeconds())}</span>
        </div>
        <div className="topstrip-right">
          <span>Édition 15</span>
          <span className="dash"></span>
          <span>05.06.2026</span>
        </div>
      </div>

      <div className="tabs-wrap">
        <div className="tabs">
          {(
            [
              ['colleges', 'Classement Collèges', '01'],
              ['lycees', 'Classement Lycées', '02'],
              ['current', 'Épreuve en cours', '03'],
              ['sumo', 'Combats Sumo', '04'],
            ] as const
          ).map(([key, label, num], i) => (
            <button
              key={key}
              type="button"
              className={`tab${activePanel === key ? ' active' : ''}`}
              onClick={() => setPanel(i)}
            >
              <span>{label}</span>
              <span className="tab-num">{num}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rotation-bar">
        <div
          className={`rotation-bar-fill${paused ? ' paused' : ''}`}
          style={{ width: `${rotPct}%` }}
        ></div>
      </div>
      <div className="rotation-ctrl">
        <span>
          {paused ? (
            'Rotation en pause · navigation manuelle'
          ) : (
            <>
              Rotation auto · prochain onglet dans <span>{rotCountdown}</span>s
            </>
          )}
        </span>
        <button
          type="button"
          className={`rotation-btn${!paused ? ' active' : ''}`}
          onClick={togglePause}
        >
          {paused ? '▶ Reprendre' : '⏸ Pause'}
        </button>
      </div>

      <main>
        <section className={`panel${activePanel === 'colleges' ? ' active' : ''}`}>
          <div className="panel-head">
            <div>
              <h1 className="panel-title">
                Classement général <em>collèges</em>
              </h1>
              <div className="panel-sub">
                {sortedColleges.length} établissements · 4 épreuves · mis à jour {updatedAgo}
                {error ? ` · ${error}` : ''}
              </div>
            </div>
            <div className="panel-meta">
              Trophée en jeu
              <br />
              <strong>↑ {sortedColleges[0]?.total ?? 0} pts</strong>
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
                <th className="n" style={{ textAlign: 'right' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedColleges.map((r, i) => {
                const pos = i + 1;
                return (
                  <tr key={r.key} className={pos <= 3 ? 'top' : ''}>
                    <td className="rank-pos num">{pad(pos)}</td>
                    <td>
                      <div className="rank-name">{r.name}</div>
                      <div className="rank-loc">Collège {r.sub}</div>
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      <FmtPts n={r.suivi} />
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      <FmtPts n={r.formule} />
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      <FmtPts n={r.design} />
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      <FmtPts n={r.projet} />
                    </td>
                    <td className="rank-total num">
                      {r.total}
                      <Delta d={r.delta} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className={`panel${activePanel === 'lycees' ? ' active' : ''}`}>
          <div className="panel-head">
            <div>
              <h1 className="panel-title">
                Classement <em>lycées</em>
              </h1>
              <div className="panel-sub">
                {sortedLycees.length} lycées · Sumo autonome + présentation
                anglais · mis à jour {updatedAgo}
              </div>
            </div>
            <div className="panel-meta">
              Leader provisoire
              <br />
              <strong>{sortedLycees[0]?.name ?? '—'}</strong>
              {sortedLycees[0]?.total ?? 0} pts cumulés
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
                <th className="n" style={{ textAlign: 'right' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLycees.map((r, i) => {
                const pos = i + 1;
                return (
                  <tr key={r.key} className={pos <= 3 ? 'top' : ''}>
                    <td className="rank-pos num">{pad(pos)}</td>
                    <td>
                      <div className="rank-name">{r.name}</div>
                      <div className="rank-loc">Lycée · {r.sub}</div>
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      {r.sumo}
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      {r.pres}
                    </td>
                    <td className="rank-evt-pts num" style={{ textAlign: 'right' }}>
                      {r.robots}
                    </td>
                    <td className="rank-total num">
                      {r.total}
                      <Delta d={r.delta} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <CurrentPanel active={activePanel === 'current'} />
        <SumoPanel active={activePanel === 'sumo'} sumoTimer={sumoTimer} />

        <div className="ticker">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map(([a, b, c], i) => (
              <span key={i} className="ticker-item">
                <strong>{a}</strong>
                {b}
                <span className="ticker-sep">·</span>
                {c}
              </span>
            ))}
          </div>
        </div>
      </main>

      <FooterScoreboard />
    </>
  );
}

function CurrentPanel({ active }: { active: boolean }) {
  return (
    <section className={`panel${active ? ' active' : ''}`}>
      <div className="current-hero">
        <div className="current-hero-tag">
          <span className="live-dot"></span>
          Piste 1 · Salle principale · en cours
        </div>
        <h1 className="current-hero-title">
          Suivi de <em>ligne</em> - collèges
        </h1>
        <p className="current-hero-sub">
          Chaque robot tente de parcourir le tracé principal de 9 m. Les 6
          pistes bonus (angles, croisements, interruptions) donnent 5 points
          supplémentaires chacune.
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
            <div className="current-stat-val num">
              4.2<span style={{ fontSize: 22 }}>s</span>
            </div>
            <div className="current-stat-lbl">Temps record</div>
          </div>
        </div>
      </div>

      <div className="current-list">
        <CurrentColumn
          title="Piste 1 - Planning du jour"
          rows={[
            { time: '10:30', team: 'Thionville - Saint Pierre Chanel', immat: 'SL04 · terminé', result: '143 pts', cls: 'done' },
            { time: '10:45', team: 'Fameck - Charles De Gaulle', immat: 'SL06 · terminé', result: '119 pts', cls: 'done' },
            { time: '11:00', team: 'Hombourg-Haut - Robert Schuman', immat: 'SL01 · terminé', result: '157 pts', cls: 'done' },
            { time: '11:15', team: 'Yutz - Jean Mermoz', immat: 'SL02 · passage en cours', result: '● live', cls: 'now' },
            { time: '11:30', team: 'Puttelange aux Lacs - J.B. Éblé', immat: 'SL03 · à venir', result: '-', cls: 'pending' },
          ]}
        />
        <CurrentColumn
          title="Piste 2 - Planning du jour"
          rows={[
            { time: '10:30', team: 'Algrange - Saint Vincent de Paul', immat: 'SL10 · terminé', result: '88 pts', cls: 'done' },
            { time: '10:45', team: 'Aumetz - Lionel TERRAY', immat: 'SL11 · terminé', result: '106 pts', cls: 'done' },
            { time: '11:00', team: 'Sarreguemines - Fulrad', immat: 'SL12 · terminé', result: '72 pts', cls: 'done' },
            { time: '11:15', team: 'Corcieux - Paul Emile Victor', immat: 'SL07 · à venir', result: '-', cls: 'pending' },
            { time: '11:30', team: 'Mirecourt - Guy Dolmaire', immat: 'SL08 · à venir', result: '-', cls: 'pending' },
          ]}
        />
      </div>
    </section>
  );
}

type CurrentRow = {
  time: string;
  team: string;
  immat: string;
  result: string;
  cls: 'done' | 'now' | 'pending';
};

function CurrentColumn({ title, rows }: { title: string; rows: CurrentRow[] }) {
  return (
    <div>
      <div className="current-col-title">{title}</div>
      {rows.map((r, i) => {
        const rowCls = r.cls === 'done' ? 'done' : r.cls === 'now' ? 'now' : '';
        const resCls =
          r.cls === 'done'
            ? 'current-result done'
            : r.cls === 'pending'
              ? 'current-result pending'
              : 'current-result';
        return (
          <div key={i} className={`current-row${rowCls ? ' ' + rowCls : ''}`}>
            <div className="current-time">{r.time}</div>
            <div>
              <div className="current-team">{r.team}</div>
              <div className="current-immat">{r.immat}</div>
            </div>
            <div className={resCls}>{r.result}</div>
          </div>
        );
      })}
    </div>
  );
}

function SumoPanel({ active, sumoTimer }: { active: boolean; sumoTimer: string }) {
  return (
    <section className={`panel${active ? ' active' : ''}`}>
      <div className="panel-head">
        <div>
          <h1 className="panel-title">
            Combats <em>sumo</em> en direct
          </h1>
          <div className="panel-sub">
            Dohyo Ø 92 cm · robots 160×160 mm max 750 g · 2 Yuko = victoire
          </div>
        </div>
        <div className="panel-meta">
          Poules qualifications
          <br />
          <strong>24 / 40</strong>
          rencontres jouées
        </div>
      </div>

      <div className="live-grid" style={{ marginBottom: 40 }}>
        <div className="sumo-card live">
          <div className="sumo-head">
            <div>
              <div className="sumo-label">Zone</div>
              <div className="sumo-zone">Sumo 1 · Poule A</div>
            </div>
            <div className="sumo-status live-st">
              <span className="live-dot"></span>En cours
            </div>
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
              <div className="sumo-fighter-name">
                HTL
                <br />
                Innsbrück
              </div>
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
              <div className="sumo-fighter-name">
                La Briquerie
                <br />
                Thionville
              </div>
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
            <span className="sumo-timer mono">{sumoTimer}</span>
            <span>Arbitre · Heckel</span>
          </div>
        </div>

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
              <div className="sumo-fighter-name">
                Mermoz
                <br />
                Saint-Louis
              </div>
              <div className="sumo-fighter-score num" style={{ color: 'var(--muted)' }}>
                -
              </div>
              <div className="sumo-round">
                <div className="sumo-round-dot"></div>
                <div className="sumo-round-dot"></div>
                <div className="sumo-round-dot"></div>
              </div>
            </div>
            <div className="sumo-vs-sep">vs</div>
            <div className="sumo-fighter">
              <div className="sumo-fighter-immat">SL18</div>
              <div className="sumo-fighter-name">
                Julie Daubié
                <br />
                Rombas
              </div>
              <div className="sumo-fighter-score num" style={{ color: 'var(--muted)' }}>
                -
              </div>
              <div className="sumo-round">
                <div className="sumo-round-dot"></div>
                <div className="sumo-round-dot"></div>
                <div className="sumo-round-dot"></div>
              </div>
            </div>
          </div>
          <div className="sumo-foot">
            <span>Démarrage dans</span>
            <span className="sumo-timer mono" style={{ color: 'var(--yellow)' }}>
              03:45
            </span>
            <span>Arbitre · La Neve</span>
          </div>
        </div>
      </div>

      <div className="poules-grid">
        <Poule
          letter="A"
          info="Sumo 1 · 12h30–13h50"
          rows={[
            ['HTL Innsbrück', 'SL01', '3', '0', '6', '150'],
            ['Mermoz Saint-Louis', 'SL08', '2', '1', '4', '130'],
            ['Mermoz Saint-Louis', 'SL12', '1', '2', '2', '115'],
            ['La Briquerie', 'SL04', '1', '2', '2', '100'],
            ['Julie Daubié Rombas', 'SL17', '0', '3', '0', '90'],
          ]}
        />
        <Poule
          letter="B"
          info="Sumo 2 · 12h30–13h50"
          rows={[
            ['Mermoz Saint-Louis', 'SL13', '3', '0', '6', '150'],
            ['La Briquerie', 'SL05', '2', '1', '5', '130'],
            ['HTL Innsbrück', 'SL02', '2', '1', '4', '115'],
            ['Mermoz Saint-Louis', 'SL09', '1', '2', '2', '100'],
            ['Julie Daubié Rombas', 'SL18', '0', '3', '0', '90'],
          ]}
        />
        <Poule
          letter="C"
          info="Sumo 1 · 10h30–11h50 · terminée"
          rows={[
            ['Mermoz Saint-Louis', 'SL14', '4', '0', '8', '150'],
            ['HTL Innsbrück', 'SL03', '3', '1', '6', '130'],
            ['Julie Daubié Rombas', 'SL19', '2', '2', '4', '115'],
            ['La Briquerie', 'SL06', '1', '3', '2', '100'],
            ['Mermoz Saint-Louis', 'SL10', '0', '4', '0', '90'],
          ]}
        />
        <Poule
          letter="D"
          info="Sumo 2 · 10h30–11h50 · terminée"
          rows={[
            ['Mermoz Saint-Louis', 'SL11', '3', '0', '6', '150'],
            ['La Briquerie', 'SL07', '2', '1', '5', '130'],
            ['Mermoz Saint-Louis', 'SL15', '2', '1', '3', '115'],
            ['Julie Daubié Rombas', 'SL16', '1', '2', '2', '100'],
            ['Julie Daubié Rombas', 'SL20', '0', '3', '1', '90'],
          ]}
        />
      </div>
    </section>
  );
}

function Poule({
  letter,
  info,
  rows,
}: {
  letter: string;
  info: string;
  rows: Array<[string, string, string, string, string, string]>;
}) {
  return (
    <div className="poule">
      <div className="poule-head">
        <div className="poule-title">
          Poule <em>{letter}</em>
        </div>
        <div className="poule-sub">{info}</div>
      </div>
      <div className="poule-row header">
        <span></span>
        <span>Équipe</span>
        <span>V</span>
        <span>D</span>
        <span>Yuko</span>
        <span>Pts</span>
      </div>
      {rows.map(([team, immat, v, d, yuko, pts], i) => (
        <div key={i} className="poule-row">
          <span className="p-pos">{i + 1}</span>
          <div className="p-team">
            {team} <small>{immat}</small>
          </div>
          <span className="p-val">{v}</span>
          <span className="p-val">{d}</span>
          <span className="p-val">{yuko}</span>
          <span className="p-pts">{pts}</span>
        </div>
      ))}
    </div>
  );
}
