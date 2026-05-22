/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_CURRENT_EDITION_ID?: string;
  readonly VITE_SCOREBOARD_POLL_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
