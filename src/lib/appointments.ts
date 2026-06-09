/**
 * Accès aux endpoints de rendez-vous (cf. AppointmentController côté back-end).
 * Toutes ces fonctions nécessitent un jeton JWT (`token`) : elles ne peuvent être
 * appelées que depuis des composants clients authentifiés.
 */

import { apiFetch } from '@/lib/api';
import type { Appointment, AppointmentStatus, CreateAppointmentPayload } from '@/types/appointment';

/**
 * Liste les rendez-vous de l'utilisateur courant (`GET /api/appointments`).
 * L'API agrège les RDV côté client et côté artisan si l'utilisateur possède
 * les deux profils, et les renvoie triés par date décroissante.
 *
 * @param statusFilter Filtre optionnel : `PENDING`, `CONFIRMED`, `CANCELLED` ou `COMPLETED`.
 */
export function fetchAppointments(token: string, statusFilter?: AppointmentStatus): Promise<Appointment[]> {
  return apiFetch<Appointment[]>('/api/appointments', {
    token,
    query: { status: statusFilter },
  });
}

/**
 * Crée une demande de rendez-vous (`POST /api/appointments`).
 * Réservé aux comptes clients (`ROLE_CUSTOMER`).
 * Le rendez-vous est créé avec le statut `PENDING`.
 */
export function createAppointment(token: string, payload: CreateAppointmentPayload): Promise<Appointment> {
  return apiFetch<Appointment>('/api/appointments', {
    method: 'POST',
    token,
    body: payload,
  });
}

/**
 * Annule un rendez-vous en attente ou confirmé (`PATCH /api/appointments/{id}`
 * avec `{ status: 'CANCELLED' }`).
 * Accessible au client et à l'artisan concernés.
 */
export function cancelAppointment(token: string, id: number): Promise<Appointment> {
  return apiFetch<Appointment>(`/api/appointments/${id}`, {
    method: 'PATCH',
    token,
    body: { status: 'CANCELLED' },
  });
}
