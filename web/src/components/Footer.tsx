import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div>
          <div className="foot-brand">
            TECHNO<span className="red">BOT</span>
            <br />· 2026 ·
          </div>
          <p
            style={{
              marginTop: 24,
              color: 'rgba(245,241,233,0.6)',
              maxWidth: 400,
              fontSize: 14,
            }}
          >
            Marque déposée · Tech Tic &amp; Co. Adaptation du règlement IUT GEII
            de Nîmes / Université Montpellier II.
          </p>
        </div>
        <div className="foot-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/reglement">Règlement</Link></li>
            <li><Link to="/inscription">Inscription</Link></li>
            <li><Link to="/scoreboard">Scoreboard live</Link></li>
            <li><Link to="/cgu-confidentialite">CGU &amp; Politique de Confidentialité</Link></li>
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
        <span>Site réalisé par des étudiants d'EPITECH</span>
        <span id="year-tag">Édition N°15 · Yutz, Moselle</span>
      </div>
    </footer>
  );
}

export function FooterCompact() {
  return (
    <footer>
      <div
        className="foot-inner"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div className="b">
          TECHNO<span className="red">BOT</span> · 2026
        </div>
        <div className="links">
          <Link to="/">Accueil</Link>
          <Link to="/reglement">Règlement</Link>
          <Link to="/inscription">Inscription</Link>
          <Link to="/scoreboard">Scoreboard</Link>
          <Link to="/cgu-confidentialite">CGU &amp; Confidentialité</Link>
        </div>
        <div className="meta">
          © 2026 Tech Tic &amp; Co · Marque déposée · Site réalisé par des
          étudiants d'EPITECH
        </div>
      </div>
    </footer>
  );
}

export function FooterScoreboard() {
  return (
    <footer>
      <div
        className="foot-inner"
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>TECHNOBOT 2026 · Scoreboard live · Affichage salle</span>
        <span>
          <Link to="/">Accueil</Link> · <Link to="/reglement">Règlement</Link> ·{' '}
          <Link to="/inscription">Inscription</Link> ·{' '}
          <Link to="/cgu-confidentialite">CGU &amp; Confidentialité</Link> · Site
          réalisé par des étudiants d'EPITECH
        </span>
      </div>
    </footer>
  );
}
