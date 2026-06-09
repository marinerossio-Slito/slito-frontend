'use client';

/**
 * Page d'accueil de l'espace artisan (`/artisan`).
 * Affiche l'identité connectée, le statut du compte (en attente / actif),
 * et des liens vers les quatre sections : Dashboard, Agenda, Ma fiche, Abonnement.
 */

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

export function ArtisanHub() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Espace artisan</h1>
        {user && (
          <p className="mt-2 text-ink-mid">
            Connecté·e en tant que{' '}
            <span className="font-semibold text-ink">{user.email}</span>
          </p>
        )}
      </header>

      <nav aria-label="Sections de l'espace artisan">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/artisan/dashboard"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                📊
              </span>
              <span className="font-semibold text-ink">Tableau de bord</span>
              <span className="text-sm text-ink-light">
                Revenus, statistiques d&apos;activité et avis clients.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/artisan/agenda"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                🗓️
              </span>
              <span className="font-semibold text-ink">Agenda</span>
              <span className="text-sm text-ink-light">
                Vos rendez-vous à venir, à confirmer ou à annuler.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/artisan/fiche"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                🏪
              </span>
              <span className="font-semibold text-ink">Ma fiche</span>
              <span className="text-sm text-ink-light">
                Gérez la présentation de votre entreprise sur Slito.
              </span>
            </Link>
          </li>

          <li>
            <Link
              href="/artisan/abonnement"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                💳
              </span>
              <span className="font-semibold text-ink">Abonnement</span>
              <span className="text-sm text-ink-light">
                Gérez votre formule d&apos;abonnement Slito Pro.
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
