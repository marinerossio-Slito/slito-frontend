/**
 * Types reflétant les réponses de l'API des rendez-vous
 * (cf. slito-backend/src/Controller/Api/AppointmentController.php — les champs
 * correspondent exactement à `serializeAppointment`, `serializeService` et
 * `serializeBusiness`).
 *
 * Cycle de vie d'un rendez-vous :
 *   PENDING → CONFIRMED → COMPLETED
 *   PENDING → CANCELLED (client ou artisan)
 *   CONFIRMED → CANCELLED (client ou artisan)
 *   CONFIRMED → COMPLETED (artisan uniquement)
 */

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type AppointmentLocation = 'HOME' | 'WORKSHOP';

/** Prestation telle que sérialisée dans un rendez-vous (sous-ensemble de `Service`). */
export interface AppointmentService {
  id: number;
  name: string;
  duration: number;
  /** Montant décimal sérialisé en chaîne par Doctrine (ex. "45.00"). */
  price: string;
}

/** Référence légère à l'entreprise associée à un rendez-vous. */
export interface AppointmentBusinessRef {
  id: number;
  name: string;
}

/** Référence légère au profil client (nom peut être null si l'utilisateur ne l'a pas renseigné). */
export interface AppointmentCustomerRef {
  id: number;
  firstName: string | null;
  lastName: string | null;
}

/** Rendez-vous complet tel que renvoyé par `GET /api/appointments` et `POST /api/appointments`. */
export interface Appointment {
  id: number;
  /** Date/heure au format ATOM (ISO 8601), ex. `2026-07-01T14:30:00+02:00`. */
  dateTime: string;
  status: AppointmentStatus;
  location: AppointmentLocation | null;
  customerNote: string | null;
  service: AppointmentService | null;
  business: AppointmentBusinessRef | null;
  customer: AppointmentCustomerRef | null;
}

/** Corps de `POST /api/appointments` (cf. `CreateAppointmentRequest` côté back-end). */
export interface CreateAppointmentPayload {
  /** Identifiant de la prestation choisie. */
  serviceId: number;
  /** Date/heure au format ISO 8601 (ex. `2026-07-01T14:30:00Z`). */
  dateTime: string;
  location: AppointmentLocation;
  /** Texte libre pour préciser la demande, max 2000 caractères. */
  customerNote?: string;
}
