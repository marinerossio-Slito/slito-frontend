import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';

import { LoginForm } from '@/components/auth/LoginForm';
import { ApiError } from '@/lib/api';

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

// Mock the auth hook.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

/** Helper: set up the default auth mock with an optional custom login fn. */
function mockAuth(loginFn = vi.fn()) {
  vi.mocked(useAuth).mockReturnValue({
    status: 'anonymous',
    user: null,
    token: null,
    login: loginFn,
    logout: vi.fn(),
    hasRole: vi.fn(() => false),
  });
}

describe('LoginForm', () => {
  it('renders email, password fields and the submit button', () => {
    mockAuth();
    render(<LoginForm redirectTo={null} />);

    expect(screen.getByLabelText(/Adresse email/i)).toBeDefined();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeDefined();
  });

  it('renders the "Mot de passe oublie ?" link', () => {
    mockAuth();
    render(<LoginForm redirectTo={null} />);
    expect(screen.getByRole('link', { name: /Mot de passe oubli/i })).toBeDefined();
  });

  it('disables the button and shows "Connexion..." while submitting', async () => {
    const user = userEvent.setup();

    // login never resolves — simulates an in-flight request
    const loginFn = vi.fn(() => new Promise<never>(() => {}));
    mockAuth(loginFn);

    render(<LoginForm redirectTo={null} />);

    await user.type(screen.getByLabelText(/Adresse email/i), 'u@test.com');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'secret');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Connexion/i })).toBeDefined();
    });
  });

  it('shows a French error message when login() throws an ApiError', async () => {
    const user = userEvent.setup();
    const loginFn = vi.fn().mockRejectedValue(
      new ApiError(401, { error: 'Invalid credentials.' }),
    );
    mockAuth(loginFn);

    render(<LoginForm redirectTo={null} />);

    await user.type(screen.getByLabelText(/Adresse email/i), 'u@test.com');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));

    // translateAuthError maps "Invalid credentials." → "Email ou mot de passe incorrect."
    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeDefined();
    });
  });

  it('calls router.push after a successful login', async () => {
    const user = userEvent.setup();
    const mockPush = vi.fn();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    } as ReturnType<typeof useRouter>);

    const loginFn = vi.fn().mockResolvedValue({
      email: 'u@test.com',
      roles: ['ROLE_CUSTOMER'],
      expiresAt: Date.now() + 3600_000,
    });
    mockAuth(loginFn);

    render(<LoginForm redirectTo={null} />);

    await user.type(screen.getByLabelText(/Adresse email/i), 'u@test.com');
    await user.type(screen.getByLabelText(/Mot de passe/i), 'secret');
    await user.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/compte');
    });
  });
});
