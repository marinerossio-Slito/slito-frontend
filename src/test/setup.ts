import { vi } from 'vitest';

/**
 * Configuration globale de l'environnement de test Vitest.
 *
 * Chargé avant chaque suite de tests (cf. `vitest.config.mts` > setupFiles).
 * Seuls les modules qui posent problème dans jsdom (pas de routeur, pas de
 * DOM natif Next.js) sont mockés ici — le reste est géré au niveau de chaque
 * fichier de test avec `vi.mock(...)`.
 */

// next/navigation n'existe pas dans jsdom (il dépend d'un contexte App Router
// fourni par Next.js côté serveur). On expose des stubs pour que les composants
// qui appellent useRouter / usePathname / useSearchParams puissent être rendus.
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));
