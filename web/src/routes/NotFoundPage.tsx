import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main>
      <h1>Page introuvable</h1>
      <p>Cette route n'existe pas dans l'application Technobot.</p>
      <p>
        <Link to="/">Retour accueil</Link>
      </p>
      <p>
        <Link to="/login">Connexion / inscription</Link>
      </p>
    </main>
  );
}
