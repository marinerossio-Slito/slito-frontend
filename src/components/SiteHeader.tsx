import Link from 'next/link';

/**
 * En-tête commun à toutes les pages publiques. La navigation s'enrichira aux
 * prochaines étapes (état de connexion, lien vers l'espace client/artisan...),
 * cf. ARCHITECTURE.md, étape 3 « Authentification ».
 */
export function SiteHeader() {
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
          <Link href="/connexion" className="transition hover:text-zinc-900">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700"
          >
            Inscription
          </Link>
        </nav>
      </div>
    </header>
  );
}
