import type { Metadata } from 'next';

import { BusinessCard } from '@/components/BusinessCard';
import { EmptyState } from '@/components/EmptyState';
import { SearchFiltersForm } from '@/components/SearchFiltersForm';
import { fetchCategories, parseSearchFilters, searchBusinesses, type RawSearchParams } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Trouver un artisan',
  description:
    "Recherchez un artisan par métier, ville, budget ou note moyenne et accédez directement aux fiches qui vous intéressent.",
};

// Le contenu dépend à la fois de l'API et des `searchParams` : rendu dynamique.
export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const filters = parseSearchFilters(await searchParams);
  const [categories, businesses] = await Promise.all([fetchCategories(), searchBusinesses(filters)]);

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-12">
      {/* En-tête */}
      <header className="mb-8 border-b border-sand pb-8">
        <h1 className="font-serif text-3xl font-bold text-ink">Trouver un artisan</h1>
        <p className="mt-2 max-w-2xl text-ink-mid">
          Affinez votre recherche par métier, ville, budget ou note moyenne pour trouver le professionnel
          qui correspond le mieux à votre besoin.
        </p>
      </header>

      <SearchFiltersForm categories={categories} filters={filters} />

      {/* Compteur de résultats */}
      <div className="mb-4 mt-8 flex items-baseline justify-between">
        <p className="text-sm text-ink-light">
          {businesses.length === 0
            ? 'Aucun résultat'
            : businesses.length === 1
              ? '1 résultat'
              : `${businesses.length} résultats`}
        </p>
      </div>

      {businesses.length === 0 ? (
        <EmptyState message="Aucune entreprise ne correspond à ces critères pour le moment. Essayez d'élargir votre recherche." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
