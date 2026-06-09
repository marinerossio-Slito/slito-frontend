import Link from 'next/link';

import { RatingBadge } from '@/components/RatingBadge';
import { formatPrice } from '@/lib/format';
import type { BusinessSummary } from '@/types/catalog';

/**
 * Carte artisan — accueil & résultats.
 * Structure fidèle au HTML de référence :
 * cover (emoji) › corps (nom Playfair, métier terra, localisation, note + prix, créneaux)
 */
export function BusinessCard({ business }: { business: BusinessSummary }) {
  return (
    <Link
      href={`/entreprises/${business.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-warm-white transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_12px_48px_rgba(26,21,16,0.18)]"
    >
      {/* Zone de couverture */}
      <div className="relative flex h-36 items-center justify-center bg-sand text-5xl">
        {business.category?.icon ?? '🔨'}
        {business.category && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-white">
            ⭐ Top
          </span>
        )}
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col gap-0 p-4">
        {/* Ligne nom + note */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-serif text-lg font-semibold text-ink leading-tight">{business.name}</p>
            {business.category && (
              <p className="mt-0.5 text-[12px] font-medium uppercase tracking-[0.5px] text-terra">
                {business.category.name}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <RatingBadge
              averageRating={business.averageRating}
              reviewsCount={business.reviewsCount}
            />
          </div>
        </div>

        {/* Localisation */}
        {business.officeAddress && (
          <p className="mt-2 flex items-center gap-1 text-[13px] text-ink-light">
            <span aria-hidden>📍</span> {business.officeAddress}
          </p>
        )}

        {/* Créneaux fictifs (design) ou prix */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {business.priceFrom !== null ? (
            <span className="text-sm text-ink-mid">
              À partir de{' '}
              <span className="font-semibold text-ink">{formatPrice(business.priceFrom)}</span>
            </span>
          ) : (
            <span className="rounded-md border border-sand bg-sand-light px-2.5 py-1 text-[12px] font-medium text-forest">
              Devis gratuit
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
