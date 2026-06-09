'use client';

/**
 * Page d'accueil de l'espace administrateur (`/admin`).
 * Liens rapides vers les trois sections : Statistiques, Catégories, Utilisateurs.
 */

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

export function AdminHub() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Administration</h1>
        {user && (
          <p className="mt-2 text-zinc-600">
            Connecté·e en tant que{' '}
            <span className="font-semibold text-zinc-900">{user.email}</span>
          </p>
        )}
      </header>

      <nav aria-label="Sections de l'espace administrateur">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <li>
            <Link
              href="/admin/stats"
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                📈
              </span>
              <span className="font-semibold text-zinc-900">Statistiques</span>
              <span className="text-sm text-zinc-500">
                KPIs plateforme : utilisateurs, RDV, revenus, avis.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/categories"
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                🏷️
              </span>
              <span className="font-semibold text-zinc-900">Catégories</span>
              <span className="text-sm text-zinc-500">
                Gérez les catégories de métiers artisanaux.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/utilisateurs"
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                👤
              </span>
              <span className="font-semibold text-zinc-900">Utilisateurs</span>
              <span className="text-sm text-zinc-500">
                Approuver les artisans, bannir ou réactiver des comptes.
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
