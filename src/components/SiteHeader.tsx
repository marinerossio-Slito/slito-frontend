'use client';

/**
 * En-tête commun à toutes les pages.
 *
 * - Fond forest uni (#2D4A3E) — toujours opaque, garanti par style inline.
 * - Logo : "Sli" en terra-light (orange) + "to" en blanc — Playfair Display.
 * - Liens : texte blanc/80, bordure blanche/20, hover plein blanc.
 * - CTA principal : fond terra (orange) pour le contraste.
 * - Mobile : hamburger blanc + menu déroulant sur fond forest.
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

/** Lien fantôme sur fond sombre : texte blanc, bordure blanche/30. */
const ghostClass =
  'rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white';

/** Bouton primaire terracotta : contraste orange sur kaki. */
const primaryClass =
  'rounded-full bg-terra px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-terra-dark';

/** Style inline du fond kaki — garantit l'opacité même avant le CSS Tailwind. */
const FOREST_BG = '#2D4A3E' as const;

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
      className="sticky top-0 z-50 border-b border-white/10 bg-forest"
      style={{ backgroundColor: FOREST_BG }}
    >
      <div
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-8"
        style={{ height: '64px' }}
      >
        {/* Logo bicolore */}
        <Link href="/" aria-label="Slito — Accueil">
          <span className="font-serif text-[26px] font-bold leading-none tracking-[-0.5px]">
            <span className="text-terra-light">Sli</span>
            <span className="text-white">to</span>
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
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white sm:hidden"
        >
          {mobileOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
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
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-2 border-b border-white/10 bg-forest px-8 pb-6 pt-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:hidden"
          style={{ backgroundColor: FOREST_BG }}
        >
          {navLinks}
        </nav>
      )}
    </header>
  );
}
