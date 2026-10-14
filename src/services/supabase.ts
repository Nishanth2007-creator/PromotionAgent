import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;
if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Initialized with project:', new URL(supabaseUrl).host);
  } catch (error) {
    console.warn('[Supabase] Initialization error, falling back to local storage:', error);
    client = null;
  }
} else {
  console.info('[Quantix] Running in local offline-first persistence mode. Add Supabase credentials in .env to connect.');
}

export const supabase = client;

// Backward-compatible aliases used by older modules
export const isFirebaseConfigured = isSupabaseConfigured;
export const db = supabase;
