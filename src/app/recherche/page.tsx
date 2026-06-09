import type { Metadata } from 'next';
import Link from 'next/link';

import { EmptyState } from '@/components/EmptyState';
import { RatingBadge } from '@/components/RatingBadge';
import { fetchCategories, parseSearchFilters, searchBusinesses, type RawSearchParams } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import type { ArtisanCategory, BusinessSummary, SearchFilters } from '@/types/catalog';

export const metadata: Metadata = {
  title: 'Trouver un artisan',
  description:
    "Recherchez un artisan par métier, ville, budget ou note moyenne et accédez directement aux fiches qui vous intéressent.",
};

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const filters = parseSearchFilters(await searchParams);
  const [categories, businesses] = await Promise.all([fetchCategories(), searchBusinesses(filters)]);

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Page hero ──────────────────────────────────────────────────────── */}
      <div
        className="border-b border-sand bg-sand-light px-8 py-10"
        style={{ backgroundColor: '#F2E8D5' }}
      >
        <nav aria-label="Fil d'Ariane" className="mb-3 text-sm text-ink-light">
          <Link href="/" className="text-terra hover:underline">Accueil</Link>
          {' '}›{' '}
          <span className="text-ink-mid">Résultats</span>
        </nav>
        <h1 className="mb-4 font-serif text-3xl font-bold text-ink">Trouver un artisan</h1>
        <form
          method="get"
          className="flex max-w-2xl items-center gap-2 rounded-xl border border-sand bg-warm-white p-2"
          style={{ backgroundColor: '#FFFDF9' }}
        >
          <input
            name="category"
            type="text"
            placeholder="Plombier, électricien..."
            defaultValue={filters.category ?? ''}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none"
            style={{ color: '#2D4A3E' }}
          />
          <div className="h-6 w-px bg-sand" aria-hidden />
          <input
            name="city"
            type="text"
            placeholder="📍 Ville"
            defaultValue={filters.city ?? ''}
            className="bg-transparent px-4 py-2.5 text-sm focus:outline-none"
            style={{ color: '#2D4A3E', minWidth: '130px' }}
          />
          <button
            type="submit"
            className="rounded-lg bg-terra px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark"
            style={{ backgroundColor: '#C4613A' }}
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* ── Mise en page deux colonnes ─────────────────────────────────────── */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-8 py-8 lg:grid-cols-[280px_1fr]">
        {/* ── Sidebar filtres ─────────────────────────────────────────────── */}
        <aside
          className="hidden rounded-2xl border border-sand bg-warm-white p-6 lg:block"
          style={{ height: 'fit-content', position: 'sticky', top: '80px' }}
        >
          <SidebarFilters categories={categories} filters={filters} />
        </aside>

        {/* ── Résultats ────────────────────────────────────────────────────── */}
        <div>
          {/* En-tête compteur */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-ink-mid">
              {businesses.length === 0 ? (
                'Aucun résultat'
              ) : (
                <>
                  <strong className="text-ink">{businesses.length}</strong>{' '}
                  {businesses.length === 1 ? 'artisan trouvé' : 'artisans trouvés'}
                </>
              )}
            </p>
          </div>

          {/* Filtre mobile : version compacte au-dessus des résultats */}
          <details className="mb-5 rounded-xl border border-sand bg-warm-white p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              ⚙️ Filtres de recherche
            </summary>
            <div className="mt-4">
              <SidebarFilters categories={categories} filters={filters} />
            </div>
          </details>

          {businesses.length === 0 ? (
            <EmptyState message="Aucune entreprise ne correspond à ces critères. Essayez d'élargir votre recherche." />
          ) : (
            <div className="flex flex-col gap-4">
              {businesses.map((business) => (
                <SearchResultCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Composants internes ───────────────────────────────────────────────────── */

function SidebarFilters({
  categories,
  filters,
}: {
  categories: ArtisanCategory[];
  filters: SearchFilters;
}) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <form method="get" className="flex flex-col gap-6">
      <h3 className="font-serif text-xl font-bold text-ink">Filtres</h3>

      {/* Métier */}
      <FilterGroup label="Métier">
        <select
          name="category"
          defaultValue={filters.category ?? ''}
          className="w-full rounded-lg border border-sand bg-warm-white px-3 py-2.5 text-sm text-ink focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20"
        >
          <option value="">Tous les métiers</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      {/* Ville */}
      <FilterGroup label="Ville">
        <input
          type="text"
          name="city"
          placeholder="ex. Lyon"
          defaultValue={filters.city ?? ''}
          className="w-full rounded-lg border border-sand bg-warm-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-light focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20"
        />
      </FilterGroup>

      {/* Prix */}
      <FilterGroup label="Tarif (€)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            defaultValue={filters.minPrice ?? ''}
            className="w-full rounded-lg border border-sand bg-warm-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-light focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20"
          />
          <span className="shrink-0 text-ink-light">–</span>
          <input
            type="number"
            name="maxPrice"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            defaultValue={filters.maxPrice ?? ''}
            className="w-full rounded-lg border border-sand bg-warm-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-light focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20"
          />
        </div>
      </FilterGroup>

      {/* Note minimale */}
      <FilterGroup label="Note minimale">
        <div className="flex flex-wrap gap-2">
          {[undefined, 3, 4].map((rating) => {
            const label = rating === undefined ? 'Toutes' : `★ ${rating}+`;
            const value = rating !== undefined ? String(rating) : '';
            const current = filters.minRating !== undefined ? String(filters.minRating) : '';
            const isSelected = value === current;
            return (
              <button
                key={label}
                type="submit"
                name="minRating"
                value={value}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-sand bg-warm-white text-ink-mid hover:border-gold hover:text-gold'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <button
        type="submit"
        className="w-full rounded-full bg-terra py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark"
        style={{ backgroundColor: '#C4613A' }}
      >
        Appliquer
      </button>

      {hasActiveFilters && (
        <Link
          href="/recherche"
          className="text-center text-sm font-medium text-ink-light transition hover:text-ink-mid"
        >
          Réinitialiser les filtres
        </Link>
      )}
    </form>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-light">{label}</p>
      {children}
    </div>
  );
}

function SearchResultCard({ business }: { business: BusinessSummary }) {
  return (
    <Link
      href={`/entreprises/${business.id}`}
      className="group flex gap-5 rounded-2xl border border-sand bg-warm-white p-5 transition hover:-translate-x-0 hover:border-transparent hover:shadow-[0_4px_24px_rgba(196,97,58,0.12)] hover:translate-x-1"
    >
      {/* Avatar circle */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sand text-4xl"
        aria-hidden
      >
        {business.category?.icon ?? '🔨'}
      </div>

      {/* Info principale */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div>
          <p className="font-serif text-xl font-semibold text-ink">{business.name}</p>
          {business.category && (
            <p className="text-[13px] font-medium uppercase tracking-wider text-terra">
              {business.category.name}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <RatingBadge averageRating={business.averageRating} reviewsCount={business.reviewsCount} />
          {business.officeAddress && (
            <span className="text-sm text-ink-light">📍 {business.officeAddress}</span>
          )}
        </div>

        {business.headline && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-mid">{business.headline}</p>
        )}
      </div>

      {/* Prix + CTA */}
      <div className="hidden shrink-0 flex-col items-end justify-between gap-3 sm:flex">
        {business.priceFrom !== null ? (
          <div className="text-right">
            <p className="text-xs text-ink-light">À partir de</p>
            <p className="font-serif text-2xl font-bold text-ink">{formatPrice(business.priceFrom)}</p>
          </div>
        ) : (
          <div />
        )}
        <span className="rounded-full border border-sand bg-sand-light px-4 py-1.5 text-xs font-medium text-forest transition group-hover:border-forest">
          Voir la fiche →
        </span>
      </div>
    </Link>
  );
}
