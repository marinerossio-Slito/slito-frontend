'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { ApiError } from '@/lib/api';
import { requestPasswordReset } from '@/lib/auth';

/**
 * Demande de réinitialisation de mot de passe (`POST /api/password/reset`).
 *
 * Le back-end renvoie systématiquement le même message de succès, que l'email
 * corresponde ou non à un compte (cf. PasswordResetController::requestReset —
 * mesure de sécurité pour ne pas révéler les emails enregistrés). Le
 * formulaire se contente donc d'afficher ce message tel quel : il n'y a rien
 * de plus à distinguer côté front.
 */
export function PasswordResetRequestForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "La demande n'a pas pu être envoyée. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (message) {
    return (
      <div className="flex flex-col gap-5">
        <FormBanner tone="success">{message}</FormBanner>
        <Link href="/connexion" className="text-center text-sm font-medium text-amber-700 transition hover:text-amber-800">
          Retour à la connexion
        </Link>
      </div>
    );
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
      </button>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/connexion" className="font-medium text-amber-700 transition hover:text-amber-800">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
