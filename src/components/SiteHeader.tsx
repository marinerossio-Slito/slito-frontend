'use client';

/**
 * En-tête commun à toutes les pages.
 *
 * - Fond crème (#FFFDF9) — toujours opaque, garanti par style inline.
 * - Logo : "Sli" en terra-light (orange) + "to" en ink (foncé) — Playfair Display.
 * - Liens ghost : bordure sand, texte ink-mid, hover terra.
 * - CTA "S'inscrire" : fond terra (orange).
 * - CTA "Démo pro" : fond forest (vert kaki) + emoji 🔨.
 * - Mobile : hamburger ink + menu déroulant sur fond crème.
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

/** Lien fantôme sur fond clair : bordure sand, texte foncé. */
const ghostClass =
  'rounded-full border border-sand px-5 py-2 text-sm font-medium text-ink-mid transition hover:border-terra/60 hover:text-ink';

/** Bouton primaire terracotta. */
const primaryClass =
  'rounded-full bg-terra px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-terra-dark';

/** Bouton forest (Démo pro). */
const forestClass =
  'rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:opacity-90';

/** Fond crème — garantit l'opacité même avant le CSS Tailwind. */
const CREAM_BG = '#FFFDF9' as const;
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
        <Link href="/connexion" className={ghostClass} onClick={() => setMobileOpen(false)}>
          Se connecter
        </Link>
        <Link
          href="/inscription"
          className={primaryClass}
          style={{ backgroundColor: '#C4613A' }}
          onClick={() => setMobileOpen(false)}
        >
          S&apos;inscrire
        </Link>
        <Link
          href="/inscription?type=artisan"
          className={forestClass}
          style={{ backgroundColor: FOREST_BG }}
          onClick={() => setMobileOpen(false)}
        >
          🔨 Démo pro
        </Link>
      </>
    );

  return (
    <header
      className="sticky top-0 z-50 border-b border-sand bg-warm-white"
      style={{ backgroundColor: CREAM_BG }}
    >
      <div
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-8"
        style={{ height: '64px' }}
      >
        {/* Logo bicolore */}
        <Link href="/" aria-label="Slito — Accueil">
          <span className="font-serif text-[26px] font-bold leading-none tracking-[-0.5px]">
            <span className="text-terra-light" style={{ color: '#E8896A' }}>Sli</span>
            <span className="text-ink">to</span>
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
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-mid transition hover:bg-sand-light hover:text-ink sm:hidden"
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
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-2 border-b border-sand bg-warm-white px-8 pb-6 pt-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:hidden"
          style={{ backgroundColor: CREAM_BG }}
        >
          {navLinks}
        </nav>
      )}
    </header>
  );
}
