import Link from "next/link";
import { WaitlistForm } from "./waitlist-form";
import { WaitlistCount } from "./waitlist-count";

export const metadata = {
  title: "Combien vous coûte vraiment votre courtier ? Calculez vos frais cachés — Arbitrage by VideoBourse",
  description: "Droits de garde, frais de change, commissions cachées... La plupart des investisseurs paient des centaines d'euros de trop chaque année. Calculez vos vrais frais en 2 minutes.",
};

export default function WaitlistPage() {
  return (
    <div className="force-light min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/logo-light.svg" alt="ArbitrAge" className="h-6 w-auto" />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#fonctionnalites" className="transition-colors hover:text-foreground">Fonctionnalités</a>
            <a href="#roadmap" className="transition-colors hover:text-foreground">Roadmap</a>
            <a href="#communaute" className="transition-colors hover:text-foreground">Communauté</a>
          </nav>
          <a href="#hero" className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-all hover:opacity-90">
            Rejoindre
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 pt-14">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[15%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            By VideoBourse · 18 ans d&apos;expertise
          </div>

          <h1 className="text-[clamp(2rem,5.5vw,3.8rem)] font-black leading-[1.08] tracking-tight">
            Vous payez trop de frais.
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
              On vous montre combien.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            ArbitrAge calcule combien vous coûte réellement votre courtier par an — et combien vous économiseriez ailleurs.
            <strong className="text-foreground"> Chaque euro de frais en moins, c&apos;est un euro qui compose pour vous.</strong>
          </p>

          <div className="mx-auto mt-10 max-w-md">
            <WaitlistForm />
          </div>

          <div className="mt-6">
            <WaitlistCount />
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <span className="mb-4 block text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ce que vous allez économiser</span>
          <h2 className="mx-auto max-w-2xl text-center text-2xl font-bold tracking-tight md:text-3xl">Un outil conçu pour maximiser votre rendement net</h2>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { emoji: "🔍", title: "Vos frais cachés révélés", desc: "Droits de garde, frais de change, inactivité — la plupart des investisseurs ignorent qu'ils paient des centaines d'euros par an en frais invisibles. ArbitrAge les calcule pour vous." },
              { emoji: "🏆", title: "Le courtier qui vous fait gagner le plus", desc: "Chaque profil a son courtier optimal. 300€/mois en DCA ? 10 ordres par mois ? On vous dit où aller pour maximiser votre rendement net." },
              { emoji: "📈", title: "4 000€+ d'économies sur 20 ans", desc: "La différence entre deux courtiers sur un DCA long terme se chiffre en milliers d'euros. Des frais en moins, c'est du rendement composé en plus — chaque année." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border/50 bg-card p-7 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 text-3xl">{emoji}</div>
                <h3 className="mb-2 text-base font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <span className="mb-4 block text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Roadmap</span>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight md:text-3xl">Ce qu&apos;on construit</h2>
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-10">
              {[
                { status: "done", date: "Avril 2026", badge: "EN COURS", badgeClass: "bg-primary/10 text-primary", title: "Comparateur de courtiers & ETF", desc: "Calculez le coût réel total de chaque courtier selon votre profil. Trouvez le combo courtier × ETF le plus avantageux. Accès beta réservé aux inscrits waitlist." },
                { status: "soon", date: "Mai 2026", badge: "BIENTÔT", badgeClass: "bg-amber-500/10 text-amber-600", title: "Simulateur d'économies & Conseiller IA", desc: "Visualisez combien vous gagnez en changeant de courtier sur 10, 20, 30 ans. Posez vos questions à un conseiller IA alimenté par nos données vérifiées." },
                { status: "planned", date: "Été 2026", badge: "", badgeClass: "", title: "Actions, Options, Forex & Alertes", desc: "Extension à toutes les classes d'actifs. Alertes automatiques quand un courtier change ses tarifs ou qu'une meilleure option apparaît pour votre portefeuille." },
              ].map(({ status, date, badge, badgeClass, title, desc }) => (
                <div key={title} className="flex gap-5">
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card shadow-sm">
                    {status === "done" ? <div className="size-3.5 rounded-full bg-primary" />
                      : status === "soon" ? <div className="size-3.5 rounded-full border-2 border-primary" />
                      : <div className="size-3.5 rounded-full border-2 border-muted-foreground/30" />}
                  </div>
                  <div className="pb-2">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="text-xs font-semibold text-primary">{date}</span>
                      {badge && <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}>{badge}</span>}
                    </div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Communauté */}
      <section id="communaute" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <span className="mb-4 block text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Communauté</span>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight md:text-3xl">Rejoignez les premiers testeurs</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <a href="https://discord.gg/videobourse" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border/50 bg-card p-7 transition-all hover:border-primary/20 hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#5865F2]/10 text-xl">💬</div>
              <h3 className="mb-2 text-base font-semibold">Rejoignez le Discord VideoBourse</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Accédez au channel #arbitrage-beta. Testez avant tout le monde, remontez vos retours, influencez les prochaines fonctionnalités.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Rejoindre →</span>
            </a>
            <a href="https://youtube.com/@videobourse" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border/50 bg-card p-7 transition-all hover:border-primary/20 hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-red-500/10 text-xl">🎬</div>
              <h3 className="mb-2 text-base font-semibold">Suivez les coulisses</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">40 000+ investisseurs font confiance à VideoBourse depuis 18 ans. Retrouvez le projet et les coulisses sur YouTube et les réseaux.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Suivre →</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-14 text-center text-background">
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">Arrêtez de perdre de l&apos;argent en frais.</h2>
            <p className="mt-3 text-base opacity-60">Rejoignez la waitlist et soyez les premiers à savoir combien vous économisez.</p>
            <div className="mx-auto mt-8 max-w-sm">
              <WaitlistForm variant="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-light.svg" alt="ArbitrAge" className="h-5 w-auto" />
            <p className="text-sm text-muted-foreground">fabien@videobourse.fr</p>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground/50">© 2026 ArbitrAge by VideoBourse. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
