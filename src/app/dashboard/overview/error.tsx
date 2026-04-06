'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Erreur de chargement du tableau de bord</p>
      <button onClick={reset} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Réessayer</button>
    </div>
  );
}
