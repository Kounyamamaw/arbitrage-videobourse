import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/admin/upload-logo
// body: FormData avec 'file' (image) et 'slug' (broker slug)
export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabaseAdmin as any;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string | null;

    if (!file || !slug) {
      return NextResponse.json({ error: 'Missing file or slug' }, { status: 400 });
    }

    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Extension du fichier
    const ext = file.name.split('.').pop() || 'png';
    const path = `logos/${slug}.${ext}`;

    // Upload dans Supabase Storage bucket "brokers"
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await sb.storage
      .from('brokers')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true, // écraser si existe déjà
      });

    if (uploadError) {
      // Si le bucket n'existe pas, retourner l'erreur avec instructions
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
        return NextResponse.json({
          error: 'Bucket "brokers" introuvable dans Supabase Storage. Créer le bucket "brokers" (public) dans Supabase → Storage.',
          details: uploadError.message,
        }, { status: 500 });
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Obtenir l'URL publique
    const { data: urlData } = sb.storage.from('brokers').getPublicUrl(path);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json({ error: 'Could not get public URL' }, { status: 500 });
    }

    // Mettre à jour logo_url dans la table brokers
    const { error: updateError } = await sb
      .from('brokers')
      .update({ logo_url: publicUrl })
      .eq('slug', slug);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ logo_url: publicUrl, success: true });
  } catch (err: unknown) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
