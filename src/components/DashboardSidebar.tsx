'use client';

/**
 * Sidebar de navigation des espaces connectés.
 * - Fond forest, item actif bg-terra/20.
 * - `soon?: true` → badge « Bientôt », lien désactivé.
 * - Avatar avec initiales (dérivées du nom ou de l'e-mail).
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

export interface SidebarNavItem {
  icon: string;
  label: string;
  href: string;
  exact?: boolean;
  /** Si true : badge « Bientôt » + élément non cliquable. */
  soon?: boolean;
}

function initials(str: string): string {
  // Essaie de produire 2 initiales à partir d'un nom ou d'un e-mail
  const clean = str.split('@')[0]; // retire le domaine si c'est un e-mail
  const parts = clean.split(/[\s._\-+]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

export function DashboardSidebar({
  nav,
  title,
  subtitle,
}: {
  nav: SidebarNavItem[];
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  function isActive(item: SidebarNavItem) {
    if (item.soon) return false;
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  const avatarLetters = initials(title || user?.email || '??');
  const displaySubtitle = subtitle ?? user?.email ?? '';

  return (
    <>
    {/* Navigation mobile (< lg) : barre d'onglets horizontale défilable */}
    <nav
      aria-label="Navigation du tableau de bord"
      className="flex gap-2 overflow-x-auto border-b border-sand bg-warm-white px-4 py-3 lg:hidden"
    >
      {nav.map((item) => {
        if (item.soon) {
          return (
            <span
              key={item.href + item.label}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-sand-light px-4 py-1.5 text-sm font-medium text-ink-light/60"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
              <span className="rounded-full bg-sand px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-light">
                Bientôt
              </span>
            </span>
          );
        }

        const active = isActive(item);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? 'bg-terra text-white' : 'bg-sand-light text-ink-mid hover:bg-sand'
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>

    <aside
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col overflow-y-auto px-4 py-6 lg:flex"
      style={{ backgroundColor: '#334534' }}
    >
      {/* Profil */}
      <div className="mb-6 border-b border-white/10 pb-6 text-center">
        <div
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: '#c56339' }}
        >
          {avatarLetters}
        </div>
        <p className="text-sm font-bold text-white">{title}</p>
        {displaySubtitle && (
          <p className="mt-0.5 truncate px-2 text-xs text-white/50" title={displaySubtitle}>
            {displaySubtitle}
          </p>
        )}
      </div>

      {/* Liens */}
      <nav aria-label="Navigation du tableau de bord" className="flex flex-1 flex-col gap-0.5">
        {nav.map((item) => {
          const active = isActive(item);

          if (item.soon) {
            return (
              <div
                key={item.href + item.label}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/30 cursor-default"
              >
                <span className="w-5 shrink-0 text-center text-base" aria-hidden>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/40">
                  Bientôt
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/[0.08] hover:text-white/90'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="w-5 shrink-0 text-center text-base" aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/45 transition hover:bg-white/[0.08] hover:text-white/70"
      >
        <span className="w-5 shrink-0 text-center text-base" aria-hidden>↩</span>
        Déconnexion
      </button>
    </aside>
    </>
  );
}
