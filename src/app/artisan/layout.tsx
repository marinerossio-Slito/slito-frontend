'use client';

import { useEffect, useState } from 'react';

import { DashboardSidebar, type SidebarNavItem } from '@/components/DashboardSidebar';
import { useAuth } from '@/hooks/useAuth';
import { fetchDashboard } from '@/lib/artisan';

const ARTISAN_NAV: SidebarNavItem[] = [
  { icon: '🏠', label: 'Tableau de bord', href: '/artisan/dashboard' },
  { icon: '📋', label: 'Ma présentation',  href: '/artisan/fiche' },
  { icon: '📅', label: 'Agenda',           href: '/artisan/agenda' },
  { icon: '💬', label: 'Messagerie',       href: '/artisan/messages' },
  { icon: '👥', label: 'Clients',          href: '/artisan/clients', soon: true },
  { icon: '📊', label: 'Analytics',        href: '#', soon: true },
  { icon: '💰', label: 'Facturation',      href: '#', soon: true },
];

/**
 * Layout espace artisan : sidebar forest + zone de contenu crème.
 * Récupère le nom de l'entreprise pour l'afficher dans la sidebar.
 */
export default function ArtisanSpaceLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [businessName, setBusinessName] = useState('Espace artisan');

  useEffect(() => {
    if (!token) return;
    fetchDashboard(token)
      .then((data) => {
        if (data.business?.name) {
          setBusinessName(data.business.name);
        }
        // On pourrait afficher catégorie + ville si la fiche le fournit un jour
      })
      .catch(() => { /* sidebar se replie sur le titre par défaut */ });
  }, [token]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      <DashboardSidebar nav={ARTISAN_NAV} title={businessName} />
      <div className="flex flex-1 flex-col overflow-auto bg-cream">{children}</div>
    </div>
  );
}
