import Link from 'next/link';

import { RatingBadge } from '@/components/RatingBadge';
import { formatPrice } from '@/lib/format';
import type { BusinessSummary } from '@/types/catalog';

/**
 * Carte de présentation d'une entreprise dans une liste (accueil, recherche).
 *
 * Design :
 * - Zone de couverture sable avec emoji de catégorie + badge gold
 * - Corps : nom en Playfair Display, note en gold, prix
 */
export function BusinessCard({ business }: { business: BusinessSummary }) {
  return (
    <Link
      href={`/entreprises/${business.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-warm-white transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_12px_48px_rgba(26,21,16,0.18)]"
    >
      {/* Zone de couverture */}
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-sand to-sand-light text-5xl">
        {business.category?.icon ?? '🔨'}
        {business.category && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-white">
            {business.category.name}
          </span>
        )}
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="font-serif text-lg font-semibold text-ink">{business.name}</p>
          {business.headline && (
            <p className="mt-0.5 text-sm text-ink-light">{business.headline}</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <RatingBadge
            averageRating={business.averageRating}
            reviewsCount={business.reviewsCount}
          />
          {business.priceFrom !== null && (
            <span className="text-ink-mid">
              Dès{' '}
              <span className="font-semibold text-ink">{formatPrice(business.priceFrom)}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
