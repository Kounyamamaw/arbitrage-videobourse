import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// ── Brevo helper ───────────────────────────────────────────────────────────
// Pousse un contact dans Brevo (liste dédiée ArbitrAge Offres).
// Silencieux en cas d'échec — Supabase reste le backup.
// Variables d'environnement requises :
//   BREVO_API_KEY      → clé API Brevo (Settings > API Keys)
//   BREVO_LIST_ID      → ID numérique de la liste créée dans Brevo
async function pushToBrevo(email: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) return; // variables non configurées → skip silencieux

  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      apiKey,
    },
    body: JSON.stringify({
      email,
      listIds:       [parseInt(listId, 10)],
      updateEnabled: true, // met à jour si le contact existe déjà
    }),
  });
}

// GET — liste des inscrits (admin)
export async function GET() {
  const { data, error } = await supabase
    .from('offers_newsletter')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}

// POST — inscription newsletter (Supabase + Brevo en parallèle)
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const clean = email.toLowerCase().trim();

  // Déjà inscrit en base ?
  const { data: existing } = await supabase
    .from('offers_newsletter')
    .select('email')
    .eq('email', clean)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Vous êtes déjà inscrit !' }, { status: 409 });
  }

  // Insérer dans Supabase
  const { error } = await supabase
    .from('offers_newsletter')
    .insert({ email: clean });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Pousser vers Brevo en parallèle (sans bloquer la réponse)
  pushToBrevo(clean).catch(() => {}); // erreur silencieuse — Supabase est le backup

  return NextResponse.json({ success: true });
}

// DELETE — supprimer un inscrit
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase
    .from('offers_newsletter')
    .delete()
    .eq('id', Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}