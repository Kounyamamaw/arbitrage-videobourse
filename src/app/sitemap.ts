import { MetadataRoute } from 'next';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const BASE = 'https://videobourse.fr/comparatif';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/waitlist`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/dashboard/courtiers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/dashboard/comparer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/dashboard/etf`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/dashboard/conseiller-ia`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Pages dynamiques — une URL par courtier
  let brokerPages: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from('brokers')
      .select('slug, updated_at, is_visible')
      .eq('is_visible', true)
      .order('score_overall', { ascending: false });

    if (data && data.length > 0) {
      brokerPages = data.map((b) => ({
        url: `${BASE}/dashboard/courtiers/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    }
  } catch {
    // Si Supabase inaccessible au build, on génère quand même les pages statiques
  }

  return [...staticPages, ...brokerPages];
}