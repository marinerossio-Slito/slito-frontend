'use client';

/**
 * Tableau de bord des statistiques globales de la plateforme.
 * Données chargées via GET /api/admin/stats.
 */

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { fetchAdminStats } from '@/lib/admin';
import { formatPrice } from '@/lib/format';
import type { AdminStats } from '@/types/admin';

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmés',
  COMPLETED: 'Terminés',
  CANCELLED: 'Annulés',
};

export function StatsPanel() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchAdminStats(token)
      .then((d) => { if (!cancelled) setStats(d); })
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

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Utilisateurs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Utilisateurs
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.users.total} />
          <StatCard label="Clients" value={stats.users.customers} />
          <StatCard label="Artisans" value={stats.users.artisans} />
          <StatCard label="Bannis" value={stats.users.banned} alert={stats.users.banned > 0} />
        </div>
      </section>

      {/* Artisans */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Artisans
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Approuvés" value={stats.artisans.approved} />
          <StatCard
            label="En attente d'approbation"
            value={stats.artisans.pendingApproval}
            alert={stats.artisans.pendingApproval > 0}
          />
          <StatCard label="Fiches publiées" value={stats.businesses.total} />
        </div>
      </section>

      {/* Rendez-vous */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Rendez-vous
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.appointments.total} />
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([status, label]) => (
            <StatCard key={status} label={label} value={stats.appointments.byStatus[status] ?? 0} />
          ))}
        </div>
      </section>

      {/* Revenus et avis */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Revenus et avis
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Revenus totaux (prestations terminées)" value={formatPrice(String(stats.revenue))} />
          <StatCard label="Avis clients" value={stats.reviews.count} />
          <StatCard
            label="Note moyenne"
            value={stats.reviews.average !== null ? `${stats.reviews.average.toFixed(1)} / 5` : '—'}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number | string;
  alert?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border p-4 ${
        alert ? 'border-amber-200 bg-amber-50' : 'border-zinc-200 bg-white'
      }`}
    >
      <span className={`text-xl font-bold ${alert ? 'text-amber-700' : 'text-zinc-900'}`}>
        {value}
      </span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}
