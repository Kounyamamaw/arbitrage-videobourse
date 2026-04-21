import PageContainer from '@/components/layout/page-container';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Broker } from '@/lib/brokers';
import { BrokerDetailClient } from '@/features/courtiers/components/BrokerDetailClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const CAT_LABELS: Record<string, string> = {
  broker:    "courtier bourse",
  neobanque: "néobanque",
  bank:      "banque",
  cfd:       "courtier CFD Forex",
  crypto:    "plateforme crypto",
  insurance: "assurance-vie",
};

async function getBroker(slug: string): Promise<Broker | null> {
  if (supabase) {
    const { data } = await supabase.from('brokers').select('*').eq('slug', slug).single();
    if (data) return data as unknown as Broker;
  }
  try {
    const all = ((await import('@/data/brokers.json')).default) as unknown as Broker[];
    return all.find((b) => b.slug === slug) || null;
  } catch { return null; }
}

// ── SEO dynamique par fiche intermédiaire ─────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const broker = await getBroker(slug);

  if (!broker) {
    return {
      title: 'Intermédiaire introuvable — Arbitrage by VideoBourse',
      description: 'Fiche intermédiaire non trouvée.',
    };
  }

  const catLabel = CAT_LABELS[broker.category] || broker.category;
  const title = `${broker.name} avis ${new Date().getFullYear()} — frais, commissions et comparatif | Arbitrage`;
  const description = `Avis complet sur ${broker.name} : frais de courtage, commissions, scores, régulation et comparatif avec les meilleurs ${catLabel}s. Fondé en ${broker.founded || 'N/A'} — ${broker.tagline}`;
  const url = `https://videobourse.fr/comparatif/dashboard/courtiers/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${broker.name} frais`,
      `${broker.name} avis`,
      `${broker.name} commissions`,
      `${broker.name} ${new Date().getFullYear()}`,
      `${broker.name} comparatif`,
      `${catLabel} frais`,
      `comparateur ${catLabel}`,
      'courtier bourse france',
      'comparateur courtier',
      'arbitrage videobourse',
    ],
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: [
        {
          url: (broker as any).logo_url || 'https://framerusercontent.com/images/cB9wgyzc0EYXTdSFxeCpMyXx7zg.png',
          width: 1200,
          height: 630,
          alt: `${broker.name} — Arbitrage by VideoBourse`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [(broker as any).logo_url || 'https://framerusercontent.com/images/cB9wgyzc0EYXTdSFxeCpMyXx7zg.png'],
    },
    alternates: {
      canonical: url,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function BrokerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let broker: Broker | null = null;
  let allBrokers: Broker[] = [];

  if (supabase) {
    const { data } = await supabase.from('brokers').select('*').eq('slug', slug).single();
    if (data) broker = data as unknown as Broker;
    const { data: all } = await supabase.from('brokers').select('*').order('score_overall', { ascending: false });
    if (all) allBrokers = all as unknown as Broker[];
  }

  if (!broker) {
    try {
      const brokersData = ((await import('@/data/brokers.json')).default) as unknown as Broker[];
      broker = brokersData.find((b) => b.slug === slug) || null;
      allBrokers = brokersData;
    } catch { /* noop */ }
  }

  if (!broker) notFound();

  const catLabel = CAT_LABELS[broker.category] || broker.category;
  const url = `https://videobourse.fr/comparatif/dashboard/courtiers/${broker.slug}`;

  // ── JSON-LD Structured Data ─────────────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://videobourse.fr/comparatif/dashboard/courtiers' },
          { '@type': 'ListItem', position: 2, name: catLabel.charAt(0).toUpperCase() + catLabel.slice(1) + 's', item: `https://videobourse.fr/comparatif/dashboard/courtiers?category=${broker.category}` },
          { '@type': 'ListItem', position: 3, name: broker.name, item: url },
        ],
      },
      // FinancialProduct
      {
        '@type': 'FinancialProduct',
        name: broker.name,
        description: broker.tagline,
        url: broker.website || url,
        provider: {
          '@type': 'Organization',
          name: broker.name,
          url: broker.website,
        },
        ...(broker.founded ? { foundingDate: String(broker.founded) } : {}),
        ...(broker.regulation?.length ? {
          regulatoryStatus: broker.regulation.join(', '),
        } : {}),
        aggregateRating: broker.trustpilot_score && broker.trustpilot_count ? {
          '@type': 'AggregateRating',
          ratingValue: broker.trustpilot_score,
          bestRating: 5,
          worstRating: 1,
          ratingCount: broker.trustpilot_count,
        } : undefined,
      },
      // FAQPage — pros/cons as FAQ
      ...(broker.pros?.length || broker.cons?.length ? [{
        '@type': 'FAQPage',
        mainEntity: [
          ...(broker.pros?.slice(0, 3).map((pro: string) => ({
            '@type': 'Question',
            name: `Quel est un avantage de ${broker.name} ?`,
            acceptedAnswer: { '@type': 'Answer', text: pro },
          })) || []),
          ...(broker.cons?.slice(0, 2).map((con: string) => ({
            '@type': 'Question',
            name: `Quel est un inconvénient de ${broker.name} ?`,
            acceptedAnswer: { '@type': 'Answer', text: con },
          })) || []),
        ],
      }] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageContainer scrollable>
        <BrokerDetailClient broker={broker} allBrokers={allBrokers} />
      </PageContainer>
    </>
  );
}