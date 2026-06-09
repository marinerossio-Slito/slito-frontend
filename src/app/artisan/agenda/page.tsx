import type { Metadata } from 'next';

import { AgendaPanel } from '@/components/artisan/AgendaPanel';
import { RouteGuard } from '@/components/RouteGuard';

export const metadata: Metadata = {
  title: 'Agenda artisan',
  description: 'Vos rendez-vous à venir, à confirmer ou à annuler.',
};

export default function ArtisanAgendaPage() {
  return (
    <RouteGuard roles={['ROLE_ARTISAN']}>
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <header className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Agenda</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Rendez-vous en attente de confirmation et confirmés. Confirmez ou annulez directement depuis ici.
          </p>
        </header>
        <AgendaPanel />
      </div>
    </RouteGuard>
  );
}
