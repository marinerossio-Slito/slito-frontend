import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Configuration Vitest pour les tests unitaires et de composants.
 *
 * - environment jsdom : simule un DOM de navigateur côté Node pour React.
 * - setupFiles    : mocks globaux (next/navigation) chargés avant chaque suite.
 * - vite-tsconfig-paths : résolution des alias @/* définis dans tsconfig.json.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Expose Vitest globals (describe, it, expect, afterEach…) without explicit
    // imports — required so that @testing-library/react can register its own
    // afterEach(cleanup) hook automatically.
    globals: true,
    // Exclure les tests Playwright (dossier tests/) qui utilisent leur propre runner.
    exclude: ['tests/**', 'node_modules/**'],
  },
});
