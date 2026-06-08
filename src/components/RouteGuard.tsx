'use client';

/**
 * Garde de route côté client : protège les pages des espaces connectés
 * (`/compte`, `/artisan`, `/admin`...).
 *
 * Le back-end étant stateless et le jeton vivant côté client (`localStorage`,
 * pas un cookie de session), il est impossible de protéger ces pages au niveau
 * du serveur Next — la vérification ne peut se faire qu'après hydratation,
 * une fois `useAuth` capable de lire le jeton persisté. D'où ce composant
 * client, posé en racine de chaque page protégée.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';

export function RouteGuard({
  roles,
  children,
}: {
  /** Rôles autorisés à accéder à la page protégée. Omis ou vide = tout utilisateur connecté. */
  roles?: readonly string[];
  children: React.ReactNode;
}) {
  const { status, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowedRoles = roles ?? [];

  // On attend `status !== 'loading'` avant de rediriger : au tout premier
  // rendu côté client, `useAuth` n'a pas encore eu le temps de relire
  // `localStorage`, et rediriger trop tôt déconnecterait à tort un utilisateur
  // en réalité authentifié.
  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === 'loading' || status === 'anonymous') {
    return <GuardMessage title="Vérification de votre session…">Un instant, merci de patienter.</GuardMessage>;
  }

  if (!hasRole(allowedRoles)) {
    return (
      <GuardMessage title="Accès refusé">
        Votre compte ne dispose pas des droits nécessaires pour accéder à cette page.{' '}
        <Link href="/" className="font-medium text-amber-700 transition hover:text-amber-800">
          Retour à l&apos;accueil
        </Link>
        .
      </GuardMessage>
    );
  }

  return <>{children}</>;
}

function GuardMessage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 px-6 py-24 text-center">
      <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      <p className="text-sm text-zinc-600">{children}</p>
    </div>
  );
}
