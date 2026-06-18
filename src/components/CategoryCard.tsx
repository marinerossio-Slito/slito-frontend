'use client';

import Link from 'next/link';

import { categoryIcon } from '@/lib/categoryIcon';
import type { ArtisanCategory } from '@/types/catalog';

/**
 * Vignette de catégorie — accueil.
 * Design : fond crème garanti par inline style, bordure sable, hover terra.
 * `count` = nombre d'artisans dans la catégorie (optionnel).
 */
export function CategoryCard({
  category,
  count,
}: {
  category: ArtisanCategory;
  count?: number;
}) {
  return (
    <Link
      href={`/recherche?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border-[1.5px] p-6 text-center transition hover:-translate-y-0.5"
      style={{
        backgroundColor: '#fdfaf3',
        borderColor: '#e8dcc8',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c56339';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(196,97,58,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8dcc8';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
      }}
    >
      <span className="block text-5xl leading-none">{categoryIcon(category.icon)}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#334534' }}>
          {category.name}
        </p>
        {count !== undefined && (
          <p className="mt-0.5 text-xs" style={{ color: '#7a9478' }}>
            {count} artisan{count > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
