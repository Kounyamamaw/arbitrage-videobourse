import { getContent } from "@/lib/content";
export const revalidate = 60; // Revalidate content every 60 seconds
import Link from 'next/link';
import { IconChevronRight, IconChartBar, IconRobot, IconArrowsExchange, IconBolt, IconShield, IconWorld, IconCheck, IconX, IconArrowRight, IconStar } from '@tabler/icons-react';

const TOOLS = [
  { icon: IconBolt, title: 'Comparateur de courtiers', desc: 'Frais de courtage, droits de garde, frais de change, inactivité. Tous les intermédiaires analysés en profondeur.', href: '/dashboard/courtiers', accent: 'from-blue-500/10 to-blue-600/5' },
  { icon: IconRobot, title: 'Conseiller IA', desc: 'Posez n\'importe quelle question financière. Réponses sourcées sur nos données vérifiées.', href: '/dashboard/conseiller-ia', accent: 'from-violet-500/10 to-violet-600/5' },
  { icon: IconChartBar, title: 'Analyseur ETF', desc: 'TER, tracking différence, éligibilité PEA. Le combo optimal courtier × émetteur calculé pour vous.', href: '/dashboard/etf', accent: 'from-emerald-500/10 to-emerald-600/5' },
  { icon: IconArrowsExchange, title: 'Simulateur FIRE / DCA', desc: 'Visualisez l\'impact réel des frais sur 10, 20, 30 ans. La différence entre courtiers est vertigineuse.', href: '/dashboard/comparer', accent: 'from-amber-500/10 to-amber-600/5' },
];

// Stats are loaded dynamically from Supabase via getContent()
// Fallback values used if not set in admin

const VS_US = [
  'Coût total réel : courtage + garde + change + inactivité',
  'Comparateur ETF × courtier × émetteur — unique en France',
  'Simulateur FIRE / DCA intégré par courtier',
  'Conseiller IA avec données internes vérifiées',
  'Interface premium, 100% responsive',
  'Données sourcées et actualisées',
];

const VS_THEM = [
  'Frais de courtage uniquement',
  'Pas de comparaison ETF × courtier',
  'Aucune simulation personnalisée',
  'Classements influencés par les annonceurs',
  'Interface datée, mobile inutilisable',
  'Données statiques rarement mises à jour',
];

// Testimonials loaded dynamically from Supabase via getContent()

export default async function LandingPage() {
  const content = await getContent();
  return (
    <div className="force-light min-h-screen bg-background text-foreground">

      {/* ────── NAVBAR ────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-light.svg" alt="ArbitrAge" className="h-8 w-auto" style={{ imageRendering: "auto" }} />
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#outils" className="transition-colors hover:text-foreground">Outils</a>
            <a href="#comparaison" className="transition-colors hover:text-foreground">Pourquoi nous</a>
            <a href="#temoignages" className="transition-colors hover:text-foreground">Avis</a>
          </nav>
          <Link href="/dashboard/overview" className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">
            Accéder à l&apos;outil <span className="ml-1">→</span>
          </Link>
        </div>
      </header>

      {/* ────── HERO ────── */}
      <section className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[20%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[100px]" />
          <div className="absolute right-[10%] top-[40%] h-[300px] w-[300px] rounded-full bg-blue-400/[0.03] blur-[80px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {content.hero_badge}
        </div>

        <h1 className="max-w-4xl text-center text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.1] tracking-tight">
          {content.hero_title.includes('. ') ? content.hero_title.split('. ')[0] + '.' : content.hero_title}
          <br />
          <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
            {content.hero_title.includes('. ') ? content.hero_title.split('. ').slice(1).join('. ') : ''}
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-center text-lg leading-relaxed text-muted-foreground">
          ArbitrAge calcule le coût total réel de chaque courtier, chaque ETF, chaque enveloppe.
          Prenez enfin la <strong className="text-foreground">bonne décision</strong>.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/dashboard/courtiers" className="group flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
            Comparer gratuitement
            <IconChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/dashboard/conseiller-ia" className="flex h-12 items-center gap-2 rounded-xl border border-border px-8 text-sm font-medium transition-all hover:border-primary/30 hover:bg-muted">
            <IconRobot className="size-4" />
            Poser une question à l&apos;IA
          </Link>
        </div>

        {/* Segmentation rapide — qualification utilisateur */}
        <div className="mt-8 w-full max-w-2xl">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Je cherche à comparer…</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { icon: IconChartBar,       label: "Courtiers bourse",      sub: "PEA, CTO, actions, ETF",        href: "/dashboard/courtiers?category=broker"    },
              { icon: IconWorld,          label: "Banques & néobanques",   sub: "Compte courant, carte, épargne", href: "/dashboard/courtiers?category=bank"      },
              { icon: IconArrowsExchange, label: "Exchanges crypto",       sub: "Bitcoin, staking, DCA",          href: "/dashboard/courtiers?category=crypto"   },
            ].map(({ icon: Icon, label, sub, href }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-muted/50 backdrop-blur-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: content.stat_1_value || '12+', label: content.stat_1_label || 'Courtiers analysés' },
            { value: content.stat_2_value || '15', label: content.stat_2_label || 'ETF référencés' },
            { value: content.stat_3_value || '40K+', label: content.stat_3_label || 'Investisseurs VB' },
            { value: content.stat_4_value || '100%', label: content.stat_4_label || 'Indépendant' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-black tracking-tight text-foreground">{value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="mt-10">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Nos partenaires</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <a href="https://www.prorealtime.com/fr/interactive-brokers" target="_blank" rel="noopener noreferrer" className="opacity-70 transition-opacity hover:opacity-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/logo_prt.jpeg" alt="ProRealTime" className="h-9 w-auto object-contain rounded" />
            </a>
            <a href="https://www.ig.com/fr/application-form?region=fr&utm_medium=organic_social&utm_source=ig&utm_campaign=organic_social_tracking&product=upvstk-multiproduct&utm_marketing_tactic=acquisition&utm_creative_format=performancedisplayimage&utm_content=general&audience=prospecting" target="_blank" rel="noopener noreferrer" className="opacity-70 transition-opacity hover:opacity-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/logo_ig.png" alt="IG" className="h-9 w-auto object-contain" />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-border/50 p-1">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* ────── OUTILS ────── */}
      <section id="outils" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Fonctionnalités</span>
          </div>
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight md:text-4xl">
            Quatre outils qu&apos;aucun comparateur ne propose
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Pas des fonctionnalités de plus. Des fonctionnalités que personne d&apos;autre n&apos;a construites.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
            {TOOLS.map(({ icon: Icon, title, desc, href, accent }) => (
              <Link key={title} href={href}
                className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${accent} p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5`}>
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Découvrir <IconArrowRight className="size-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────── COMPARAISON ────── */}
      <section id="comparaison" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Comparaison</span>
          </div>
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight md:text-4xl">
            Ce que les autres ne font pas
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Them */}
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-8">
              <div className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Autres comparateurs</div>
              <div className="space-y-4">
                {VS_THEM.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
                      <IconX className="size-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Us */}
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-8 shadow-sm">
              <div className="mb-6 text-sm font-semibold uppercase tracking-wider text-primary">ArbitrAge</div>
              <div className="space-y-4">
                {VS_US.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <IconCheck className="size-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────── TÉMOIGNAGES ────── */}
      <section id="temoignages" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Témoignages</span>
          </div>
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight md:text-4xl">
            Ce que les investisseurs ont découvert
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: content.testimonial_1_name || 'Thomas R.', role: content.testimonial_1_role || 'Investisseur particulier', text: content.testimonial_1_text || 'ArbitrAge m\'a montré que je payais 180€ de frais de plus par an.', stars: 5 },
              { name: content.testimonial_2_name || 'Marie L.', role: content.testimonial_2_role || 'Investisseuse active PEA', text: content.testimonial_2_text || 'Enfin un outil qui calcule le coût total réel.', stars: 5 },
              { name: content.testimonial_3_name || 'Karim B.', role: content.testimonial_3_role || 'Investisseur passif', text: content.testimonial_3_text || 'Le Conseiller IA est plus précis que les forums.', stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} className="flex flex-col rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <IconStar key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{text}&rdquo;</p>
                <div className="mt-6 border-t border-border/50 pt-4">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-muted-foreground">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ────── CTA FINAL ────── */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-16 text-center text-background">
            {/* Subtle pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                {content.cta_title}
              </h2>
              <p className="mt-4 text-lg opacity-60">
                {content.cta_subtitle}
              </p>
              <Link href="/dashboard/courtiers"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-background px-12 text-lg font-bold text-foreground shadow-lg transition-all hover:shadow-xl">
                Lancer la comparaison
                <IconChevronRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/logo-light.svg" alt="ArbitrAge" className="h-5 w-auto" />
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/dashboard/courtiers" className="hover:text-foreground">Courtiers</Link>
              <Link href="/dashboard/etf" className="hover:text-foreground">ETF</Link>
              <Link href="/dashboard/conseiller-ia" className="hover:text-foreground">Conseiller IA</Link>
              <a href="https://videobourse.fr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">VideoBourse</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground/60">
            {content.footer_text}
          </div>
        </div>
      </footer>
    </div>
  );
}
