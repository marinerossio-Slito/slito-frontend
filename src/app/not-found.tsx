import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="font-serif text-7xl font-bold text-sand" aria-hidden>
        404
      </p>
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">Page introuvable</h1>
        <p className="mt-2 text-ink-mid">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(196,97,58,0.30)] transition hover:bg-terra-dark"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/recherche"
          className="rounded-full border border-sand px-6 py-2.5 text-sm font-semibold text-ink-mid transition hover:border-terra hover:text-terra"
        >
          Trouver un artisan
        </Link>
      </div>
    </div>
  );
}
