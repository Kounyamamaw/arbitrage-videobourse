import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data } = await supabaseAdmin
    .from('brokers')
    .select('demo_url, name')
    .eq('slug', slug)
    .single();

  if (!data?.demo_url) {
    return NextResponse.redirect(new URL('/comparatif/dashboard/courtiers', request.url));
  }

  // Source préfixée 'demo-' pour distinguer des clics affiliés dans le tracking
  const rawSrc = request.nextUrl.searchParams.get('src') || '';
  const source = rawSrc.startsWith('demo') ? rawSrc : `demo-${rawSrc || 'direct'}`;

  try {
    await supabaseAdmin.from('affiliate_clicks').insert({
      broker_id:   slug,
      broker_name: data.name,
      source,
    });
  } catch (err) {
    console.error('Demo tracking error:', err);
  }

  return NextResponse.redirect(data.demo_url);
}