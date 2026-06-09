import type { Metadata } from 'next';

import { MessagingHub } from '@/components/account/MessagingHub';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Messagerie',
  description: 'Échangez des messages avec les artisans Slito.',
};

type SearchParams = Promise<{ businessId?: string | string[]; businessName?: string | string[] }>;

/**
 * Lit les paramètres `?businessId=` et `?businessName=` pour pré-initier
 * une conversation depuis une fiche entreprise. `businessId` doit être un entier
 * positif ; `businessName` est facultatif (affiché tel quel, max 100 chars).
 */
function parseParams(raw: { businessId?: string | string[]; businessName?: string | string[] }): {
  initialBusinessId?: number;
  initialBusinessName?: string;
} {
  const rawId = Array.isArray(raw.businessId) ? raw.businessId[0] : raw.businessId;
  const parsedId = rawId ? Number(rawId) : NaN;
  const initialBusinessId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined;

  const rawName = Array.isArray(raw.businessName) ? raw.businessName[0] : raw.businessName;
  const initialBusinessName =
    rawName && rawName.length > 0 && rawName.length <= 100 ? rawName : undefined;

  return { initialBusinessId, initialBusinessName };
}

export default async function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  const { initialBusinessId, initialBusinessName } = parseParams(await searchParams);

  return (
    // Accessible à tout utilisateur connecté : clients (ROLE_CUSTOMER) et artisans
    // (ROLE_ARTISAN) peuvent tous deux participer à des conversations.
    <RouteGuard>
      <div className="flex min-h-0 flex-1 px-4 py-6 sm:px-6">
        <MessagingHub
          initialBusinessId={initialBusinessId}
          initialBusinessName={initialBusinessName}
        />
      </div>
    </RouteGuard>
  );
}
