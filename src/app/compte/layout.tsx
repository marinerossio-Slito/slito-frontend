import { DashboardSidebar, type SidebarNavItem } from '@/components/DashboardSidebar';

const COMPTE_NAV: SidebarNavItem[] = [
  { icon: '🏠', label: 'Mon compte',    href: '/compte',                exact: true },
  { icon: '📅', label: 'Rendez-vous',  href: '/compte/rendez-vous' },
  { icon: '💬', label: 'Messagerie',   href: '/compte/messages' },
];

/**
 * Layout partagé de l'espace client : sidebar forest + zone cream.
 */
export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <DashboardSidebar nav={COMPTE_NAV} title="Mon compte" />
      <div className="flex flex-1 flex-col overflow-auto bg-cream">{children}</div>
    </div>
  );
}
