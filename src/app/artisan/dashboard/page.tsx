import type { Metadata } from 'next';

import { DashboardPanel } from '@/components/artisan/DashboardPanel';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Tableau de bord artisan',
  description: 'Vos revenus, statistiques et indicateurs d\'activité.',
};

export default function ArtisanDashboardPage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <DashboardPanel />
    </RouteGuard>
  );
}
