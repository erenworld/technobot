import { useEffect, useState, useMemo } from 'react';
import { FooterScoreboard } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { EpreuveDB, PlanningSlot, Team } from '../types/api';

const pad = (n: number) => String(n).padStart(2, '0');

const EPREUVE_LABELS: Record<string, string> = {
  sumo: 'Sumo',
  suivi_ligne: 'Suivi de ligne',
  formule_robot: 'Formule robot',
  design: 'Design',
  presentation_projet: 'Présentation projet',
};

const EPREUVE_ORDER = ['sumo', 'suivi_ligne', 'formule_robot', 'design', 'presentation_projet'];

function fmtTime(raw: string | null | undefined) { return raw?.slice(0, 5) ?? ''; }
function slotStart(s: PlanningSlot) { return fmtTime(s.heure_presentation ?? s.heure_debut_rencontres); }
function slotEnd(s: PlanningSlot) { return fmtTime(s.heure_fin_rencontres); }
function slotZone(s: PlanningSlot) { return s.zone_rencontres ?? s.salle_presentation ?? ''; }

type Status = 'done' | 'now' | 'pending';

function getStatus(s: PlanningSlot, nowMins: number): Status {
  const start = slotStart(s);
  if (!start) return 'pending';
  const [sh, sm] = start.split(':').map(Number);
  const startMins = (sh ?? 0) * 60 + (sm ?? 0);
  const end = slotEnd(s);
  if (end) {
    const [eh, em] = end.split(':').map(Number);
    if (nowMins > (eh ?? 0) * 60 + (em ?? 0)) return 'done';
    if (nowMins >= startMins) return 'now';
  } else {
    if (nowMins > startMins + 15) return 'done';
    if (nowMins >= startMins) return 'now';
  }
  return 'pending';
}

type EnrichedSlot = PlanningSlot & {
  teamNom: string;
  teamImmat: string;
  epreuveType: string;
  epreuveLabel: string;
};

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function usePlanning() {
  const [slots, setSlots] = useState<PlanningSlot[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [epreuves, setEpreuves] = useState<EpreuveDB[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!supabase) { setLoading(false); return; }
    Promise.all([
      supabase.from('planning_slots').select('*'),
      supabase.from('teams').select('*'),
      supabase.from('epreuves').select('*'),
    ]).then(([ps, ts, ep]) => {
      setSlots((ps.data ?? []) as PlanningSlot[]);
      setTeams((ts.data ?? []) as Team[]);
      setEpreuves((ep.data ?? []) as EpreuveDB[]);
      setLoading(false);
    });
  }

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, []);
  return { slots, teams, epreuves, loading };
}

export function ScoreboardPage() {
  const now = useClock();
  const { slots, teams, epreuves, loading } = usePlanning();

  const [search, setSearch] = useState('');
  const [filterEpreuve, setFilterEpreuve] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'' | Status>('');

  useEffect(() => {
    document.body.classList.add('scoreboard-page');
    return () => document.body.classList.remove('scoreboard-page');
  }, []);

  const nowMins = now.getHours() * 60 + now.getMinutes();

  const teamById = useMemo(() => { const m: Record<string, Team> = {}; for (const t of teams) m[t.id] = t; return m; }, [teams]);
  const epreuveById = useMemo(() => { const m: Record<string, EpreuveDB> = {}; for (const ep of epreuves) m[ep.id] = ep; return m; }, [epreuves]);

  const enriched = useMemo((): EnrichedSlot[] => {
    return slots
      .map((s): EnrichedSlot => {
        const team = s.team_id ? teamById[s.team_id] : null;
        const ep = s.epreuve_id ? epreuveById[s.epreuve_id] : null;
        return {
          ...s,
          teamNom: team?.nom_robot || '—',
          teamImmat: team?.immatriculation || '',
          epreuveType: ep?.type ?? '',
          epreuveLabel: ep ? (EPREUVE_LABELS[ep.type] ?? ep.nom) : '—',
        };
      })
      .sort((a, b) => slotStart(a).localeCompare(slotStart(b)));
  }, [slots, teamById, epreuveById]);

  /* Filtre combiné : recherche texte + épreuve + statut */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((s) => {
      if (filterEpreuve && s.epreuveType !== filterEpreuve) return false;
      if (filterStatus && getStatus(s, nowMins) !== filterStatus) return false;
      if (q) {
        const hay = [s.teamNom, s.teamImmat, s.epreuveLabel, slotZone(s), slotStart(s)].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enriched, search, filterEpreuve, filterStatus, nowMins]);

  /* Groupement par zone, zones actives en premier */
  const byZone = useMemo(() => {
    const groups: Record<string, EnrichedSlot[]> = {};
    for (const s of filtered) {
      const z = slotZone(s) || '—';
      (groups[z] ??= []).push(s);
    }
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aScore = a.some((s) => getStatus(s, nowMins) === 'now') ? 0 : a.some((s) => getStatus(s, nowMins) === 'pending') ? 1 : 2;
      const bScore = b.some((s) => getStatus(s, nowMins) === 'now') ? 0 : b.some((s) => getStatus(s, nowMins) === 'pending') ? 1 : 2;
      return aScore - bScore;
    });
  }, [filtered, nowMins]);

  /* Épreuves présentes dans les données */
  const presentEpreuves = useMemo(() => {
    const types = new Set(enriched.map((s) => s.epreuveType).filter(Boolean));
    return EPREUVE_ORDER.filter((e) => types.has(e));
  }, [enriched]);

  const isFiltered = search || filterEpreuve || filterStatus;

  return (
    <>
      {/* Bande supérieure */}
      <div className="topstrip">
        <div className="topstrip-center mono">
          <span>{pad(now.getHours())}</span><span className="sep">:</span>
          <span>{pad(now.getMinutes())}</span><span className="sep">:</span>
          <span>{pad(now.getSeconds())}</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Titre */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--red)', marginBottom: 8 }}>
            // Planning · 5 juin 2026
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(32px, 7vw, 60px)', fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 0.95, margin: 0, color: 'var(--ink)' }}>
            Programme <em style={{ fontStyle: 'italic', color: 'var(--red)' }}>en cours.</em>
          </h1>
        </div>

        {/* ───── Barre de recherche ───── */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--muted)', pointerEvents: 'none' }}
          >
            <circle cx="8.5" cy="8.5" r="5.5" /><path d="M15 15l-3-3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher : robot, zone, épreuve, heure…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: '14px 16px 14px 46px',
              fontFamily: 'var(--ff-body)',
              fontSize: 16,
              color: 'var(--ink)',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: 4 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ───── Filtres chips ───── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {/* Filtre statut */}
          {(['', 'now', 'pending', 'done'] as const).map((s) => {
            const labels: Record<string, string> = { '': 'Tous', now: '● En cours', pending: 'À venir', done: 'Terminé' };
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontFamily: 'var(--ff-mono)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--red)' : 'var(--line)'}`,
                  background: active ? 'var(--red)' : 'var(--panel)',
                  color: active ? 'white' : s === 'now' ? 'var(--red)' : 'var(--muted)',
                  transition: 'all .15s',
                }}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Filtre épreuve */}
        {presentEpreuves.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            <button
              onClick={() => setFilterEpreuve('')}
              style={chipStyle(!filterEpreuve)}
            >
              Toutes les épreuves
            </button>
            {presentEpreuves.map((ep) => (
              <button
                key={ep}
                onClick={() => setFilterEpreuve(ep === filterEpreuve ? '' : ep)}
                style={chipStyle(filterEpreuve === ep)}
              >
                {EPREUVE_LABELS[ep]}
              </button>
            ))}
          </div>
        )}

        {/* Résumé du filtre + reset */}
        {isFiltered && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontFamily: 'var(--ff-mono)', fontSize: 12, color: 'var(--muted)' }}>
            <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
            <button
              onClick={() => { setSearch(''); setFilterEpreuve(''); setFilterStatus(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, fontFamily: 'var(--ff-mono)', cursor: 'pointer', padding: 0 }}
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {/* ───── Contenu ───── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            CHARGEMENT…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: 24, color: 'var(--muted)', marginBottom: 8 }}>Aucun résultat</div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--muted)' }}>
              {isFiltered ? 'Essayez d\'élargir votre recherche.' : 'Aucun créneau planifié pour aujourd\'hui.'}
            </div>
          </div>
        )}

        {!loading && byZone.map(([zone, zoneSlots]) => {
          const hasActive = zoneSlots.some((s) => getStatus(s, nowMins) === 'now');
          return (
            <div key={zone} style={{
              marginBottom: 20,
              border: `1px solid ${hasActive ? 'rgba(255,74,66,0.5)' : 'var(--line)'}`,
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--panel)',
            }}>
              {/* En-tête zone */}
              <div style={{
                padding: '12px 20px',
                background: hasActive ? 'linear-gradient(90deg,rgba(255,74,66,.12),transparent)' : 'var(--bg-2)',
                borderBottom: `1px solid ${hasActive ? 'rgba(255,74,66,.25)' : 'var(--line)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                {hasActive && <span className="live-dot" style={{ flexShrink: 0 }} />}
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
                  Zone
                </span>
                <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 600, fontSize: 16, color: hasActive ? 'var(--red)' : 'var(--ink)', letterSpacing: '-0.01em' }}>
                  {zone}
                </span>
              </div>

              {/* Lignes */}
              {zoneSlots.map((slot) => {
                const status = getStatus(slot, nowMins);
                const rowCls = status === 'done' ? 'done' : status === 'now' ? 'now' : '';
                const end = slotEnd(slot);
                return (
                  <div
                    key={slot.id}
                    className={`current-row${rowCls ? ' ' + rowCls : ''}`}
                    style={{ padding: '14px 20px', gridTemplateColumns: '56px 1fr auto', gap: 14 }}
                  >
                    <div>
                      <div className="current-time">{slotStart(slot)}</div>
                      {end && <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>→{end}</div>}
                    </div>
                    <div>
                      <div className="current-team">{slot.teamNom}</div>
                      <div className="current-immat">
                        {slot.epreuveLabel}{slot.teamImmat ? ` · ${slot.teamImmat}` : ''}
                      </div>
                    </div>
                    {status === 'now' && (
                      <div className="current-result" style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                        <span className="live-dot" style={{ width: 6, height: 6 }} />LIVE
                      </div>
                    )}
                    {status === 'done' && <div className="current-result done">✓</div>}
                    {status === 'pending' && <div className="current-result pending">—</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <FooterScoreboard />
    </>
  );
}

/* Chip style helper */
function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 999,
    fontSize: 12,
    fontFamily: 'var(--ff-mono)',
    fontWeight: 500,
    cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink-2)' : 'var(--line)'}`,
    background: active ? 'var(--bg-3)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--muted)',
    transition: 'all .15s',
    whiteSpace: 'nowrap' as const,
  };
}
