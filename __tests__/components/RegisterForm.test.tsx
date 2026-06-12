import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { registerArtisan, registerCustomer } from '@/lib/auth';

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

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// On garde les fonctions pures (`primaryAccountPath`, `translateAuthError`...) telles
// quelles, et on ne mocke que les appels réseau d'inscription.
vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>();

  return {
    ...actual,
    registerCustomer: vi.fn(),
    registerArtisan: vi.fn(),
  };
});

/** Helper: configure le mock `useAuth` avec une fonction `login` optionnelle. */
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

/** Remplit les champs communs aux deux types de compte. */
async function fillCommonFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Prénom'), 'Jean');
  await user.type(screen.getByLabelText('Nom'), 'Dupont');
  await user.type(screen.getByLabelText('Adresse email'), 'jean.dupont@example.com');
  await user.type(screen.getByLabelText(/^Mot de passe/), 'motdepasse123');
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.mocked(registerCustomer).mockReset();
    vi.mocked(registerArtisan).mockReset();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it('shows the customer fields by default', () => {
    mockAuth();
    render(<RegisterForm />);

    expect(screen.getByRole('button', { name: 'Je suis un client' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText(/^Adresse personnelle/)).toBeDefined();
    expect(screen.queryByLabelText(/^SIRET/)).toBeNull();
  });

  it('switches to the artisan fields when selected', async () => {
    const user = userEvent.setup();
    mockAuth();
    render(<RegisterForm />);

    await user.click(screen.getByRole('button', { name: 'Je suis un artisan' }));

    expect(screen.getByRole('button', { name: 'Je suis un artisan' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText(/^SIRET/)).toBeDefined();
    expect(screen.getByLabelText(/^Adresse du local professionnel/)).toBeDefined();
    expect(screen.getByLabelText(/^Justificatif d'entreprise/)).toBeDefined();
    expect(screen.queryByLabelText(/^Adresse personnelle/)).toBeNull();
  });

  it('registers a customer, logs them in and redirects to their account space', async () => {
    const user = userEvent.setup();
    const loginFn = vi.fn().mockResolvedValue({
      email: 'jean.dupont@example.com',
      roles: ['ROLE_USER', 'ROLE_CUSTOMER'],
      expiresAt: null,
    });
    mockAuth(loginFn);

    vi.mocked(registerCustomer).mockResolvedValue({
      id: 1,
      email: 'jean.dupont@example.com',
      roles: ['ROLE_USER', 'ROLE_CUSTOMER'],
      isVerified: false,
    });

    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    } as ReturnType<typeof useRouter>);

    render(<RegisterForm />);
    await fillCommonFields(user);
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/compte'));

    expect(registerCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jean.dupont@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        password: 'motdepasse123',
      }),
    );
    expect(loginFn).toHaveBeenCalledWith({ email: 'jean.dupont@example.com', password: 'motdepasse123' });
  });

  it('registers an artisan and shows the pending-approval message', async () => {
    const user = userEvent.setup();
    mockAuth();

    vi.mocked(registerArtisan).mockResolvedValue({
      id: 2,
      email: 'artisan@example.com',
      roles: ['ROLE_USER', 'ROLE_ARTISAN'],
      isApproved: false,
      message: 'Votre compte a été créé et sera examiné par un administrateur.',
    });

    render(<RegisterForm />);
    await user.click(screen.getByRole('button', { name: 'Je suis un artisan' }));

    await user.type(screen.getByLabelText('Prénom'), 'Marie');
    await user.type(screen.getByLabelText('Nom'), 'Martin');
    await user.type(screen.getByLabelText('Adresse email'), 'artisan@example.com');
    await user.type(screen.getByLabelText(/^Mot de passe/), 'motdepasse123');
    await user.type(screen.getByLabelText(/^SIRET/), '12345678901234');
    await user.type(screen.getByLabelText(/^Justificatif d'entreprise/), 'KBIS-1234');

    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    await waitFor(() => {
      expect(screen.getByText('Votre compte a été créé et sera examiné par un administrateur.')).toBeDefined();
    });

    expect(screen.getByRole('link', { name: 'Aller à la page de connexion' }).getAttribute('href')).toBe(
      '/connexion',
    );
  });

  it('shows field-level validation errors returned by the API', async () => {
    const user = userEvent.setup();
    mockAuth();

    vi.mocked(registerCustomer).mockRejectedValue(
      new ApiError(422, { violations: [{ field: 'email', message: 'Cette adresse email est déjà utilisée.' }] }),
    );

    render(<RegisterForm />);
    await fillCommonFields(user);
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    await waitFor(() => {
      expect(
        screen.getByText('Le formulaire contient des erreurs : corrigez les champs signalés ci-dessous.'),
      ).toBeDefined();
    });
    expect(screen.getByText('Cette adresse email est déjà utilisée.')).toBeDefined();
  });

  it('translates known authentication error messages', async () => {
    const user = userEvent.setup();
    mockAuth();

    vi.mocked(registerCustomer).mockRejectedValue(new ApiError(401, { error: 'Invalid credentials.' }));

    render(<RegisterForm />);
    await fillCommonFields(user);
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }));

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeDefined();
    });
  });
});
