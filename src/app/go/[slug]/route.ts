import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Récupérer les infos du broker
  const { data } = await supabase
    .from('brokers')
    .select('affiliate_url, name')
    .eq('slug', slug)
    .single();

  if (!data?.affiliate_url) {
    return NextResponse.redirect(new URL('/dashboard/courtiers', request.url));
  }

  // Lire la source depuis le query param (?src=card|detail|overview|compare|ia)
  const source = request.nextUrl.searchParams.get('src') || 'direct';

  // Enregistrer le clic en base (fire-and-forget — ne bloque pas la redirection)
  supabase
    .from('affiliate_clicks')
    .insert({ broker_id: slug, broker_name: data.name, source })
    .then(() => {}) // ignoré intentionnellement
    .catch(() => {}); // silencieux — le tracking ne doit jamais bloquer l'UX

  return NextResponse.redirect(data.affiliate_url);
}
