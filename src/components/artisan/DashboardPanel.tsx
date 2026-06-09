'use client';

/**
 * Tableau de bord artisan — redesign visuel.
 * Données : GET /api/artisan/dashboard + GET /api/artisan/calendar
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { fetchCalendar, fetchDashboard } from '@/lib/artisan';
import { formatPrice } from '@/lib/format';
import type { CalendarAppointmentRef, DashboardData } from '@/types/artisan';

/* ── Helpers ──────────────────────────────────────────────────── */

const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS   = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function frDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  CONFIRMED:   { label: 'Confirmé',    cls: 'bg-green-50 text-green-700' },
  PENDING:     { label: 'En attente',  cls: 'bg-terra/10 text-terra' },
  COMPLETED:   { label: 'Terminé',     cls: 'bg-sand text-ink-mid' },
  CANCELLED:   { label: 'Annulé',      cls: 'bg-red-50 text-red-600' },
  IN_PROGRESS: { label: 'En cours',    cls: 'bg-sand text-ink-mid' },
};

/* ── Composant principal ──────────────────────────────────────── */

export function DashboardPanel() {
  const { token } = useAuth();
  const [dash, setDash]     = useState<DashboardData | null>(null);
  const [appts, setAppts]   = useState<CalendarAppointmentRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let dead = false;

    Promise.all([fetchDashboard(token), fetchCalendar(token)])
      .then(([d, cal]) => {
        if (dead) return;
        setDash(d);
        setAppts(cal.appointments);
      })
      .catch((e) => { if (!dead) setError(e instanceof ApiError ? e.message : 'Chargement échoué.'); })
      .finally(() => { if (!dead) setLoading(false); });

    return () => { dead = true; };
  }, [token]);

  /* Rendez-vous du jour */
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

  const todayAppts = appts
    .filter((a) => { const d = new Date(a.dateTime); return d >= todayStart && d < todayEnd; })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  /* Notifications = RDV en attente de confirmation */
  const pending = appts.filter((a) => a.status === 'PENDING').slice(0, 5);

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  const businessName = dash?.business?.name ?? '';
  const today = new Date();

  return (
    <div className="flex flex-col gap-6 p-8">

      {/* ── En-tête de bienvenue ────────────────────────────────── */}
      <header>
        <h1 className="font-serif text-[28px] font-bold text-ink">
          {loading
            ? 'Bonjour 👋'
            : businessName
              ? `Bonjour, ${businessName} 👋`
              : 'Bonjour 👋'}
        </h1>
        <p className="mt-1 text-sm text-ink-light">
          {frDate(today)}
          {!loading && todayAppts.length > 0 && ` · ${todayAppts.length} rendez-vous aujourd'hui`}
        </p>
      </header>

      {/* ── KPIs ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-sand-light" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="CA DU MOIS"
            value={formatPrice(String(dash!.revenue))}
            sub={dash!.revenue === 0 ? 'Aucune prestation terminée' : undefined}
          />
          <StatCard
            label="RDV CE MOIS"
            value={String(dash!.appointments.total)}
            sub={
              (dash!.appointments.byStatus['CONFIRMED'] ?? 0) > 0
                ? `↑ ${dash!.appointments.byStatus['CONFIRMED']} confirmés`
                : undefined
            }
            subColor="text-green-600"
          />
          <StatCard
            label="VUES DE LA PAGE"
            value="—"
            sub="Bientôt disponible"
          />
          <StatCard
            label="NOTE MOYENNE"
            value={dash!.rating.average !== null ? dash!.rating.average.toFixed(1) : '—'}
            sub={dash!.rating.count > 0 ? `⭐ ${dash!.rating.count} avis` : 'Aucun avis'}
            subColor={dash!.rating.count > 0 ? 'text-gold' : undefined}
          />
        </div>
      )}

      {/* ── Grille 2 colonnes ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Rendez-vous du jour */}
        <div className="rounded-2xl border border-sand bg-warm-white p-6" style={{ backgroundColor: '#fdfaf3' }}>
          <h2 className="mb-5 font-serif text-lg font-bold text-ink">Rendez-vous du jour</h2>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-sand-light" />)}
            </div>
          ) : todayAppts.length === 0 ? (
            <p className="text-sm text-ink-light">Aucun rendez-vous prévu aujourd&apos;hui.</p>
          ) : (
            <ul className="divide-y divide-sand">
              {todayAppts.map((a) => {
                const dt = new Date(a.dateTime);
                const hh = String(dt.getHours()).padStart(2, '0');
                const mm = String(dt.getMinutes()).padStart(2, '0');
                const client = [a.customer?.firstName, a.customer?.lastName].filter(Boolean).join(' ') || 'Client';
                const cfg = STATUS_CFG[a.status] ?? { label: a.status, cls: 'bg-sand text-ink-mid' };

                return (
                  <li key={a.id} className="flex items-center gap-4 py-3.5">
                    {/* Heure */}
                    <div className="w-10 shrink-0">
                      <span className="block font-mono text-[15px] font-bold text-ink leading-tight">{hh}h</span>
                      <span className="block font-mono text-[11px] text-ink-light">{mm}</span>
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{client}</p>
                      {a.service && <p className="truncate text-xs text-ink-light">{a.service}</p>}
                    </div>
                    {/* Statut */}
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 border-t border-sand pt-3">
            <Link href="/artisan/agenda" className="text-sm font-medium text-terra transition hover:text-terra-dark">
              Voir l&apos;agenda complet →
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-sand bg-warm-white p-6" style={{ backgroundColor: '#fdfaf3' }}>
          <h2 className="mb-5 font-serif text-lg font-bold text-ink">Notifications</h2>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-sand-light" />)}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-ink-light">Aucune notification récente.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {pending.map((a) => {
                const client = [a.customer?.firstName, a.customer?.lastName].filter(Boolean).join(' ') || 'Un client';
                const dt = new Date(a.dateTime);
                const dateLabel = `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;

                return (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terra" />
                    <span className="flex-1 leading-relaxed text-ink-mid">
                      <span className="font-semibold text-ink">{client}</span>
                      {` a demandé un RDV pour le ${dateLabel}`}
                    </span>
                    <Link href="/artisan/agenda" className="shrink-0 whitespace-nowrap text-xs text-ink-light transition hover:text-ink">
                      Confirmer →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Répartition statuts */}
          {!loading && dash && dash.appointments.total > 0 && (
            <div className="mt-5 border-t border-sand pt-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-light">
                Répartition des RDV
              </p>
              <div className="grid grid-cols-4 gap-2">
                {([
                  ['PENDING',   'En attente'],
                  ['CONFIRMED', 'Confirmés'],
                  ['COMPLETED', 'Terminés'],
                  ['CANCELLED', 'Annulés'],
                ] as const).map(([status, label]) => (
                  <div key={status} className="rounded-lg bg-cream px-2 py-2.5 text-center">
                    <span className="block text-base font-bold text-ink">
                      {dash.appointments.byStatus[status] ?? 0}
                    </span>
                    <span className="block text-[10px] leading-tight text-ink-light">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────────────────── */

function StatCard({
  label, value, sub, subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-sand bg-warm-white p-5" style={{ backgroundColor: '#fdfaf3' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-light">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold text-ink">{value}</p>
      {sub && <p className={`mt-1.5 text-xs ${subColor ?? 'text-ink-light'}`}>{sub}</p>}
    </div>
  );
}
