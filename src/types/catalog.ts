/**
 * Types reflétant les réponses des endpoints publics de catalogue
 * (cf. slito-backend/src/Controller/Api/CatalogController.php — les champs ici
 * correspondent exactement à `serializeCategory`, `serializeService`,
 * `serializeBusinessSummary` et `serializeBusinessDetail`).
 *
 * Remarque sur les prix : `Service.price` est une colonne `decimal` côté
 * Doctrine, sérialisée telle quelle par PHP/Symfony — donc une chaîne
 * (ex. "45.00"), alors que `priceFrom` est calculé en PHP avec un cast
 * `(float)` et arrive donc en JSON comme un nombre. Les deux représentations
 * coexistent réellement dans l'API ; on les type donc différemment ici plutôt
 * que d'arrondir les angles.
 *
 * `faq` et `workingHours` sont des colonnes `json` côté Doctrine (donc des
 * formes libres en théorie) : leur structure réelle ici a été vérifiée dans
 * `slito-backend/src/DataFixtures/AppFixtures.php` (`randomFaq` →
 * `{ question, answer }[]`, `randomWorkingHours` → un jour en français vers
 * un créneau `[ouverture, fermeture]` ou `null`).
 */

export interface ArtisanCategory {
  id: number;
  name: string;
  icon: string | null;
  slug: string;
}

/** Paire question/réponse de la FAQ d'une prestation (cf. `randomFaq` des fixtures). */
export interface ServiceFaqEntry {
  question: string;
  answer: string;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  /** Montant décimal sérialisé en chaîne par Doctrine (ex. "45.00"). */
  price: string;
  /** Valeur de l'enum `Location` (`HOME` ou `WORKSHOP`), ou `null` si non renseignée. */
  location: 'HOME' | 'WORKSHOP' | null;
  faq: ServiceFaqEntry[] | null;
}

/**
 * Horaires d'ouverture d'une entreprise : un jour (clé en français, ex.
 * "lundi") associé soit à un créneau `[ouverture, fermeture]` (ex.
 * `["09:00", "18:00"]`), soit à `null` si fermé ce jour-là.
 * Cf. `AppFixtures::randomWorkingHours`.
 */
export type WorkingHours = Record<string, [string, string] | null>;

/**
 * Forme commune renvoyée par `GET /api/search` (résumé) et incluse dans le
 * détail d'une fiche (`GET /api/businesses/{id}`).
 */
export interface BusinessSummary {
  id: number;
  name: string;
  headline: string | null;
  /** Dénomination libre choisie par l'artisan (ex. « Ébéniste d'art »). */
  specialty: string | null;
  coverImage: string | null;
  officeAddress: string | null;
  category: ArtisanCategory | null;
  averageRating: number | null;
  reviewsCount: number;
  /** Prix de la prestation la moins chère, ou `null` si l'entreprise n'en propose aucune. */
  priceFrom: number | null;
}

/** Détail complet d'une fiche entreprise (`GET /api/businesses/{id}`). */
export interface BusinessDetail extends BusinessSummary {
  description: string | null;
  website: string | null;
  paymentMethods: string[] | null;
  contactNumber: string | null;
  workingHours: WorkingHours | null;
  replyDelay: string | null;
  services: Service[];
}

/** Filtres acceptés par `GET /api/search` (cf. CatalogController::search). */
export interface SearchFilters {
  category?: string;
  /** Recherche par mots-clés (nom, accroche, spécialité, catégorie). */
  q?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}
