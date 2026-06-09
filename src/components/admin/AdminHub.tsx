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
        <h1 className="text-2xl font-bold tracking-tight text-ink">Administration</h1>
        {user && (
          <p className="mt-2 text-ink-mid">
            Connecté·e en tant que{' '}
            <span className="font-semibold text-ink">{user.email}</span>
          </p>
        )}
      </header>

      <nav aria-label="Sections de l'espace administrateur">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <li>
            <Link
              href="/admin/stats"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                📈
              </span>
              <span className="font-semibold text-ink">Statistiques</span>
              <span className="text-sm text-ink-light">
                KPIs plateforme : utilisateurs, RDV, revenus, avis.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/categories"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                🏷️
              </span>
              <span className="font-semibold text-ink">Catégories</span>
              <span className="text-sm text-ink-light">
                Gérez les catégories de métiers artisanaux.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/admin/utilisateurs"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                👤
              </span>
              <span className="font-semibold text-ink">Utilisateurs</span>
              <span className="text-sm text-ink-light">
                Approuver les artisans, bannir ou réactiver des comptes.
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
