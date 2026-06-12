import { DashboardSidebar, type SidebarNavItem } from '@/components/DashboardSidebar';

const ADMIN_NAV: SidebarNavItem[] = [
  { icon: '🏠', label: 'Administration',    href: '/admin', exact: true },
  { icon: '📈', label: 'Statistiques',      href: '/admin/stats' },
  { icon: '🏷️', label: 'Catégories',        href: '/admin/categories' },
  { icon: '👥', label: 'Utilisateurs',      href: '/admin/utilisateurs' },
];

/**
 * Layout partagé de l'espace admin : sidebar forest + zone cream.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      <DashboardSidebar nav={ADMIN_NAV} title="Administration" />
      <div className="flex flex-1 flex-col overflow-auto bg-cream">{children}</div>
    </div>
  );
}
