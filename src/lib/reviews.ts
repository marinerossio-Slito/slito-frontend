/**
 * Accès à l'endpoint de création d'avis (cf. ReviewController côté back-end).
 * Requiert un jeton JWT : ne peut être appelé que depuis un composant client
 * authentifié.
 *
 * Pas d'endpoint `GET /api/reviews` dans l'API : les avis sont accessibles
 * dans le détail des entreprises (cf. `GET /api/businesses/{id}`, données de
 * catalogue) et via le dashboard artisan (cf. `GET /api/artisan/dashboard`).
 */

import { apiFetch } from '@/lib/api';
import type { CreateReviewPayload, Review } from '@/types/review';

/**
 * Soumet un avis pour un rendez-vous terminé (`POST /api/reviews`).
 * Le rendez-vous doit avoir le statut `COMPLETED`, et l'auteur (client ou artisan)
 * ne doit pas avoir déjà laissé d'avis pour ce rendez-vous (→ 409 Conflict sinon).
 */
export function createReview(token: string, payload: CreateReviewPayload): Promise<Review> {
  return apiFetch<Review>('/api/reviews', {
    method: 'POST',
    token,
    body: payload,
  });
}
