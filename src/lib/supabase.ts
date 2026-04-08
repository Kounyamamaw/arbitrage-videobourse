import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Client public (lecture, côté client)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Client service_role (lecture + écriture sans RLS, côté serveur uniquement)
// Nécessaire pour les writes dans affiliate_clicks et les lectures admin
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey, // fallback sur anon si pas de service_role
  { auth: { persistSession: false } }
);