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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mon compte</h1>
        {user && (
          <p className="mt-2 text-zinc-600">
            Connecté·e en tant que{' '}
            <span className="font-semibold text-zinc-900">{user.email}</span>
          </p>
        )}
      </header>

      <nav aria-label="Sections de l'espace client">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Rendez-vous — disponible dès l'étape 4 */}
          <li>
            <Link
              href="/compte/rendez-vous"
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                📅
              </span>
              <span className="font-semibold text-zinc-900">Mes rendez-vous</span>
              <span className="text-sm text-zinc-500">
                Retrouvez, suivez et annulez vos demandes de prestation.
              </span>
            </Link>
          </li>

          {/* Messagerie — étape 5 */}
          <li>
            <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 opacity-60">
              <span className="text-2xl" aria-hidden>
                💬
              </span>
              <span className="font-semibold text-zinc-900">Messagerie</span>
              <span className="text-sm text-zinc-500">
                Échangez directement avec les artisans. Disponible à l&apos;étape 5.
              </span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}
