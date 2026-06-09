import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests bout-en-bout.
 *
 * Les tests ciblent des pages qui ne dépendent pas du back-end Symfony
 * (formulaires d'authentification, page 404). Le serveur Next.js est lancé
 * automatiquement en mode développement avant la suite ; si un serveur tourne
 * déjà sur le port 3000, il est réutilisé (`reuseExistingServer: true`).
 *
 * Pour lancer la suite : `npm run test:e2e`
 * Pour ouvrir le rapport HTML  : `npx playwright show-report`
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // `next dev` suffit pour les pages statiques et les Client Components ;
    // les pages Server Components qui appellent l'API échoueront si le
    // back-end n'est pas démarré (hors périmètre de cette suite E2E).
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
