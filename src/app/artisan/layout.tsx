import { DashboardSidebar, type SidebarNavItem } from '@/components/DashboardSidebar';

const ARTISAN_NAV: SidebarNavItem[] = [
  { icon: '🏠', label: 'Vue d’ensemble', href: '/artisan', exact: true },
  { icon: '📊', label: 'Dashboard',            href: '/artisan/dashboard' },
  { icon: '🗓️', label: 'Agenda',               href: '/artisan/agenda' },
  { icon: '🏪', label: 'Ma fiche',             href: '/artisan/fiche' },
  { icon: '💎', label: 'Abonnement',           href: '/artisan/abonnement' },
];

/**
 * Layout partagé de l'espace artisan : sidebar forest à gauche +
 * zone de contenu cream à droite.
 * Les pages individuelles conservent leur propre `<RouteGuard roles={…}>`.
 */
export default function ArtisanSpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <DashboardSidebar nav={ARTISAN_NAV} title="Espace artisan" />
      <div className="flex flex-1 flex-col overflow-auto bg-cream">{children}</div>
    </div>
  );
}
