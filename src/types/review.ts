/**
 * Types reflétant les réponses de l'API des avis
 * (cf. slito-backend/src/Controller/Api/ReviewController.php — les champs
 * correspondent exactement à `serializeReview`).
 *
 * L'avis est bidirectionnel : un client note l'artisan (`authorType = 'CUSTOMER'`),
 * un artisan note le client (`authorType = 'ARTISAN'`). Il est lié à un rendez-vous
 * COMPLETED et ne peut être laissé qu'une fois par partie.
 */

export type ReviewAuthorType = 'CUSTOMER' | 'ARTISAN';

/** Référence légère à l'auteur ou à la cible d'un avis. */
export interface ReviewUserRef {
  id: number;
  firstName: string | null;
  lastName: string | null;
}

/** Avis tel que renvoyé par `POST /api/reviews`. */
export interface Review {
  id: number;
  /** Note globale (1–5). */
  rating: number;
  /** Note de ponctualité, optionnelle (1–5). */
  punctualityRating: number | null;
  /** Note de qualité, optionnelle (1–5). */
  qualityRating: number | null;
  comment: string | null;
  createdAt: string;
  authorType: ReviewAuthorType;
  appointmentId: number | null;
  author: ReviewUserRef | null;
  target: ReviewUserRef | null;
}

/** Corps de `POST /api/reviews` (cf. `CreateReviewRequest` côté back-end). */
export interface CreateReviewPayload {
  /** Identifiant du rendez-vous concerné (doit être COMPLETED). */
  appointmentId: number;
  /** Note globale (1–5, obligatoire). */
  rating: number;
  /** Note de ponctualité (1–5, optionnelle). */
  punctualityRating?: number;
  /** Note de qualité (1–5, optionnelle). */
  qualityRating?: number;
  /** Commentaire libre, max 2000 caractères. */
  comment?: string;
}
