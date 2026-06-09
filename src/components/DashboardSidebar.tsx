'use client';

/**
 * Sidebar de navigation commune aux espaces connectés (artisan, client, admin).
 *
 * - Fond forest, item actif en terracotta/25%.
 * - Sticky sous le header (top: 64px = hauteur du SiteHeader).
 * - Masquée sur mobile (← les pages gardent leur BackLink comme fallback).
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

export interface SidebarNavItem {
  icon: string;
  label: string;
  href: string;
  /** Si true, l'item est considéré actif uniquement en correspondance exacte. */
  exact?: boolean;
}

export function DashboardSidebar({
  nav,
  title,
}: {
  nav: SidebarNavItem[];
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  function isActive(item: SidebarNavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col overflow-y-auto bg-forest px-4 py-6 lg:flex">
      {/* Profil */}
      <div className="mb-6 border-b border-white/10 pb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-terra text-2xl text-white">
          👤
        </div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {user && (
          <p className="mt-0.5 truncate px-2 text-xs text-white/50" title={user.email}>
            {user.email}
          </p>
        )}
      </div>

      {/* Liens de navigation */}
      <nav aria-label="Navigation du tableau de bord" className="flex flex-1 flex-col gap-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              isActive(item)
                ? 'bg-terra/25 text-white'
                : 'text-white/65 hover:bg-white/[0.08] hover:text-white/90'
            }`}
            aria-current={isActive(item) ? 'page' : undefined}
          >
            <span className="w-5 shrink-0 text-center text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Déconnexion */}
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white/75"
      >
        <span className="w-5 shrink-0 text-center" aria-hidden>↩</span>
        Déconnexion
      </button>
    </aside>
  );
}
