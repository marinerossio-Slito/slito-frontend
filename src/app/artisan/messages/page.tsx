import type { Metadata } from 'next';

import { MessagingHub } from '@/components/account/MessagingHub';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Messagerie',
  description: 'Échangez des messages avec vos clients Slito.',
};

/**
 * Messagerie de l'espace artisan. Réutilise le même `MessagingHub` que l'espace
 * client : le composant s'adapte au point de vue (un artisan voit le nom de ses
 * clients comme titre de conversation). Les conversations sont toujours initiées
 * par les clients depuis une fiche entreprise ; l'artisan répond ici.
 */
export default function ArtisanMessagesPage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <div className="flex min-h-0 flex-1 px-4 py-6 sm:px-6">
        <MessagingHub />
      </div>
    </RouteGuard>
  );
}
