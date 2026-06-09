import type { Metadata } from 'next';
import Link from 'next/link';

import { AppointmentList } from '@/components/account/AppointmentList';
import { BackLink } from '@/components/BackLink';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Mes rendez-vous',
  description: 'Suivez, annulez et notez vos prestations réservées sur Slito.',
};

export default function AppointmentsPage() {
  return (
    <RouteGuard roles={['ROLE_CUSTOMER']}>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BackLink href="/compte" label="Mon compte" />
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">Mes rendez-vous</h1>
            <p className="mt-1 text-zinc-500">
              Suivez l&apos;état de vos demandes, annulez ou laissez un avis.
            </p>
          </div>
          <Link
            href="/recherche"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Trouver un artisan
          </Link>
        </header>

        <AppointmentList />
      </div>
    </RouteGuard>
  );
}
