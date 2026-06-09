import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';

import { RouteGuard } from '@/components/RouteGuard';

// Render next/link as a plain <a> tag in jsdom.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock the auth hook; each test overrides the return value.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Import after vi.mock to get the mocked version.
import { useAuth } from '@/hooks/useAuth';

const CHILD_TEXT = 'Contenu protege';

describe('RouteGuard', () => {
  it('shows a loading heading when status is "loading"', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'loading',
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => false),
    });

    render(
      <RouteGuard>
        <p>{CHILD_TEXT}</p>
      </RouteGuard>,
    );

    // The heading contains "session" — accent-safe substring match
    expect(screen.getByRole('heading', { name: /session/i })).toBeDefined();
    expect(screen.queryByText(CHILD_TEXT)).toBeNull();
  });

  it('redirects to /connexion when status is "anonymous"', async () => {
    const mockReplace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    } as ReturnType<typeof useRouter>);

    vi.mocked(useAuth).mockReturnValue({
      status: 'anonymous',
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => false),
    });

    render(
      <RouteGuard>
        <p>{CHILD_TEXT}</p>
      </RouteGuard>,
    );

    // The guard message is visible
    expect(screen.getByRole('heading', { name: /session/i })).toBeDefined();

    // The router replaces the current URL with the login page
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/connexion'));
    });
  });

  it('shows an "Acces refuse" heading when the user lacks the required role', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: { email: 'user@test.com', roles: ['ROLE_CUSTOMER'], expiresAt: Date.now() + 3600_000 },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => false),
    });

    render(
      <RouteGuard roles={['ROLE_ADMIN']}>
        <p>{CHILD_TEXT}</p>
      </RouteGuard>,
    );

    // The heading contains "refus" — matches both "refus" and accented "refusé"
    expect(screen.getByRole('heading', { name: /refus/i })).toBeDefined();
    expect(screen.queryByText(CHILD_TEXT)).toBeNull();
  });

  it('renders children when the user is authenticated with the required role', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: { email: 'admin@test.com', roles: ['ROLE_ADMIN'], expiresAt: Date.now() + 3600_000 },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => true),
    });

    render(
      <RouteGuard roles={['ROLE_ADMIN']}>
        <p>{CHILD_TEXT}</p>
      </RouteGuard>,
    );

    expect(screen.getByText(CHILD_TEXT)).toBeDefined();
  });

  it('renders children when no role is required', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: { email: 'u@test.com', roles: ['ROLE_CUSTOMER'], expiresAt: Date.now() + 3600_000 },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(() => true),
    });

    render(
      <RouteGuard>
        <p>{CHILD_TEXT}</p>
      </RouteGuard>,
    );

    expect(screen.getByText(CHILD_TEXT)).toBeDefined();
  });
});
