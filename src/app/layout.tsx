import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/hooks/useAuth';

import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Slito — Réservez un artisan de confiance',
    template: '%s · Slito',
  },
  description:
    "Slito est une plateforme de réservation d'artisans : trouvez un professionnel, consultez les avis et prenez rendez-vous en ligne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream font-sans">
        <ToastProvider>
          <AuthProvider>
            {/* Lien d'évitement pour la navigation clavier (a11y) */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-terra focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Aller au contenu principal
            </a>
            <SiteHeader />
            <main id="main-content" className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
