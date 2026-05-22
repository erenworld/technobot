export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const SUPABASE_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY: string | undefined =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const CURRENT_EDITION_ID: string | undefined =
  import.meta.env.VITE_CURRENT_EDITION_ID;

export const SCOREBOARD_POLL_MS: number = Number(
  import.meta.env.VITE_SCOREBOARD_POLL_MS ?? 10_000,
);
