'use client';

/**
 * Contenu provisoire des espaces connectés (`/compte`, `/artisan`, `/admin`) :
 * confirme que `RouteGuard` a laissé passer la bonne personne et rappelle ce
 * qui arrivera aux prochaines étapes (cf. ARCHITECTURE.md, feuille de route).
 * Sera remplacé page par page au fil des étapes 4 à 7.
 */

import { useAuth } from '@/hooks/useAuth';

export function SpacePlaceholder({ title, description }: { title: string; description: string }) {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-2 text-zinc-600">{description}</p>
      </header>

      {user && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
          <p>
            Connecté·e en tant que <span className="font-semibold text-zinc-900">{user.email}</span>
          </p>
          <p className="mt-1">Rôles du compte : {user.roles.join(', ')}</p>
        </div>
      )}

      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
        Cet espace est en construction : son contenu arrivera aux prochaines étapes de la feuille de route (cf.
        ARCHITECTURE.md). Pour l&apos;instant, cette page démontre simplement que la connexion et la garde de route par
        rôle fonctionnent de bout en bout.
      </p>
    </div>
  );
}
