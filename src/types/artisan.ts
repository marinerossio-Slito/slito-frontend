/**
 * Types métier pour l'espace artisan.
 *
 * Correspondent aux réponses des endpoints /api/artisan/… :
 *   - GET  /api/artisan/dashboard
 *   - GET  /api/artisan/calendar
 *   - PUT  /api/artisan/business
 *   - GET  /api/artisan/clients
 *   - GET  /api/artisan/subscription
 *   - POST /api/artisan/subscription/checkout
 *   - POST /api/artisan/subscription/portal
 */

export interface ArtisanBusinessRef {
  id: number;
  name: string;
}

export interface AppointmentCounts {
  total: number;
  byStatus: Record<string, number>;
}

export interface RatingStats {
  average: number | null;
  count: number;
}

export interface DashboardData {
  business: ArtisanBusinessRef | null;
  appointments: AppointmentCounts;
  revenue: number;
  rating: RatingStats;
}

// --- Agenda ---

export interface CalendarAppointmentRef {
  id: number;
  dateTime: string;
  status: string;
  service: string | null;
  customer: { firstName: string | null; lastName: string | null } | null;
}

export interface CalendarEvent {
  id: number;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  type: string | null;
  isAvailability: boolean;
}

export interface CalendarData {
  events: CalendarEvent[];
  appointments: CalendarAppointmentRef[];
}

// --- Fiche entreprise ---

/** Réponse de PUT /api/artisan/business (profil complet sans services). */
export interface ArtisanBusiness {
  id: number;
  name: string;
  headline: string | null;
  specialty: string | null;
  description: string | null;
  coverImage: string | null;
  website: string | null;
  paymentMethods: string[] | null;
  contactNumber: string | null;
  officeAddress: string | null;
  workingHours: Record<string, string> | null;
  replyDelay: string | null;
  category: { id: number; name: string; slug: string } | null;
}

/** Corps envoyé à PUT /api/artisan/business. */
export interface UpsertBusinessPayload {
  name: string;
  categoryId: number;
  headline?: string | null;
  specialty?: string | null;
  description?: string | null;
  coverImage?: string | null;
  website?: string | null;
  paymentMethods?: string[] | null;
  contactNumber?: string | null;
  officeAddress?: string | null;
  replyDelay?: string | null;
}

// --- Clients ---

export interface ArtisanClientRow {
  customer: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  appointmentsCount: number;
  lastAppointmentAt: string | null;
}

// --- Abonnement ---

export interface SubscriptionInfo {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  active: boolean;
}

export interface SubscriptionResponse {
  subscription: SubscriptionInfo | null;
}

export type SubscriptionPlan = 'monthly' | 'yearly';
