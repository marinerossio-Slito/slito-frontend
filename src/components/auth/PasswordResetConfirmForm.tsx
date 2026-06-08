'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { ApiError } from '@/lib/api';
import { confirmPasswordReset } from '@/lib/auth';

/**
 * Confirmation de réinitialisation (`POST /api/password/reset/{token}`,
 * cf. PasswordResetController::confirmReset). Le `token` provient du lien
 * envoyé par email — il est extrait de l'URL côté page (`[token]/page.tsx`) et
 * transmis tel quel ; ce composant ne fait que collecter le nouveau mot de
 * passe et appeler l'API.
 *
 * Deux issues possibles côté API : succès (`{ message }`) ou jeton invalide /
 * expiré (`{ error }`, HTTP 400 — cf. `ApiError`, qui sait extraire les deux
 * formes). On vérifie aussi côté client que les deux saisies correspondent,
 * pour éviter un aller-retour inutile en cas de faute de frappe.
 */
export function PasswordResetConfirmForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await confirmPasswordReset(token, password);
      setMessage(response.message);
    } catch (err) {
      if (err instanceof ApiError && err.body?.violations?.length) {
        setError(err.body.violations.map((violation) => violation.message).join(' '));
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('La réinitialisation a échoué. Réessayez.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (message) {
    return (
      <div className="flex flex-col gap-5">
        <FormBanner tone="success">{message}</FormBanner>
        <Link
          href="/connexion"
          className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && <FormBanner tone="error">{error}</FormBanner>}

      <FormField label="Nouveau mot de passe" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={FIELD_CLASSES}
        />
        <span className="text-xs font-normal text-zinc-400">8 caractères minimum.</span>
      </FormField>

      <FormField label="Confirmer le mot de passe" htmlFor="confirmation">
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className={FIELD_CLASSES}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Validation…' : 'Réinitialiser le mot de passe'}
      </button>
    </form>
  );
}
