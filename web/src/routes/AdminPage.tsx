import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';
import { useAuth } from '../lib/auth';
import { AdminScoring } from './AdminScoring';
import { AdminTeams } from './AdminTeams';

/**
 * Coquille de la console admin : Nav, en-tête, barre d'onglets et footer.
 * Le contenu réel est délégué aux sous-pages (Notation / Équipes).
 *
 * La protection d'accès est posée au niveau du routeur (RequireAuth dans
 * main.tsx) ; cette page suppose donc qu'un utilisateur est connecté.
 */

type Tab = 'scoring' | 'teams';

const TAB_LABELS: Record<Tab, { title: string; sub: string }> = {
  scoring: {
    title: 'Notation des groupes',
    sub: 'Console de saisie des notes pour le jour de la compétition.',
  },
  teams: {
    title: 'Équipes inscrites',
    sub: 'Suivi des équipes enregistrées et de leur statut.',
  },
};

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('scoring');
  const { profile, signOut } = useAuth();

  const userLabel = profile
    ? `${profile.prenom} ${profile.nom}`.trim() || profile.email
    : 'compte connecté';

  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>Admin</span>
          <span className="sep">/</span>
          <span>{TAB_LABELS[tab].title}</span>
        </div>
        <h1>
          Console <em>admin.</em>
        </h1>
        <p>
          {TAB_LABELS[tab].sub}
          {' '}Connecté en tant que <strong>{userLabel}</strong>
          {profile?.role ? (
            <>
              {' '}· rôle <strong>{profile.role}</strong>
            </>
          ) : null}{' '}
          ·{' '}
          <a
            href="#logout"
            onClick={(e) => {
              e.preventDefault();
              void signOut();
            }}
          >
            Se déconnecter
          </a>
          .
        </p>

        <div
          className="events-tabs"
          role="tablist"
          style={{ marginTop: 24 }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'scoring'}
            className={tab === 'scoring' ? 'active' : ''}
            onClick={() => setTab('scoring')}
          >
            Notation
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'teams'}
            className={tab === 'teams' ? 'active' : ''}
            onClick={() => setTab('teams')}
          >
            Équipes inscrites
          </button>
        </div>
      </header>

      {tab === 'scoring' ? <AdminScoring /> : <AdminTeams />}

      <FooterCompact />
    </>
  );
}
