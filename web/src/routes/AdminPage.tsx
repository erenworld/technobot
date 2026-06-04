import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';
import { useAuth } from '../lib/auth';
import { AdminTeams } from './AdminTeams';
import { AdminPlanning } from './AdminPlanning';
import { AdminClassement } from './AdminClassement';

type Tab = 'teams' | 'planning' | 'classement';

const TAB_LABELS: Record<Tab, { title: string; sub: string }> = {
  teams: {
    title: 'Équipes inscrites',
    sub: 'Suivi des équipes enregistrées et de leur statut.',
  },
  planning: {
    title: 'Planning du 5 juin',
    sub: "Gestion des créneaux horaires et notation par type d'épreuve.",
  },
  classement: {
    title: 'Classements',
    sub: 'Classements par épreuve et général — collèges et lycées.',
  },
};

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('planning');
  const { session, profile, signOut } = useAuth();

  const userLabel = (
    `${profile?.prenom || ''} ${profile?.nom || ''}`.trim() ||
    profile?.email ||
    session?.user?.email ||
    'compte connecté'
  );

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

        <div className="events-tabs" role="tablist" style={{ marginTop: 24 }}>
          <button type="button" role="tab"
            aria-selected={tab === 'teams'}
            className={tab === 'teams' ? 'active' : ''}
            onClick={() => setTab('teams')}>
            Équipes inscrites
          </button>
          <button type="button" role="tab"
            aria-selected={tab === 'planning'}
            className={tab === 'planning' ? 'active' : ''}
            onClick={() => setTab('planning')}>
            Planning/Notation
          </button>
          <button type="button" role="tab"
            aria-selected={tab === 'classement'}
            className={tab === 'classement' ? 'active' : ''}
            onClick={() => setTab('classement')}>
            Classements
          </button>
        </div>
      </header>

      {tab === 'teams' && <AdminTeams />}
      {tab === 'planning' && <AdminPlanning />}
      {tab === 'classement' && <AdminClassement />}

      <FooterCompact />
    </>
  );
}
