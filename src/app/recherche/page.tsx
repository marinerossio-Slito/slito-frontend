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

// Le contenu dépend à la fois de l'API (résultats de recherche, qui évoluent)
// et de `searchParams` (filtres saisis par l'utilisateur) : la page est donc
// nécessairement rendue à la demande. La lecture de `searchParams` suffit en
// principe à déclencher le rendu dynamique (cf. docs Next 16, « Rendering with
// search params »), mais on le rend explicite ici, par cohérence avec
// `app/page.tsx` et pour éviter toute tentative de prérendu au build.
export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const filters = parseSearchFilters(await searchParams);

  const [categories, businesses] = await Promise.all([fetchCategories(), searchBusinesses(filters)]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Trouver un artisan</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          Affinez votre recherche par métier, ville, budget ou note moyenne pour trouver le professionnel qui
          correspond le mieux à votre besoin.
        </p>
      </header>

      <SearchFiltersForm categories={categories} filters={filters} />

      <div className="mt-8 mb-4 flex items-baseline justify-between">
        <p className="text-sm text-zinc-500">
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
