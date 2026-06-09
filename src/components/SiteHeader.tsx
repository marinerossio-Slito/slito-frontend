'use client';

/**
 * En-tête commun à toutes les pages publiques.
 *
 * - Desktop : liens horizontaux dans la barre de navigation.
 * - Mobile (< sm) : bouton hamburger qui ouvre un menu vertical fullscreen.
 *
 * Reste un Client Component car la navigation dépend de l'état d'authentification
 * (`useAuth`), connu uniquement côté client (JWT dans localStorage).
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { primaryAccountPath } from '@/lib/auth';

const ACCOUNT_LINK_LABELS: Record<string, string> = {
  '/compte': 'Mon compte',
  '/artisan': 'Espace artisan',
  '/admin': 'Administration',
};

export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    setMobileOpen(false);
    logout();
    router.push('/');
  }

  const accountPath = primaryAccountPath(user);

  const navLinks =
    status === 'loading' ? null : status === 'authenticated' && user ? (
      <>
        <Link href="/recherche" className="transition hover:text-zinc-900" onClick={() => setMobileOpen(false)}>
          Trouver un artisan
        </Link>
        <Link href={accountPath} className="transition hover:text-zinc-900" onClick={() => setMobileOpen(false)}>
          {ACCOUNT_LINK_LABELS[accountPath] ?? 'Mon espace'}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-zinc-300 px-4 py-2 text-zinc-700 transition hover:border-zinc-400"
        >
          Déconnexion
        </button>
      </>
    ) : (
      <>
        <Link href="/recherche" className="transition hover:text-zinc-900" onClick={() => setMobileOpen(false)}>
          Trouver un artisan
        </Link>
        <Link href="/connexion" className="transition hover:text-zinc-900" onClick={() => setMobileOpen(false)}>
          Connexion
        </Link>
        <Link
          href="/inscription"
          onClick={() => setMobileOpen(false)}
          className="rounded-full bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700"
        >
          Inscription
        </Link>
      </>
    );

  return (
    <header className="relative border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Slito
        </Link>

        {/* Desktop nav */}
        {status === 'loading' ? (
          <span className="hidden h-9 w-48 sm:block" aria-hidden />
        ) : (
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-6 text-sm font-medium text-zinc-600 sm:flex"
          >
            {navLinks}
          </nav>
        )}

        {/* Hamburger (mobile only) */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 sm:hidden"
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Menu mobile"
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-zinc-200 bg-white px-6 pb-4 pt-2 text-sm font-medium text-zinc-700 shadow-md sm:hidden"
        >
          {navLinks}
        </nav>
      )}
    </header>
  );
}
