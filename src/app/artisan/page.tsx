import type { Metadata } from 'next';

import { RouteGuard } from '@/components/RouteGuard';
import { SpacePlaceholder } from '@/components/SpacePlaceholder';

export const metadata: Metadata = {
  title: 'Espace artisan',
  description: 'Tableau de bord, agenda, fiche entreprise, clients et abonnement.',
};

export default function ArtisanSpacePage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <SpacePlaceholder
        title="Espace artisan"
        description="Votre tableau de bord, votre agenda, votre fiche, votre base clients et votre abonnement s'afficheront ici (cf. ARCHITECTURE.md, étape 6 « Espace artisan »)."
      />
    </RouteGuard>
  );
}
