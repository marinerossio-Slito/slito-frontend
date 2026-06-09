import type { Metadata } from 'next';

import { BackLink } from '@/components/BackLink';
import { UserManager } from '@/components/admin/UserManager';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Gestion des utilisateurs',
  description: 'Approuver les artisans, bannir ou réactiver des comptes.',
};

export default function AdminUsersPage() {
  return (
    <RouteGuard roles={['ROLE_ADMIN']}>
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <header className="mb-8">
          <BackLink href="/admin" label="Administration" />
          <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">Utilisateurs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Validez les comptes artisans et gérez les suspensions.
          </p>
        </header>
        <UserManager />
      </div>
    </RouteGuard>
  );
}
