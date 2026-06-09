'use client';

/**
 * Liste des rendez-vous du client connecté, avec suivi, annulation et
 * soumission d'avis pour les prestations terminées.
 *
 * Données chargées côté client (via `fetchAppointments`) car le jeton JWT est
 * nécessaire et n'est disponible que dans le navigateur (cf. `useAuth`).
 *
 * Fonctionnalités :
 * - Onglets de filtre par statut.
 * - Chaque carte affiche : prestation, entreprise, date/heure, lieu, statut,
 *   note client.
 * - Actions selon statut :
 *   - PENDING / CONFIRMED : bouton « Annuler ».
 *   - COMPLETED : bouton « Laisser un avis » (masqué une fois l'avis envoyé,
 *     cf. `reviewedIds` — état local à la session ; le back-end renvoie 409 si
 *     on tente de noter deux fois).
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppointmentStatusBadge } from '@/components/AppointmentStatusBadge';
import { ReviewForm } from '@/components/account/ReviewForm';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { cancelAppointment, fetchAppointments } from '@/lib/appointments';
import { formatDateTime, formatDuration, formatPrice } from '@/lib/format';
import type { Appointment, AppointmentStatus } from '@/types/appointment';

const LOCATION_LABELS: Record<string, string> = {
  HOME: 'À domicile',
  WORKSHOP: 'En atelier',
};

type StatusFilter = AppointmentStatus | 'ALL';

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmés' },
  { value: 'COMPLETED', label: 'Terminés' },
  { value: 'CANCELLED', label: 'Annulés' },
];

export function AppointmentList() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetchAppointments(token)
      .then((data) => {
        if (!cancelled) setAppointments(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : 'Impossible de charger vos rendez-vous.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleCancel(id: number) {
    if (!token) return;

    setCancellingId(id);
    setCancelError(null);

    try {
      const updated = await cancelAppointment(token, id);
      setAppointments((prev) =>
        prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null,
      );
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : "L'annulation a échoué. Réessayez.");
    } finally {
      setCancellingId(null);
    }
  }

  function handleReviewSuccess(appointmentId: number) {
    setReviewedIds((prev) => new Set(prev).add(appointmentId));
    setReviewingId(null);
  }

  // Chargement
  if (appointments === null && loadError === null) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-sand-light" />
        ))}
      </div>
    );
  }

  if (loadError !== null) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
    );
  }

  const all = appointments ?? [];
  const filtered =
    activeFilter === 'ALL' ? all : all.filter((a) => a.status === activeFilter);

  return (
    <div className="flex flex-col gap-6">
      {/* Onglets de filtre */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            aria-pressed={activeFilter === tab.value}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeFilter === tab.value
                ? 'bg-terra text-white'
                : 'bg-sand-light text-ink-mid hover:bg-sand'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message d'erreur d'annulation (global, non bloquant) */}
      {cancelError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {cancelError}
        </p>
      )}

      {/* Liste ou état vide */}
      {filtered.length === 0 ? (
        <EmptyState
          message={
            activeFilter === 'ALL'
              ? "Vous n'avez pas encore de rendez-vous. Explorez les fiches artisans pour en prendre un !"
              : `Aucun rendez-vous « ${FILTER_TABS.find((t) => t.value === activeFilter)?.label.toLowerCase()} ».`
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isCancelling={cancellingId === appointment.id}
              isReviewing={reviewingId === appointment.id}
              hasBeenReviewed={reviewedIds.has(appointment.id)}
              token={token!}
              onCancel={() => handleCancel(appointment.id)}
              onStartReview={() => setReviewingId(appointment.id)}
              onCancelReview={() => setReviewingId(null)}
              onReviewSuccess={() => handleReviewSuccess(appointment.id)}
            />
          ))}
        </ul>
      )}

      {all.length > 0 && (
        <p className="text-center text-sm text-ink-light">
          Vous avez {all.length} rendez-vous au total.
        </p>
      )}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  isCancelling: boolean;
  isReviewing: boolean;
  hasBeenReviewed: boolean;
  token: string;
  onCancel: () => void;
  onStartReview: () => void;
  onCancelReview: () => void;
  onReviewSuccess: () => void;
}

function AppointmentCard({
  appointment,
  isCancelling,
  isReviewing,
  hasBeenReviewed,
  token,
  onCancel,
  onStartReview,
  onCancelReview,
  onReviewSuccess,
}: AppointmentCardProps) {
  const canCancel =
    appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  const canReview = appointment.status === 'COMPLETED' && !hasBeenReviewed;

  return (
    <li className="rounded-2xl border border-sand bg-warm-white p-5">
      {/* En-tête : prestation + statut */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="font-semibold text-ink">
            {appointment.service?.name ?? 'Prestation inconnue'}
          </p>
          {appointment.business && (
            <Link
              href={`/entreprises/${appointment.business.id}`}
              className="text-sm font-medium text-terra transition hover:text-terra-dark"
            >
              {appointment.business.name}
            </Link>
          )}
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      {/* Détails */}
      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        {appointment.dateTime && (
          <InfoItem label="Date">
            <span className="capitalize">{formatDateTime(appointment.dateTime)}</span>
          </InfoItem>
        )}
        {appointment.service && (
          <InfoItem label="Durée / tarif">
            {formatDuration(appointment.service.duration)} · {formatPrice(appointment.service.price)}
          </InfoItem>
        )}
        {appointment.location && (
          <InfoItem label="Lieu">{LOCATION_LABELS[appointment.location] ?? appointment.location}</InfoItem>
        )}
        {appointment.customerNote && (
          <InfoItem label="Note" className="sm:col-span-2">
            {appointment.customerNote}
          </InfoItem>
        )}
      </dl>

      {/* Actions */}
      {(canCancel || canReview) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-sand-light pt-4">
          {canCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className="inline-flex items-center rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCancelling ? 'Annulation…' : 'Annuler ce rendez-vous'}
            </button>
          )}
          {canReview && !isReviewing && (
            <button
              type="button"
              onClick={onStartReview}
              className="inline-flex items-center rounded-full bg-sand-light px-4 py-1.5 text-sm font-medium text-terra-dark transition hover:bg-sand"
            >
              ★ Laisser un avis
            </button>
          )}
        </div>
      )}

      {/* Formulaire d'avis en ligne */}
      {isReviewing && (
        <ReviewForm
          appointmentId={appointment.id}
          targetName={appointment.business?.name ?? 'cet artisan'}
          token={token}
          onSuccess={onReviewSuccess}
          onCancel={onCancelReview}
        />
      )}

      {/* Confirmation post-avis */}
      {hasBeenReviewed && appointment.status === 'COMPLETED' && (
        <p className="mt-3 text-sm text-emerald-700">✓ Votre avis a été publié.</p>
      )}
    </li>
  );
}

function InfoItem({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className ?? ''}`}>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-light">{label}</dt>
      <dd className="text-ink-mid">{children}</dd>
    </div>
  );
}
