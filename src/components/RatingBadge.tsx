/**
 * Affiche la note moyenne et le nombre d'avis d'une entreprise (ou un message
 * neutre si elle n'a pas encore reçu d'avis).
 *
 * L'étoile est affichée en gold (couleur de la charte Slito).
 * Deux tailles  : `sm` pour les listes (cartes), `lg` pour la fiche détaillée.
 * Deux variantes : `dark` (fond clair, défaut) et `light` (fond sombre, hero forest).
 */
export function RatingBadge({
  averageRating,
  reviewsCount,
  size = 'sm',
  variant = 'dark',
}: {
  averageRating: number | null;
  reviewsCount: number;
  size?: 'sm' | 'lg';
  variant?: 'dark' | 'light';
}) {
  const textMain = variant === 'light' ? 'text-white' : 'text-ink';
  const textMuted = variant === 'light' ? 'text-white/70' : 'text-ink-light';

  if (averageRating === null) {
    return (
      <span className={`${size === 'lg' ? 'text-base' : 'text-sm'} ${textMuted}`}>
        Pas encore d&apos;avis
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={`${size === 'lg' ? 'text-xl font-semibold' : 'font-semibold'} ${textMain}`}>
        <span className="text-gold">★</span> {averageRating.toFixed(1)}
      </span>
      <span className={`${size === 'lg' ? 'text-base' : 'text-sm'} ${textMuted}`}>
        ({reviewsCount} avis)
      </span>
    </span>
  );
}
