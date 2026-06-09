import type { Metadata } from 'next';

import { BackLink } from '@/components/BackLink';
import { StatsPanel } from '@/components/admin/StatsPanel';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Statistiques plateforme',
  description: 'KPIs globaux de la plateforme Slito.',
};

export default function AdminStatsPage() {
  return (
    <RouteGuard roles={['ROLE_ADMIN']}>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <header className="mb-8">
          <BackLink href="/admin" label="Administration" />
          <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">
            Statistiques plateforme
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Données en temps réel sur les utilisateurs, réservations et revenus.
          </p>
        </header>
        <StatsPanel />
      </div>
    </RouteGuard>
  );
}
