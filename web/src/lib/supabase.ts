import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config';

export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_PUBLISHABLE_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!)
  : null;
