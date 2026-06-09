import type { Metadata } from 'next';

import { BackLink } from '@/components/BackLink';
import { DashboardPanel } from '@/components/artisan/DashboardPanel';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Tableau de bord artisan',
  description: 'Vos revenus, statistiques et indicateurs d\'activité.',
};

export default function ArtisanDashboardPage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <header className="mb-8">
          <BackLink href="/artisan" label="Espace artisan" />
          <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vos revenus, statistiques de rendez-vous et note moyenne.
          </p>
        </header>
        <DashboardPanel />
      </div>
    </RouteGuard>
  );
}
