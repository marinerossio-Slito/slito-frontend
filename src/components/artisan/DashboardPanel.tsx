'use client';

/**
 * Tableau de bord de l'artisan : revenus, comptages par statut, note moyenne.
 * Données chargées via GET /api/artisan/dashboard.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { fetchDashboard } from '@/lib/artisan';
import { formatPrice } from '@/lib/format';
import type { DashboardData } from '@/types/artisan';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmés',
  COMPLETED: 'Terminés',
  CANCELLED: 'Annulés',
};

export function DashboardPanel() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchDashboard(token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Chargement échoué.'); });

    return () => { cancelled = true; };
  }, [token]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  const { business, appointments, revenue, rating } = data;

  return (
    <div className="flex flex-col gap-8">
      {/* En-tête avec nom de l'entreprise */}
      <div className="flex items-center justify-between">
        <div>
          {business ? (
            <p className="text-zinc-600">
              Fiche :{' '}
              <Link
                href={`/entreprises/${business.id}`}
                className="font-semibold text-amber-700 hover:underline"
                target="_blank"
              >
                {business.name}
              </Link>
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              Vous n&apos;avez pas encore de fiche entreprise.{' '}
              <Link href="/artisan/fiche" className="text-amber-700 hover:underline">
                Créer ma fiche →
              </Link>
            </p>
          )}
        </div>
        <Link
          href="/artisan/agenda"
          className="text-sm font-medium text-amber-700 hover:text-amber-800"
        >
          Voir l&apos;agenda →
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Revenu */}
        <StatCard
          label="Revenus (prestations terminées)"
          value={formatPrice(String(revenue))}
          icon="💶"
        />

        {/* RDV total */}
        <StatCard
          label="Rendez-vous total"
          value={String(appointments.total)}
          icon="📅"
        />

        {/* Note */}
        <StatCard
          label="Note moyenne"
          value={
            rating.average !== null
              ? `${rating.average.toFixed(1)} / 5 (${rating.count} avis)`
              : 'Aucun avis'
          }
          icon="⭐"
        />
      </div>

      {/* Répartition par statut */}
      {appointments.total > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">
            Répartition des rendez-vous
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div
                key={status}
                className="flex flex-col items-center rounded-xl bg-zinc-50 px-3 py-3"
              >
                <span className="text-xl font-bold text-zinc-900">
                  {appointments.byStatus[status] ?? 0}
                </span>
                <span className="mt-0.5 text-center text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-zinc-200 bg-white p-5">
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span className="text-xl font-bold text-zinc-900">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}
