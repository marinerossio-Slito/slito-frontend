import Link from 'next/link';

import type { ArtisanCategory, SearchFilters } from '@/types/catalog';

const RATING_OPTIONS = [4, 3, 2, 1];

const FIELD_CLASSES =
  'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100';

/**
 * Formulaire de filtrage de la recherche d'artisans (`/recherche`).
 *
 * Volontairement un simple `<form method="get">` plutôt qu'un formulaire
 * contrôlé en React : la page de recherche est un Server Component dont
 * l'état (les filtres) vit entièrement dans l'URL — soumettre le formulaire
 * déclenche une navigation classique vers `/recherche?...`, ce qui fonctionne
 * même sans JavaScript et garde l'URL partageable/marque-page-able.
 */
export function SearchFiltersForm({ categories, filters }: { categories: ArtisanCategory[]; filters: SearchFilters }) {
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return (
    <form method="get" className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Métier" htmlFor="category">
          <select id="category" name="category" defaultValue={filters.category ?? ''} className={FIELD_CLASSES}>
            <option value="">Tous les métiers</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ville" htmlFor="city">
          <input
            id="city"
            type="text"
            name="city"
            placeholder="ex. Lyon"
            defaultValue={filters.city ?? ''}
            className={FIELD_CLASSES}
          />
        </Field>

        <Field label="Prix min. (€)" htmlFor="minPrice">
          <input
            id="minPrice"
            type="number"
            name="minPrice"
            min={0}
            inputMode="numeric"
            placeholder="0"
            defaultValue={filters.minPrice ?? ''}
            className={FIELD_CLASSES}
          />
        </Field>

        <Field label="Prix max. (€)" htmlFor="maxPrice">
          <input
            id="maxPrice"
            type="number"
            name="maxPrice"
            min={0}
            inputMode="numeric"
            placeholder="200"
            defaultValue={filters.maxPrice ?? ''}
            className={FIELD_CLASSES}
          />
        </Field>

        <Field label="Note minimale" htmlFor="minRating">
          <select
            id="minRating"
            name="minRating"
            defaultValue={filters.minRating !== undefined ? String(filters.minRating) : ''}
            className={FIELD_CLASSES}
          >
            <option value="">Toutes les notes</option>
            {RATING_OPTIONS.map((rating) => (
              <option key={rating} value={rating}>
                ★ {rating} et plus
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Rechercher
        </button>
        {hasActiveFilters && (
          <Link href="/recherche" className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800">
            Réinitialiser les filtres
          </Link>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
      {label}
      {children}
    </label>
  );
}
