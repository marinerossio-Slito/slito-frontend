'use client';

/**
 * Contexte d'authentification global : porte le jeton JWT, l'identité qui en
 * est déduite, et expose `login`/`logout` à toute l'application.
 *
 * Comme le back-end est stateless (pas de session serveur, cf.
 * ARCHITECTURE.md), c'est ce hook qui fait office de « source de vérité » côté
 * front pour savoir si quelqu'un est connecté et quel est son rôle. Le jeton
 * est conservé en mémoire (state React, pour des relectures synchrones et sans
 * accès `localStorage` répétés) et persisté dans `localStorage` pour survivre
 * au rechargement de page (cf. `src/lib/auth.ts`).
 *
 * `AuthProvider` doit englober toute l'application (cf. `src/app/layout.tsx`) :
 * un Server Component peut tout à fait rendre un Client Component fournisseur
 * de contexte autour de ses enfants.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { UNAUTHORIZED_EVENT } from '@/lib/api';
import * as authApi from '@/lib/auth';
import { clearStoredToken, hasAnyRole, isExpired, readStoredToken, userFromToken, writeStoredToken } from '@/lib/auth';
import type { AuthUser, LoginCredentials } from '@/types/auth';

/**
 * - `loading` : on n'a pas encore regardé `localStorage` (rendu serveur, puis
 *   tout début du rendu côté client) — on ne sait pas encore si quelqu'un est
 *   connecté. `RouteGuard` doit attendre cet état avant de conclure « personne
 *   n'est connecté », pour ne pas rediriger à tort un utilisateur en réalité
 *   authentifié pendant cette fraction de rendu.
 * - `anonymous` : personne n'est connecté (pas de jeton, ou jeton absent/expiré/illisible).
 * - `authenticated` : un jeton valide (non expiré) est présent.
 */
export type AuthStatus = 'loading' | 'anonymous' | 'authenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  /** Connecte l'utilisateur, persiste le jeton et renvoie l'identité obtenue. Lève une `ApiError` en cas d'échec. */
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  /** Déconnecte l'utilisateur et oublie le jeton persisté. */
  logout: () => void;
  /** Raccourci pour vérifier le rôle de l'utilisateur courant (cf. `hasAnyRole`). */
  hasRole: (roles: readonly string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** État regroupé en un seul objet pour ne déclencher qu'un seul re-rendu par transition (montage, connexion, déconnexion). */
interface AuthSnapshot {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
}

const INITIAL_SNAPSHOT: AuthSnapshot = { status: 'loading', token: null, user: null };
const ANONYMOUS_SNAPSHOT: AuthSnapshot = { status: 'anonymous', token: null, user: null };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(INITIAL_SNAPSHOT);

  // Relit le jeton persisté après le montage et en déduit l'identité — en
  // ignorant tout jeton illisible ou expiré (mieux vaut considérer
  // l'utilisateur déconnecté que de planter sur une donnée locale corrompue).
  //
  // Cette lecture ne peut PAS se faire pendant le rendu (ex. initialiseur de
  // `useState`) : `localStorage` n'existe pas côté serveur, et y accéder
  // produirait un résultat différent entre le rendu serveur et le tout premier
  // rendu client — un désaccord d'hydratation. Un effet au montage est le seul
  // moment où le rendu serveur (déjà figé) et le rendu client peuvent diverger
  // sans erreur. C'est le cas d'usage canonique d'« importer un état externe
  // synchrone au montage » qu'évoque la documentation de `useSyncExternalStore`
  // — outil qu'on évite ici à dessein : sa valeur côté serveur (forcément
  // `null`, faute de `localStorage`) serait indiscernable d'un visiteur
  // anonyme, et `RouteGuard` redirigerait alors à tort vers `/connexion` un
  // utilisateur en réalité connecté pendant la fraction de rendu où la vraie
  // valeur n'est pas encore synchronisée. L'état `loading` explicite ci-dessous
  // référence précisément ce problème.
  useEffect(() => {
    const stored = readStoredToken();
    const decoded = stored ? userFromToken(stored) : null;
    const isValid = decoded !== null && !isExpired(decoded);

    if (stored && !isValid) {
      clearStoredToken();
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation unique avec `localStorage` au montage ; voir le commentaire ci-dessus pour la justification (et pourquoi `useSyncExternalStore` ne convient pas ici).
    setSnapshot(isValid ? { status: 'authenticated', token: stored, user: decoded } : ANONYMOUS_SNAPSHOT);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const nextToken = await authApi.login(credentials);
    const decoded = userFromToken(nextToken);
    if (!decoded) {
      throw new Error('Le jeton renvoyé par le serveur est illisible.');
    }

    writeStoredToken(nextToken);
    setSnapshot({ status: 'authenticated', token: nextToken, user: decoded });

    return decoded;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setSnapshot(ANONYMOUS_SNAPSHOT);
  }, []);

  // Le serveur a rejeté un jeton (401) : il est expiré ou signé avec une
  // ancienne clé (régénérée au redéploiement du back-end, cf. apiFetch). On
  // déconnecte alors silencieusement — `RouteGuard` prendra le relais pour
  // renvoyer vers /connexion — au lieu de laisser les écrans afficher un
  // « Invalid JWT Token » brut.
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout]);

  const hasRole = useCallback((roles: readonly string[]) => hasAnyRole(snapshot.user, roles), [snapshot.user]);

  const value = useMemo<AuthContextValue>(
    () => ({ status: snapshot.status, user: snapshot.user, token: snapshot.token, login, logout, hasRole }),
    [snapshot, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Accès au contexte d'authentification. Doit être appelé sous `<AuthProvider>` (cf. `RootLayout`). */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  }

  return context;
}
