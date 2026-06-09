'use client';

/**
 * En-tête commun.
 * - Public / client : fond crème, 3 boutons (Se connecter / S'inscrire / Espace pro).
 * - Artisan connecté : fond crème, cloche + "Mon tableau de bord" + avatar initiales.
 * - Autres rôles : liens ghost (Mon espace / Déconnexion).
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

const ghostClass =
  'rounded-full border border-sand px-5 py-2 text-sm font-medium text-ink-mid transition hover:border-terra/60 hover:text-ink';

const primaryClass =
  'rounded-full bg-terra px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-terra-dark';

const forestClass =
  'rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:opacity-90';

const CREAM_BG = '#FFFDF9' as const;
const FOREST_BG = '#2D4A3E' as const;

/** Deux premières initiales à partir de l'e-mail (ex. marine.rossio@ → MR). */
function emailInitials(email: string): string {
  const [local] = email.split('@');
  const parts = local.split(/[._\-+]/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    setMobileOpen(false);
    logout();
    router.push('/');
  }

  const isArtisan = user?.roles.includes('ROLE_ARTISAN') ?? false;
  const accountPath = primaryAccountPath(user);

  /* ── Navigation selon le contexte ─────────────────────────────── */
  const navLinks =
    status === 'loading' ? null
    : status === 'authenticated' && user && isArtisan ? (
      /* Topbar artisan : cloche + tableau de bord + avatar */
      <>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-sand text-ink-mid transition hover:bg-sand-light"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </button>

        <Link
          href="/artisan/dashboard"
          className={primaryClass}
          style={{ backgroundColor: '#C4613A' }}
        >
          Mon tableau de bord
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={`Déconnexion (${user.email})`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sand bg-warm-white text-[13px] font-semibold text-ink-mid transition hover:bg-sand-light"
        >
          {emailInitials(user.email)}
        </button>
      </>
    )
    : status === 'authenticated' && user ? (
      /* Autres rôles connectés */
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
      /* Visiteur non connecté */
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
          href="/connexion"
          className={forestClass}
          style={{ backgroundColor: FOREST_BG }}
          onClick={() => setMobileOpen(false)}
        >
          🔨 Espace pro
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
        {/* Logo */}
        <Link href="/" aria-label="Slito — Accueil">
          <span className="font-serif text-[26px] font-bold leading-none tracking-[-0.5px]">
            <span className="text-terra-light" style={{ color: '#E8896A' }}>Sli</span>
            <span className="text-ink">to</span>
          </span>
        </Link>

        {/* Desktop nav */}
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

      {/* Menu mobile */}
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
