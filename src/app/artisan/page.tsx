import type { Metadata } from 'next';

import { ArtisanHub } from '@/components/artisan/ArtisanHub';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Espace artisan',
  description: 'Tableau de bord, agenda, fiche entreprise et abonnement.',
};

export default function ArtisanSpacePage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <ArtisanHub />
    </RouteGuard>
  );
}
