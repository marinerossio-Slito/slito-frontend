import type { Metadata } from 'next';

import { BusinessForm } from '@/components/artisan/BusinessForm';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Ma fiche entreprise',
  description: 'Gérez la présentation de votre entreprise sur Slito.',
};

export default function ArtisanFichePage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <header className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Ma fiche entreprise</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Ces informations sont visibles par tous les utilisateurs de Slito.
          </p>
        </header>
        <BusinessForm />
      </div>
    </RouteGuard>
  );
}
