import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Route à appeler UNE FOIS pour ajouter les colonnes manquantes et recharger le schema cache
// GET /api/admin/migrate-schema
export async function GET() {
  const results: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabaseAdmin as any;

  // Liste des colonnes à ajouter si elles n'existent pas
  const migrations = [
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "categories" TEXT[] DEFAULT '{}'`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "score_envergure" NUMERIC(4,1) DEFAULT 0`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "score_support" NUMERIC(4,1) DEFAULT 0`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "logo_url" TEXT`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "is_partner" BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "partner_rank" INTEGER DEFAULT 999`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "demo_url" TEXT`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "level" TEXT`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "is_foreign" BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "provides_ifu" BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "has_dca" BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "has_fractions" BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "asset_classes" TEXT[] DEFAULT '{}'`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "platforms" TEXT[] DEFAULT '{}'`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "markets_available" TEXT[] DEFAULT '{}'`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "best_for" TEXT[] DEFAULT '{}'`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "welcome_offer" TEXT`,
    `ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "pricing_url" TEXT`,
    // Initialiser categories depuis category pour les lignes existantes
    `UPDATE public.brokers SET "categories" = ARRAY[category] WHERE "categories" = '{}' OR "categories" IS NULL`,
    // Forcer reload du schema cache PostgREST
    `NOTIFY pgrst, 'reload schema'`,
  ];

  for (const sql of migrations) {
    const { error } = await sb.rpc('exec_migration', { sql_query: sql }).single();
    if (error) {
      // Si la fonction RPC n'existe pas, essayer via l'API pg directement
      results.push(`⚠️ RPC unavailable for: ${sql.substring(0, 60)}... — ${error.message}`);
    } else {
      results.push(`✓ ${sql.substring(0, 80)}...`);
    }
  }

  return NextResponse.json({
    message: 'Migration terminée. Recharge la page et retente.',
    note: 'Si des erreurs ⚠️ apparaissent, exécute le SQL manuellement dans Supabase → SQL Editor',
    sql_to_run_manually: `
-- Coller dans Supabase → SQL Editor → Run
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "categories" TEXT[] DEFAULT '{}';
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "score_envergure" NUMERIC(4,1) DEFAULT 0;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "score_support" NUMERIC(4,1) DEFAULT 0;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "is_partner" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "partner_rank" INTEGER DEFAULT 999;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "demo_url" TEXT;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "level" TEXT;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "is_foreign" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "provides_ifu" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "has_dca" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "has_fractions" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "asset_classes" TEXT[] DEFAULT '{}';
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "platforms" TEXT[] DEFAULT '{}';
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "markets_available" TEXT[] DEFAULT '{}';
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "best_for" TEXT[] DEFAULT '{}';
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "welcome_offer" TEXT;
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS "pricing_url" TEXT;
UPDATE public.brokers SET "categories" = ARRAY[category] WHERE "categories" = '{}' OR "categories" IS NULL;
NOTIFY pgrst, 'reload schema';
    `,
    results,
  });
}
