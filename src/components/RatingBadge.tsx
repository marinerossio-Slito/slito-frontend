/**
 * Affiche la note moyenne et le nombre d'avis d'une entreprise (ou un message
 * neutre si elle n'a pas encore reçu d'avis). Reflète `averageRating`/
 * `reviewsCount` tels que renvoyés par `serializeBusinessSummary`.
 *
 * Deux tailles : `sm` pour les listes (cartes), `lg` pour la fiche détaillée.
 */
export function RatingBadge({
  averageRating,
  reviewsCount,
  size = 'sm',
}: {
  averageRating: number | null;
  reviewsCount: number;
  size?: 'sm' | 'lg';
}) {
  if (averageRating === null) {
    return <span className={size === 'lg' ? 'text-base text-zinc-400' : 'text-zinc-400'}>Pas encore d&apos;avis</span>;
  }

  return (
    <span>
      <span className={size === 'lg' ? 'text-lg font-semibold text-zinc-900' : 'font-semibold text-zinc-900'}>
        ★ {averageRating.toFixed(1)}
      </span>{' '}
      <span className={size === 'lg' ? 'text-base text-zinc-500' : 'text-zinc-400'}>({reviewsCount} avis)</span>
    </span>
  );
}
