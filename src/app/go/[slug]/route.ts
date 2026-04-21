import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Récupérer les infos du broker
  const { data } = await supabaseAdmin
    .from('brokers')
    .select('affiliate_url, name')
    .eq('slug', slug)
    .single();

  if (!data?.affiliate_url) {
    return NextResponse.redirect(new URL('/comparatif/dashboard/courtiers', request.url));
  }

  // 2. Lire la source depuis le query param
  const source = request.nextUrl.searchParams.get('src') || 'direct';

  // 3. Enregistrer le clic via service_role (contourne RLS)
  try {
    const { error } = await supabaseAdmin
      .from('affiliate_clicks')
      .insert({ 
        broker_id: slug, 
        broker_name: data.name, 
        source 
      });
    if (error) console.error('Tracking insert error:', error.message);
  } catch (err) {
    console.error('Tracking error:', err);
  }

  // 4. Redirection
  return NextResponse.redirect(data.affiliate_url);
}