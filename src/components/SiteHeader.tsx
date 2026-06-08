'use client';

/**
 * En-tête commun à toutes les pages publiques.
 *
 * Devient un Client Component à cette étape : la navigation dépend désormais
 * de l'état de connexion (`useAuth`), connu uniquement côté client puisque le
 * jeton vit dans `localStorage` (cf. ARCHITECTURE.md, notes de conception —
 * « pas de session serveur »).
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { primaryAccountPath } from '@/lib/auth';

/** Libellé du lien vers l'espace personnel, selon l'espace réellement déduit du rôle (cf. `primaryAccountPath`). */
const ACCOUNT_LINK_LABELS: Record<string, string> = {
  '/compte': 'Mon compte',
  '/artisan': 'Espace artisan',
  '/admin': 'Administration',
};

export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  const accountPath = primaryAccountPath(user);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Slito
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/recherche" className="transition hover:text-zinc-900">
            Trouver un artisan
          </Link>

          {status === 'loading' ? (
            // `useAuth` ne connaît l'état réel qu'après avoir relu `localStorage`
            // au montage : on réserve la place plutôt que de faire apparaître
            // les liens « Connexion »/« Mon compte » en clignotant (et le rendu
            // serveur démarre lui aussi sur cet état — pas de désaccord d'hydratation).
            <span className="block h-9 w-40" aria-hidden />
          ) : status === 'authenticated' && user ? (
            <>
              <Link href={accountPath} className="transition hover:text-zinc-900">
                {ACCOUNT_LINK_LABELS[accountPath] ?? 'Mon espace'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-700 transition hover:border-zinc-400"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="transition hover:text-zinc-900">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700"
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
