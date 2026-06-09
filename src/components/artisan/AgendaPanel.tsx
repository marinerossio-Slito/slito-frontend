'use client';

/**
 * Agenda de l'artisan : rendez-vous actifs (PENDING/CONFIRMED) avec actions
 * Confirmer / Annuler, et événements de calendrier.
 *
 * Sources :
 *   - GET /api/artisan/calendar → rendez-vous actifs + événements perso
 *   - PATCH /api/appointments/{id} → confirmer ou annuler un RDV
 *
 * Architecture : les resets d'état entre deux actions sont faits dans les
 * gestionnaires d'événements, pas dans les corps d'effets.
 */

import { useEffect, useState } from 'react';

import { AppointmentStatusBadge } from '@/components/AppointmentStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { fetchCalendar } from '@/lib/artisan';
import { cancelAppointment, confirmAppointment } from '@/lib/appointments';
import { formatDateTime } from '@/lib/format';
import type { AppointmentStatus } from '@/types/appointment';
import type { CalendarAppointmentRef, CalendarData } from '@/types/artisan';

export function AgendaPanel() {
  const { token } = useAuth();
  const [data, setData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchCalendar(token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Chargement échoué.'); });

    return () => { cancelled = true; };
  }, [token]);

  async function handleConfirm(id: number) {
    if (!token) return;
    setActionId(id);
    setActionError(null);
    try {
      const updated = await confirmAppointment(token, id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              appointments: prev.appointments.map((a) =>
                a.id === id ? { ...a, status: updated.status } : a,
              ),
            }
          : prev,
      );
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Action échouée.');
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(id: number) {
    if (!token) return;
    setActionId(id);
    setActionError(null);
    try {
      await cancelAppointment(token, id);
      // Retirer le RDV de la liste (il n'est plus actif)
      setData((prev) =>
        prev
          ? { ...prev, appointments: prev.appointments.filter((a) => a.id !== id) }
          : prev,
      );
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Action échouée.');
    } finally {
      setActionId(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-sand-light" />
        ))}
      </div>
    );
  }

  const { appointments, events } = data;

  return (
    <div className="flex flex-col gap-8">
      {/* Rendez-vous actifs */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-ink">
          Rendez-vous actifs ({appointments.length})
        </h2>

        {actionError && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</p>
        )}

        {appointments.length === 0 ? (
          <p className="rounded-2xl border border-sand-light bg-cream px-5 py-4 text-sm text-ink-light">
            Aucun rendez-vous en attente ou confirmé pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                isActing={actionId === appt.id}
                onConfirm={() => handleConfirm(appt.id)}
                onCancel={() => handleCancel(appt.id)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Événements de calendrier */}
      {events.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-ink">
            Événements ({events.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {events.map((evt) => (
              <li
                key={evt.id}
                className="rounded-2xl border border-sand bg-white px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">
                      {evt.title ?? 'Événement sans titre'}
                    </span>
                    {evt.description && (
                      <span className="text-sm text-ink-light">{evt.description}</span>
                    )}
                    {evt.startDate && (
                      <span className="text-xs text-ink-light">{formatDateTime(evt.startDate)}</span>
                    )}
                  </div>
                  {evt.isAvailability && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Disponibilité
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment,
  isActing,
  onConfirm,
  onCancel,
}: {
  appointment: CalendarAppointmentRef;
  isActing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const customerName =
    appointment.customer
      ? `${appointment.customer.firstName ?? ''} ${appointment.customer.lastName ?? ''}`.trim() || 'Client inconnu'
      : 'Client inconnu';

  const status = appointment.status as AppointmentStatus;

  return (
    <li className="rounded-2xl border border-sand bg-white px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">{customerName}</span>
            <AppointmentStatusBadge status={status} />
          </div>
          {appointment.service && (
            <span className="text-sm text-ink-mid">{appointment.service}</span>
          )}
          <span className="text-xs text-ink-light">{formatDateTime(appointment.dateTime)}</span>
        </div>

        <div className="flex shrink-0 gap-2">
          {status === 'PENDING' && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isActing}
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {isActing ? '…' : 'Confirmer'}
            </button>
          )}
          {(status === 'PENDING' || status === 'CONFIRMED') && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isActing}
              className="rounded-full border border-sand px-4 py-1.5 text-xs font-semibold text-ink-mid transition hover:border-red-300 hover:text-red-700 disabled:opacity-60"
            >
              {isActing ? '…' : 'Annuler'}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
