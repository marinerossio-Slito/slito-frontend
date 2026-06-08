'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { primaryAccountPath, translateAuthError } from '@/lib/auth';

/**
 * Formulaire de connexion (`POST /api/login` via `useAuth().login`).
 *
 * `redirectTo` vient du paramètre `?next=` (cf. `RouteGuard`, qui y redirige
 * les visiteurs anonymes voulant accéder à une page protégée) : une fois
 * connecté, on renvoie l'utilisateur là où il voulait aller plutôt que vers son
 * espace par défaut. Validé côté page serveur (`/connexion`) pour ne renvoyer
 * que des chemins internes — jamais une URL externe (open redirect).
 */
export function LoginForm({ redirectTo }: { redirectTo: string | null }) {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      router.push(redirectTo ?? primaryAccountPath(user));
    } catch (err) {
      setError(err instanceof ApiError ? translateAuthError(err.message) : 'La connexion a échoué. Réessayez.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && <FormBanner tone="error">{error}</FormBanner>}

      <FormField label="Adresse email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Mot de passe" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={FIELD_CLASSES}
        />
      </FormField>

      <div className="flex justify-end text-sm">
        <Link href="/mot-de-passe-oublie" className="font-medium text-amber-700 transition hover:text-amber-800">
          Mot de passe oublié ?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-medium text-amber-700 transition hover:text-amber-800">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
