import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthState } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthState>({
    email: '',
    password: '',
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
        error: 'Supabase is not configured.',
      }));
      return;
    }

    setForm((current) => ({ ...current, error: null, loading: true }));

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setForm((current) => ({
        ...current,
        error: error.message,
        loading: false,
      }));
      return;
    }

    navigate('/');
  }

  return (
    <main>
      <h1>Connexion Technobot</h1>
      <p>Acces organisateur pour suivre les donnees du projet.</p>

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

        {form.error && <p>{form.error}</p>}

        <button type="submit" disabled={form.loading}>
          {form.loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p>
        <Link to="/">Retour API</Link>
      </p>
    </main>
  );
}
