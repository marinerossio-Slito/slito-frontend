import Link from 'next/link';

import type { ArtisanCategory } from '@/types/catalog';

/**
 * Vignette de catégorie de métier, affichée sur l'accueil et utilisable comme
 * point d'entrée vers la recherche filtrée (`/recherche?category=<slug>`).
 * Design : fond warm-white, bordure sand, hover terracotta.
 */
export function CategoryCard({ category }: { category: ArtisanCategory }) {
  return (
    <Link
      href={`/recherche?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-sand bg-warm-white p-6 text-center transition hover:-translate-y-0.5 hover:border-terra hover:shadow-[0_4px_24px_rgba(196,97,58,0.12)]"
    >
      <span className="block text-4xl">{category.icon ?? '🛠️'}</span>
      <span className="text-sm font-medium text-ink-mid">{category.name}</span>
    </Link>
  );
}
