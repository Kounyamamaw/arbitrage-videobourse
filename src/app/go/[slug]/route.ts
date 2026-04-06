import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data } = await supabase
    .from('brokers')
    .select('affiliate_url, name')
    .eq('slug', slug)
    .single();

  if (!data?.affiliate_url) {
    return NextResponse.redirect(new URL('/dashboard/courtiers', request.url));
  }

  console.log(`[Affiliate] Click → ${data.name} → ${data.affiliate_url}`);
  return NextResponse.redirect(data.affiliate_url);
}
