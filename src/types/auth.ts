/**
 * Types liés à l'authentification.
 *
 * Le back-end est stateless (JWT, cf. ARCHITECTURE.md) : il n'existe pas de
 * « profil utilisateur » renvoyé par un endpoint dédié. Tout ce que le front
 * connaît de l'utilisateur connecté provient du jeton lui-même — d'où `AuthUser`,
 * déduit du payload JWT (cf. `src/lib/auth.ts`, `userFromToken`).
 *
 * `App\Entity\User` n'implémente pas `JWTUserInterface` et aucun listener de
 * payload personnalisé n'est enregistré (cf. slito-backend/config/packages/
 * lexik_jwt_authentication.yaml) : le payload est donc celui par défaut de
 * lexik/jwt-authentication-bundle, à savoir `{ iat, exp, roles, username }`,
 * où `username` est la valeur de `User::getUserIdentifier()` — c'est-à-dire
 * l'email (cf. User::getUserIdentifier).
 */

/** Rôles possibles (cf. constantes `ROLE_*` de `App\Entity\User`). Tout compte porte au moins `ROLE_USER`. */
export type Role = 'ROLE_USER' | 'ROLE_CUSTOMER' | 'ROLE_ARTISAN' | 'ROLE_ADMIN';

/** Identité déduite du payload du jeton JWT — pas un DTO renvoyé par l'API. */
export interface AuthUser {
  /** Claim `username` du jeton : l'email de connexion (cf. User::getUserIdentifier). */
  email: string;
  roles: string[];
  /** Claim `exp` (timestamp Unix en secondes), si présente dans le jeton. */
  expiresAt: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Champs de `RegisterCustomerRequest` côté back-end (cf.
 * slito-backend/src/Dto/RegisterCustomerRequest.php). `phone` et `homeAddress`
 * sont optionnels côté DTO (pas de contrainte `NotBlank`).
 */
export interface RegisterCustomerPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  homeAddress?: string;
}

/**
 * Champs de `RegisterArtisanRequest` côté back-end (cf.
 * slito-backend/src/Dto/RegisterArtisanRequest.php). `siret` est validé par la
 * regex `/^\d{14}$/` (exactement 14 chiffres) ; `ownershipDocument` est requis
 * (`NotBlank`) — c'est une chaîne libre (URL/référence du justificatif), pas un
 * fichier déposé directement par ce formulaire.
 */
export interface RegisterArtisanPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  siret: string;
  officeAddress?: string;
  ownershipDocument: string;
}

/** Réponse de `POST /api/register/customer` (cf. AuthController::registerCustomer). */
export interface RegisterCustomerResponse {
  id: number;
  email: string;
  roles: string[];
  isVerified: boolean;
}

/** Réponse de `POST /api/register/artisan` (cf. AuthController::registerArtisan) — compte créé en attente d'approbation. */
export interface RegisterArtisanResponse {
  id: number;
  email: string;
  roles: string[];
  isApproved: boolean;
  message: string;
}
