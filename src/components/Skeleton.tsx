/**
 * Primitives de chargement (« skeleton ») réutilisables.
 *
 * Remplace les `<div className="h-XX animate-pulse rounded-XX bg-sand-light" />`
 * répétés à l'identique dans `BookingPanel`, `MessagingHub`, `BusinessForm`,
 * `AgendaPanel`, etc. Composants serveur-compatibles (aucun hook, aucune
 * directive `'use client'` requise).
 */

/** Bloc rectangulaire pulsé — taille/forme contrôlées via `className`. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-sand-light ${className}`} />;
}

/** Pile de blocs identiques (ex. lignes de liste en cours de chargement). */
export function SkeletonStack({
  count,
  className = 'h-16',
  gap = 'gap-3',
}: {
  count: number;
  className?: string;
  gap?: string;
}) {
  return (
    <div className={`flex flex-col ${gap}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

/** Grille de blocs identiques (ex. cartes statistiques). */
export function SkeletonGrid({
  count,
  className = 'h-28',
  gridClassName = 'grid grid-cols-2 gap-4 lg:grid-cols-4',
}: {
  count: number;
  className?: string;
  gridClassName?: string;
}) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}
