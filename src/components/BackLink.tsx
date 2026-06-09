import Link from 'next/link';

/**
 * Lien « ← Retour » pour les pages secondaires (sous-sections des espaces
 * artisan, admin, compte). Facilite la navigation sur mobile.
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-terra hover:text-terra-dark"
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
