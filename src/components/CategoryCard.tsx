import Link from 'next/link';

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
        backgroundColor: '#FFFDF9',
        borderColor: '#E8D5B7',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#C4613A';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(196,97,58,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E8D5B7';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
      }}
    >
      <span className="block text-5xl leading-none">{category.icon ?? '🛠️'}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#2D4A3E' }}>
          {category.name}
        </p>
        {count !== undefined && (
          <p className="mt-0.5 text-xs" style={{ color: '#7A9E92' }}>
            {count} artisan{count > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
