'use client';

/**
 * En-tête commun à toutes les pages publiques.
 *
 * - Sticky : reste visible à la lecture.
 * - Logo bicolore "Sli" (terracotta) + "to" (forest) en Playfair Display.
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

/** Bouton/lien fantôme (contour sand, hover terracotta). */
const ghostClass =
  'rounded-full border border-sand px-5 py-2 text-sm font-medium text-ink-mid transition hover:border-terra hover:text-terra';

/** Bouton primaire terracotta. */
const primaryClass =
  'rounded-full bg-terra px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(196,97,58,0.30)] transition hover:-translate-y-px hover:bg-terra-dark hover:shadow-[0_4px_16px_rgba(196,97,58,0.40)]';

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
        <Link href="/recherche" className={ghostClass} onClick={() => setMobileOpen(false)}>
          Trouver un artisan
        </Link>
        <Link href={accountPath} className={ghostClass} onClick={() => setMobileOpen(false)}>
          {ACCOUNT_LINK_LABELS[accountPath] ?? 'Mon espace'}
        </Link>
        <button type="button" onClick={handleLogout} className={ghostClass}>
          Déconnexion
        </button>
      </>
    ) : (
      <>
        <Link href="/recherche" className={ghostClass} onClick={() => setMobileOpen(false)}>
          Trouver un artisan
        </Link>
        <Link href="/connexion" className={ghostClass} onClick={() => setMobileOpen(false)}>
          Connexion
        </Link>
        <Link href="/inscription" className={primaryClass} onClick={() => setMobileOpen(false)}>
          S&apos;inscrire
        </Link>
      </>
    );

  return (
    <header
      className="sticky top-0 z-50 border-b border-sand bg-warm-white shadow-[0_2px_16px_rgba(26,21,16,0.08)]"
      style={{ backgroundColor: '#FFFDF9' }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-8" style={{ height: '64px' }}>
        {/* Logo bicolore */}
        <Link href="/" aria-label="Slito — Accueil">
          <span className="font-serif text-[26px] font-bold leading-none tracking-[-0.5px]">
            <span className="text-terra">Sli</span>
            <span className="text-forest">to</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        {status === 'loading' ? (
          <span className="hidden h-10 w-56 sm:block" aria-hidden />
        ) : (
          <nav aria-label="Navigation principale" className="hidden items-center gap-3 sm:flex">
            {navLinks}
          </nav>
        )}

        {/* Hamburger mobile */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-mid transition hover:bg-sand-light sm:hidden"
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

      {/* Menu mobile déroulant */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Menu mobile"
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-2 border-b border-sand bg-warm-white px-8 pb-5 pt-3 shadow-[0_8px_24px_rgba(26,21,16,0.10)] sm:hidden"
          style={{ backgroundColor: '#FFFDF9' }}
        >
          {navLinks}
        </nav>
      )}
    </header>
  );
}
