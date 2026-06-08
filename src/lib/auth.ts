/**
 * Authentification : décodage du jeton JWT, persistance côté navigateur et
 * appels aux endpoints d'inscription / connexion / réinitialisation de mot de
 * passe (cf. slito-backend/src/Controller/Api/{AuthController,
 * PasswordResetController}.php).
 *
 * Comme le back-end est entièrement stateless (cf. ARCHITECTURE.md, notes de
 * conception), c'est au front de porter le jeton et d'en déduire l'identité et
 * le rôle courant — il n'y a pas d'endpoint « profil » à interroger. D'où les
 * fonctions de décodage ci-dessous : on lit simplement les informations que le
 * back-end a placées dans le jeton (cf. `src/types/auth.ts` pour le détail du
 * payload).
 */

import { apiFetch } from '@/lib/api';
import type {
  AuthUser,
  LoginCredentials,
  RegisterArtisanPayload,
  RegisterArtisanResponse,
  RegisterCustomerPayload,
  RegisterCustomerResponse,
} from '@/types/auth';

/** Clé de stockage du jeton dans `localStorage` (cf. ARCHITECTURE.md : « jeton conservé côté client + localStorage »). */
const TOKEN_STORAGE_KEY = 'slito.auth.token';

interface JwtPayload {
  username?: unknown;
  roles?: unknown;
  exp?: unknown;
  [claim: string]: unknown;
}

/**
 * Décode une section base64url d'un JWT en texte. On ne fait ici que de la
 * lecture côté client (pour adapter l'interface) : la signature du jeton est de
 * toute façon vérifiée par le back-end à chaque requête authentifiée, inutile
 * de la revérifier ici.
 */
function base64UrlDecode(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(base64UrlDecode(segments[1]));
    return payload !== null && typeof payload === 'object' ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
}

/**
 * Construit l'identité front à partir d'un jeton JWT, ou `null` si le jeton
 * est illisible / ne contient pas l'identifiant attendu (`username`, claim par
 * défaut de lexik/jwt-authentication-bundle qui correspond à
 * `User::getUserIdentifier()`, c'est-à-dire l'email — cf. `src/types/auth.ts`).
 */
export function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.username !== 'string') {
    return null;
  }

  return {
    email: payload.username,
    roles: Array.isArray(payload.roles)
      ? payload.roles.filter((role): role is string => typeof role === 'string')
      : [],
    expiresAt: typeof payload.exp === 'number' ? payload.exp : null,
  };
}

/** `true` si le jeton porte une date d'expiration déjà dépassée. */
export function isExpired(user: Pick<AuthUser, 'expiresAt'>): boolean {
  return user.expiresAt !== null && user.expiresAt * 1000 <= Date.now();
}

/** `true` si `user` porte au moins un des rôles demandés (ou si aucun rôle n'est exigé). */
export function hasAnyRole(user: Pick<AuthUser, 'roles'> | null, roles: readonly string[]): boolean {
  if (roles.length === 0) {
    return true;
  }

  return user !== null && roles.some((role) => user.roles.includes(role));
}

/**
 * Espace principal d'un utilisateur connecté, déduit de son rôle « le plus
 * spécifique » — utile pour rediriger après connexion (cf. `useAuth`). On
 * privilégie admin > artisan > client : un compte ne porte normalement qu'un
 * de ces rôles « métier » en plus de `ROLE_USER` (cf. User::getRoles), mais en
 * théorie rien n'empêche un compte de cumuler plusieurs rôles.
 */
export function primaryAccountPath(user: Pick<AuthUser, 'roles'> | null): string {
  if (!user) {
    return '/';
  }
  if (user.roles.includes('ROLE_ADMIN')) {
    return '/admin';
  }
  if (user.roles.includes('ROLE_ARTISAN')) {
    return '/artisan';
  }

  return '/compte';
}

// --- Persistance du jeton (localStorage) -----------------------------------
//
// Toujours protégée par `typeof window === 'undefined'` : ces fonctions sont
// importées par `useAuth` (Client Component), mais le module peut être évalué
// côté serveur lors du rendu initial — `localStorage` n'y existe pas.

export function readStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function writeStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

// --- Appels API -------------------------------------------------------------

/**
 * Messages connus renvoyés par le gestionnaire d'échec d'authentification de
 * Symfony / le `UserChecker` (cf. slito-backend/src/Security/UserChecker.php)
 * — traduits ici pour l'affichage, le back-end les renvoyant tels quels (en
 * anglais pour le premier, faute de traduction du domaine `security`).
 */
const AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
  'Invalid credentials.': 'Email ou mot de passe incorrect.',
};

/** Traduit les messages d'erreur d'authentification connus ; renvoie le message tel quel sinon. */
export function translateAuthError(message: string): string {
  return AUTH_ERROR_TRANSLATIONS[message] ?? message;
}

/**
 * Authentifie l'utilisateur et renvoie le jeton JWT brut.
 *
 * Le contrôleur `AuthController::login` n'est qu'un stub jamais exécuté : la
 * route `/api/login` est interceptée par le firewall `json_login` (cf.
 * config/packages/security.yaml), configuré avec `username_path: email` et
 * `password_path: password` — d'où le corps `{ email, password }` (et non
 * `{ username, password }`). En cas de succès, lexik/jwt-authentication-bundle
 * renvoie `{ token: string }`.
 */
export async function login({ email, password }: LoginCredentials): Promise<string> {
  const { token } = await apiFetch<{ token: string }>('/api/login', {
    method: 'POST',
    body: { email, password },
  });

  return token;
}

/** Inscrit un compte client (cf. `POST /api/register/customer`, AuthController::registerCustomer). */
export function registerCustomer(payload: RegisterCustomerPayload): Promise<RegisterCustomerResponse> {
  return apiFetch<RegisterCustomerResponse>('/api/register/customer', { method: 'POST', body: payload });
}

/** Inscrit un compte artisan, en attente d'approbation (cf. `POST /api/register/artisan`, AuthController::registerArtisan). */
export function registerArtisan(payload: RegisterArtisanPayload): Promise<RegisterArtisanResponse> {
  return apiFetch<RegisterArtisanResponse>('/api/register/artisan', { method: 'POST', body: payload });
}

/**
 * Déclenche l'envoi d'un lien de réinitialisation. Le back-end renvoie
 * toujours le même message, qu'un compte existe ou non pour cet email — pour
 * ne pas révéler quels emails sont enregistrés (cf.
 * PasswordResetController::requestReset).
 */
export function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/password/reset', { method: 'POST', body: { email } });
}

/** Confirme la réinitialisation avec le jeton reçu par email (cf. `POST /api/password/reset/{token}`). */
export function confirmPasswordReset(token: string, password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/password/reset/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: { password },
  });
}
