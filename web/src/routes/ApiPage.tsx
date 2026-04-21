import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { isSupabaseRealtimeConfigured, supabase } from '../lib/supabase';
import { ApiState, User } from '../types';
import { API_URL } from '../config';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function ApiPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [health, setHealth] = useState<ApiState<unknown>>({
    data: null,
    error: null,
    loading: true,
  });
  const [users, setUsers] = useState<ApiState<User[]>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchJson('/api/health')
      .then((data) => setHealth({ data, error: null, loading: false }))
      .catch((error: Error) =>
        setHealth({ data: null, error: error.message, loading: false }),
      );

    fetchJson<User[]>('/api/users')
      .then((data) => setUsers({ data, error: null, loading: false }))
      .catch((error: Error) =>
        setUsers({ data: null, error: error.message, loading: false }),
      );
  }, []);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const channel = client
      .channel('public-users-changes')
      .on<User>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          setUsers((current) => {
            const previousUsers = current.data ?? [];

            if (payload.eventType === 'INSERT') {
              return {
                data: [...previousUsers, payload.new],
                error: null,
                loading: false,
              };
            }

            if (payload.eventType === 'UPDATE') {
              return {
                data: previousUsers.map((user) =>
                  user.id === payload.new.id ? payload.new : user,
                ),
                error: null,
                loading: false,
              };
            }

            if (payload.eventType === 'DELETE') {
              return {
                data: previousUsers.filter(
                  (user) => user.id !== payload.old.id,
                ),
                error: null,
                loading: false,
              };
            }

            return current;
          });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <main>
      <h1>Technobot API</h1>
      <p>API URL: {API_URL}</p>

      <section>
        <h2>Authentification</h2>
        {session ? (
          <>
            <p>Connecte: {session.user.email}</p>
            <button type="button" onClick={handleLogout}>
              Se deconnecter
            </button>
          </>
        ) : (
          <p>
            <Link to="/login">Connexion / inscription</Link>
          </p>
        )}
      </section>

      <section>
        <h2>Health</h2>
        {health.loading && <p>Loading...</p>}
        {health.error && <p>Error: {health.error}</p>}
        {health.data !== null && (
          <pre>{JSON.stringify(health.data, null, 2)}</pre>
        )}
      </section>

      <section>
        <h2>Users</h2>
        <p>
          Realtime:{' '}
          {isSupabaseRealtimeConfigured ? 'configured' : 'missing env vars'}
        </p>
        {users.loading && <p>Loading...</p>}
        {users.error && <p>Error: {users.error}</p>}
        {users.data !== null && (
          <pre>{JSON.stringify(users.data, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}
