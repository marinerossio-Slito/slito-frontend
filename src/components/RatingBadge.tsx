/**
 * Affiche la note moyenne et le nombre d'avis d'une entreprise (ou un message
 * neutre si elle n'a pas encore reçu d'avis).
 *
 * L'étoile est affichée en gold (couleur de la charte Slito).
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
    return (
      <span className={size === 'lg' ? 'text-base text-ink-light' : 'text-sm text-ink-light'}>
        Pas encore d&apos;avis
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={size === 'lg' ? 'text-xl font-semibold text-ink' : 'font-semibold text-ink'}>
        <span className="text-gold">★</span> {averageRating.toFixed(1)}
      </span>
      <span className={size === 'lg' ? 'text-base text-ink-light' : 'text-sm text-ink-light'}>
        ({reviewsCount} avis)
      </span>
    </span>
  );
}
