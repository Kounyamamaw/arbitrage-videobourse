'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-[250px] flex-col items-center justify-center gap-2">
      <p className="text-sm text-muted-foreground">Erreur de chargement</p>
      <button onClick={reset} className="text-xs text-primary hover:underline">Réessayer</button>
    </div>
  );
}
