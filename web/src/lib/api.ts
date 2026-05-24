import { API_URL } from '../config';
import { supabase } from './supabase';
import {
  Classements,
  ControleTechniquePayload,
  MatchSumo,
  PlanningSlot,
  Profile,
  Team,
} from '../types/api';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // ignore
    }
    throw new ApiError(
      response.status,
      `${response.status} ${response.statusText}`,
      body,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),

  teams: {
    list: (params?: Partial<Pick<Team, 'categorie' | 'epreuve' | 'statut' | 'edition_id'>>) => {
      const search = new URLSearchParams();
      if (params?.categorie) search.set('categorie', params.categorie);
      if (params?.epreuve) search.set('epreuve', params.epreuve);
      if (params?.statut) search.set('statut', params.statut);
      if (params?.edition_id) search.set('edition_id', params.edition_id);
      const qs = search.toString();
      return request<Team[]>(`/api/teams${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<Team>(`/api/teams/${id}`),
    /** Met à jour statut + notes_technique via l'endpoint de contrôle technique. */
    updateControleTechnique: (id: string, payload: ControleTechniquePayload) =>
      request<Team>(`/api/teams/${id}/controle-technique`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    /**
     * Supprime une équipe. ⚠ Le back n'expose pas encore `DELETE /api/teams/:id` —
     * cet appel échouera côté API tant que la route n'est pas ajoutée. L'UI
     * remontera l'erreur proprement (404 / 405).
     */
    delete: (id: string) =>
      request<void>(`/api/teams/${id}`, { method: 'DELETE' }),
  },

  classements: {
    get: (editionId: string) =>
      request<Classements>(`/api/classements/${editionId}`),
  },

  planning: {
    get: (editionId: string) =>
      request<PlanningSlot[]>(`/api/planning/${editionId}`),
  },

  matchsSumo: {
    list: (params?: { edition_id?: string; poule?: string; zone?: string; statut?: string }) => {
      const search = new URLSearchParams();
      if (params?.edition_id) search.set('edition_id', params.edition_id);
      if (params?.poule) search.set('poule', params.poule);
      if (params?.zone) search.set('zone', params.zone);
      if (params?.statut) search.set('statut', params.statut);
      const qs = search.toString();
      return request<MatchSumo[]>(`/api/matchs-sumo${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<MatchSumo>(`/api/matchs-sumo/${id}`),
  },

  users: {
    list: () => request<Profile[]>('/api/users'),
    get: (id: string) => request<Profile>(`/api/users/${id}`),
  },

  scores: {
    /**
     * Crée une note pour une équipe.
     * `endpoint` vaut design | presentation-colleges | presentation-lycees |
     * suivi-ligne ; le `payload` doit respecter le DTO correspondant côté back.
     */
    create: (endpoint: string, payload: Record<string, unknown>) =>
      request<{ id?: string }>(`/api/scores/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
