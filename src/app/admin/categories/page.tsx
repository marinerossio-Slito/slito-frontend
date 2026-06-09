import type { Metadata } from 'next';

import { CategoryManager } from '@/components/admin/CategoryManager';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Gestion des catégories',
  description: 'Créez et gérez les catégories de métiers artisanaux.',
};

export default function AdminCategoriesPage() {
  return (
    <RouteGuard roles={['ROLE_ADMIN']}>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <header className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Catégories</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Les catégories permettent aux clients de filtrer les artisans par métier.
          </p>
        </header>
        <CategoryManager />
      </div>
    </RouteGuard>
  );
}
