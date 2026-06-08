import Link from 'next/link';

import type { ArtisanCategory } from '@/types/catalog';

/**
 * Vignette de catégorie de métier, affichée sur l'accueil et utilisable comme
 * point d'entrée vers la recherche filtrée (`/recherche?category=<slug>`,
 * cf. CatalogController::search côté back-end).
 */
export function CategoryCard({ category }: { category: ArtisanCategory }) {
  return (
    <Link
      href={`/recherche?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl transition group-hover:bg-amber-100">
        {category.icon ?? '🛠️'}
      </span>
      <span className="font-medium text-zinc-800">{category.name}</span>
    </Link>
  );
}
