import { Link } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';

export function NotFoundPage() {
  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>404</span>
        </div>
        <h1>
          Page <em>introuvable.</em>
        </h1>
        <p>
          Cette page n'existe pas ou a été déplacée. Retournez à l'accueil ou
          consultez le règlement.
        </p>

        <div className="hero-actions" style={{ marginTop: 28 }}>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link to="/scoreboard" className="btn btn-ghost">
            Voir le scoreboard
          </Link>
        </div>
      </header>

      <FooterCompact />
    </>
  );
}
