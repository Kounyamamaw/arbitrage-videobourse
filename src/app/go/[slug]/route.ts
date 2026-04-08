import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Récupérer les infos du broker
  const { data } = await supabase
    .from('brokers')
    .select('affiliate_url, name')
    .eq('slug', slug)
    .single();

  if (!data?.affiliate_url) {
    return NextResponse.redirect(new URL('/dashboard/courtiers', request.url));
  }

  // 2. Lire la source depuis le query param
  const source = request.nextUrl.searchParams.get('src') || 'direct';

  // 3. Enregistrer le clic (Version corrigée pour TypeScript)
  // On utilise un bloc try/catch simple au lieu de .then().catch()
  try {
    await supabase
      .from('affiliate_clicks')
      .insert({ 
        broker_id: slug, 
        broker_name: data.name, 
        source 
      });
  } catch (error) {
    // On log l'erreur en console pour le debug mais on ne bloque pas l'utilisateur
    console.error('Tracking error:', error);
  }

  // 4. Redirection
  return NextResponse.redirect(data.affiliate_url);
}