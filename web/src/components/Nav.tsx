import { NavLink } from 'react-router-dom';

type NavKey = 'home' | 'reglement' | 'scoreboard' | 'inscription';

const ITEMS: Array<{ to: string; label: string; key: NavKey; cta?: boolean }> = [
  { to: '/', label: 'Accueil', key: 'home' },
  { to: '/reglement', label: 'Règlement', key: 'reglement' },
  { to: '/scoreboard', label: 'Scoreboard', key: 'scoreboard' },
  { to: '/inscription', label: "S'inscrire", key: 'inscription', cta: true },
];

export function Nav({ active }: { active?: NavKey }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">
          <span className="brand-dot"></span>
          <span>TECHNOBOT</span>
          <span className="brand-tag">/ 2026</span>
        </NavLink>
        <div className="nav-links">
          {ITEMS.map((item) => {
            const classes: string[] = [];
            if (item.cta) classes.push('nav-cta');
            if (active === item.key) classes.push('active');
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={classes.join(' ') || undefined}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
