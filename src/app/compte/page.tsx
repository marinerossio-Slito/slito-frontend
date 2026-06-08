import type { Metadata } from 'next';

import { RouteGuard } from '@/components/RouteGuard';
import { SpacePlaceholder } from '@/components/SpacePlaceholder';

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Gérez vos rendez-vous, vos messages et vos avis depuis votre espace personnel Slito.',
};

// Pas de restriction de rôle : `/compte` est l'espace personnel de tout
// utilisateur connecté (la messagerie, par ex., est partagée entre clients et
// artisans — cf. ARCHITECTURE.md, tableau des pages prévues, `/compte/messages`
// listé « Client/Artisan »).
export default function AccountPage() {
  return (
    <RouteGuard>
      <SpacePlaceholder
        title="Mon compte"
        description="Vos rendez-vous, vos avis et vos conversations s'afficheront ici (cf. ARCHITECTURE.md, étapes 4 « Espace client — réservation » et 5 « Messagerie »)."
      />
    </RouteGuard>
  );
}
