import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { FooterCompact } from '../components/Footer';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

type Mode = 'login' | 'register';

type LocationState = { from?: { pathname?: string } };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, session } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (session) {
    const from = (location.state as LocationState | null)?.from?.pathname ?? '/';
    navigate(from, { replace: true });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase n\'est pas configuré (VITE_SUPABASE_URL manquant).');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        const from = (location.state as LocationState | null)?.from?.pathname ?? '/';
        navigate(from, { replace: true });
      } else {
        const { needsConfirm } = await signUp(email, password);
        if (needsConfirm) {
          setInfo('Compte créé. Vérifie tes emails pour confirmer ton adresse.');
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />

      <header className="page-head">
        <div className="crumbs">
          <Link to="/">TECHNOBOT</Link>
          <span className="sep">/</span>
          <span>Connexion</span>
        </div>
      </header>

      <div className="form-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <main className="form-main" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="form-section active">
            <div className="form-section-head">
              <div className="form-section-eyebrow">
                // {mode === 'login' ? 'Connexion' : 'Inscription'}
              </div>
              <h2>{mode === 'login' ? 'Identifiants' : 'Vos infos'}</h2>
            </div>

            <div
              className="events-tabs"
              role="tablist"
              style={{ marginBottom: 28 }}
            >
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfo(null);
                }}
              >
                Se connecter
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'active' : ''}
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setInfo(null);
                }}
              >
                Créer un compte
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-row single">
                <div className="field">
                  <label htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@ac-nancy-metz.fr"
                  />
                </div>
              </div>

              <div className="field-row single">
                <div className="field">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="callout warn" style={{ marginTop: 16 }}>
                  <div className="callout-label">→ Erreur</div>
                  {error}
                </div>
              )}
              {info && (
                <div className="callout new" style={{ marginTop: 16 }}>
                  <div className="callout-label">→ Info</div>
                  {info}
                </div>
              )}

              <div className="form-nav" style={{ marginTop: 24 }}>
                <Link to="/" className="btn btn-ghost">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M11 6L5 12l6 6" />
                  </svg>
                  Retour
                </Link>
                <span className="step-indicator">
                  {mode === 'login' ? 'Identifiants requis' : 'Création de compte'}
                </span>
                <button type="submit" className="btn btn-primary next" disabled={loading}>
                  {loading
                    ? mode === 'login'
                      ? 'Connexion…'
                      : 'Création…'
                    : mode === 'login'
                      ? 'Se connecter'
                      : 'Créer le compte'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </form>

            <div
              style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: '1px solid var(--line)',
              }}
            >
              <div className="form-section-eyebrow" style={{ marginBottom: 12 }}>
                // Staff
              </div>
              <Link
                to="/admin"
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Accéder à l'interface admin
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </main>
      </div>

      <FooterCompact />
    </>
  );
}
