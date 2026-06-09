import type { Metadata } from 'next';

import { AdminHub } from '@/components/admin/AdminHub';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Administration',
  description: 'Statistiques de la plateforme, gestion des catégories et des comptes.',
};

export default function AdminSpacePage() {
  return (
    <RouteGuard roles={['ROLE_ADMIN']}>
      <AdminHub />
    </RouteGuard>
  );
}
