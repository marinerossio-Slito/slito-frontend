/**
 * Accès aux endpoints de l'espace artisan.
 * Toutes ces fonctions nécessitent un jeton JWT (`token`).
 *
 *   GET  /api/artisan/dashboard
 *   GET  /api/artisan/calendar
 *   PUT  /api/artisan/business
 *   GET  /api/artisan/clients
 *   GET  /api/artisan/subscription
 *   POST /api/artisan/subscription/checkout
 *   POST /api/artisan/subscription/portal
 */

import { apiFetch } from '@/lib/api';
import type {
  ArtisanBusiness,
  ArtisanClientRow,
  CalendarData,
  DashboardData,
  SubscriptionPlan,
  SubscriptionResponse,
  UpsertBusinessPayload,
} from '@/types/artisan';

export function fetchDashboard(token: string): Promise<DashboardData> {
  return apiFetch<DashboardData>('/api/artisan/dashboard', { token });
}

export function fetchCalendar(token: string): Promise<CalendarData> {
  return apiFetch<CalendarData>('/api/artisan/calendar', { token });
}

/**
 * Crée ou met à jour la fiche entreprise de l'artisan (`PUT /api/artisan/business`).
 * L'API crée la fiche si elle n'existe pas encore (201), ou la remplace (200).
 */
export function upsertBusiness(token: string, payload: UpsertBusinessPayload): Promise<ArtisanBusiness> {
  return apiFetch<ArtisanBusiness>('/api/artisan/business', {
    method: 'PUT',
    token,
    body: payload,
  });
}

export function fetchArtisanClients(token: string): Promise<ArtisanClientRow[]> {
  return apiFetch<ArtisanClientRow[]>('/api/artisan/clients', { token });
}

export function fetchSubscription(token: string): Promise<SubscriptionResponse> {
  return apiFetch<SubscriptionResponse>('/api/artisan/subscription', { token });
}

/**
 * Lance une session Stripe Checkout pour la formule choisie.
 * Retourne l'URL de la page de paiement hébergée par Stripe (à rediriger dessus).
 */
export function startCheckout(token: string, plan: SubscriptionPlan): Promise<{ checkoutUrl: string }> {
  return apiFetch<{ checkoutUrl: string }>('/api/artisan/subscription/checkout', {
    method: 'POST',
    token,
    body: { plan },
  });
}

/**
 * Ouvre le Customer Portal Stripe (gestion / résiliation de l'abonnement).
 * Retourne l'URL à ouvrir (dans un nouvel onglet ou une redirection).
 */
export function startPortal(token: string): Promise<{ portalUrl: string }> {
  return apiFetch<{ portalUrl: string }>('/api/artisan/subscription/portal', {
    method: 'POST',
    token,
  });
}
