import type { Metadata } from 'next';

import { AccountHub } from '@/components/account/AccountHub';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Gérez vos rendez-vous, vos messages et vos avis depuis votre espace personnel Slito.',
};

// Pas de restriction de rôle : `/compte` est l'espace personnel de tout
// utilisateur connecté. Les sous-pages (rendez-vous, messagerie…) affinent
// l'accès selon le profil.
export default function AccountPage() {
  return (
    <RouteGuard>
      <AccountHub />
    </RouteGuard>
  );
}
