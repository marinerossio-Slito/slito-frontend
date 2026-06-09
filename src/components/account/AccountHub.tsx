'use client';

/**
 * Page d'accueil de l'espace personnel (`/compte`) : résumé de l'identité
 * connectée et raccourcis vers les sous-sections (rendez-vous, messagerie…).
 *
 * Remplace le `SpacePlaceholder` générique sur `/compte` maintenant que des
 * sous-pages réelles existent (étape 4 : rendez-vous ; étape 5 à venir :
 * messagerie). `SpacePlaceholder` reste utilisé pour `/artisan` et `/admin`
 * dont les espaces sont encore à construire.
 */

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

export function AccountHub() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Mon compte</h1>
        {user && (
          <p className="mt-2 text-ink-mid">
            Connecté·e en tant que{' '}
            <span className="font-semibold text-ink">{user.email}</span>
          </p>
        )}
      </header>

      <nav aria-label="Sections de l'espace client">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Rendez-vous — disponible dès l'étape 4 */}
          <li>
            <Link
              href="/compte/rendez-vous"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                📅
              </span>
              <span className="font-semibold text-ink">Mes rendez-vous</span>
              <span className="text-sm text-ink-light">
                Retrouvez, suivez et annulez vos demandes de prestation.
              </span>
            </Link>
          </li>

          {/* Messagerie */}
          <li>
            <Link
              href="/compte/messages"
              className="flex flex-col gap-2 rounded-2xl border border-sand bg-white p-5 transition hover:border-sand hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                💬
              </span>
              <span className="font-semibold text-ink">Messagerie</span>
              <span className="text-sm text-ink-light">
                Échangez directement avec les artisans Slito.
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
