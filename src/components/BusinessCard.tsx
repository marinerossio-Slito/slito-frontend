import Link from 'next/link';

import { RatingBadge } from '@/components/RatingBadge';
import { formatPrice } from '@/lib/format';
import type { BusinessSummary } from '@/types/catalog';

/**
 * Carte de présentation d'une entreprise dans une liste (accueil, recherche).
 * Reflète les champs renvoyés par `serializeBusinessSummary` côté back-end.
 */
export function BusinessCard({ business }: { business: BusinessSummary }) {
  return (
    <Link
      href={`/entreprises/${business.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-900">{business.name}</p>
          {business.headline && <p className="text-sm text-zinc-500">{business.headline}</p>}
        </div>
        {business.category && (
          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            {business.category.name}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-2 text-sm text-zinc-600">
        <RatingBadge averageRating={business.averageRating} reviewsCount={business.reviewsCount} />
        {business.priceFrom !== null && (
          <span>
            Dès <span className="font-semibold text-zinc-900">{formatPrice(business.priceFrom)}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
