import type { Metadata } from 'next';

import { BackLink } from '@/components/BackLink';
import { SubscriptionPanel } from '@/components/artisan/SubscriptionPanel';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Mon abonnement',
  description: 'Gérez votre formule d\'abonnement Slito Pro.',
};

export default function ArtisanAbonnementPage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <header className="mb-8">
          <BackLink href="/artisan" label="Espace artisan" />
          <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">Mon abonnement</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gérez votre formule Slito Pro via le portail de paiement sécurisé Stripe.
          </p>
        </header>
        <SubscriptionPanel />
      </div>
    </RouteGuard>
  );
}
