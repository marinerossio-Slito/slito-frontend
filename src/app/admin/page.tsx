import type { Metadata } from 'next';

import { RouteGuard } from '@/components/RouteGuard';
import { SpacePlaceholder } from '@/components/SpacePlaceholder';

export const metadata: Metadata = {
  title: 'Administration',
  description: 'Statistiques de la plateforme, gestion des catégories et des comptes.',
};

export default function AdminSpacePage() {
  return (
    <RouteGuard roles={['ROLE_ADMIN']}>
      <SpacePlaceholder
        title="Administration"
        description="Les statistiques de la plateforme et la gestion des catégories et des comptes s'afficheront ici (cf. ARCHITECTURE.md, étape 7 « Espace admin »)."
      />
    </RouteGuard>
  );
}
