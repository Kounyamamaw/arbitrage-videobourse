import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">L'arbitrage souhaité n'est plus disponible.</p>
      <Link href="/dashboard/overview" className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
