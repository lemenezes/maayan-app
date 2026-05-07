import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey !== 'your-anon-key-here';
