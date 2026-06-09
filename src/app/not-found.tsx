import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-6xl font-bold text-zinc-200" aria-hidden>
        404
      </p>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Page introuvable</h1>
        <p className="mt-2 text-zinc-500">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/recherche"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
        >
          Trouver un artisan
        </Link>
      </div>
    </div>
  );
}
