import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthMode, AuthState } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<AuthState>({
    email: '',
    password: '',
    message: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/');
      }
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setForm((current) => ({
        ...current,
        message: null,
        error: 'Supabase is not configured.',
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      message: null,
      error: null,
      loading: true,
    }));

    const { data, error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          })
        : await supabase.auth.signUp({
            email: form.email,
            password: form.password,
          });

    if (error) {
      setForm((current) => ({
        ...current,
        message: null,
        error: error.message,
        loading: false,
      }));
      return;
    }

    if (mode === 'register' && !data.session) {
      setForm((current) => ({
        ...current,
        password: '',
        message: 'Compte cree. Verifie tes emails pour confirmer ton compte.',
        error: null,
        loading: false,
      }));
      return;
    }

    navigate('/');
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setForm((current) => ({
      ...current,
      message: null,
      error: null,
    }));
  }

  return (
    <main>
      <h1>{mode === 'login' ? 'Connexion Technobot' : 'Inscription Technobot'}</h1>
      <p>Acces organisateur pour suivre les donnees du projet.</p>

      <div>
        <button
          type="button"
          onClick={() => switchMode('login')}
          disabled={mode === 'login'}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          disabled={mode === 'register'}
        >
          Inscription
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            required
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            required
          />
        </div>

        {form.message && <p>{form.message}</p>}
        {form.error && <p>{form.error}</p>}

        <button type="submit" disabled={form.loading}>
          {form.loading
            ? mode === 'login'
              ? 'Connexion...'
              : 'Inscription...'
            : mode === 'login'
              ? 'Se connecter'
              : "S'inscrire"}
        </button>
      </form>

      <p>
        <Link to="/">Retour API</Link>
      </p>
    </main>
  );
}
