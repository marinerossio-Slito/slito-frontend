'use client';

/**
 * Limite d'erreur globale de l'application (React Error Boundary via Next.js).
 * Affiché lorsqu'une erreur non interceptée est levée dans le rendu d'une page.
 * Doit être un Client Component (cf. Next.js docs sur les Error Boundaries).
 */

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En production : logger l'erreur dans un service de monitoring (Sentry…)
    console.error('[Slito] Erreur non interceptée :', error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-5xl" aria-hidden>
        ⚠️
      </p>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Une erreur est survenue</h1>
        <p className="mt-2 text-zinc-500">
          Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-zinc-400">Référence : {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
