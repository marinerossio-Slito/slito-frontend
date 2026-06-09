'use client';

/**
 * Formulaire de soumission d'un avis pour un rendez-vous terminé
 * (`POST /api/reviews`).
 *
 * Règles du back-end :
 * - Le rendez-vous doit être COMPLETED.
 * - L'auteur doit être l'une des deux parties (client ou artisan).
 * - Un seul avis par partie par rendez-vous (→ 409 Conflict si déjà soumis).
 *
 * Le composant reçoit `onSuccess` pour signaler à `AppointmentList` que l'avis
 * a été envoyé (afin de masquer le bouton « Laisser un avis » pour ce RDV).
 */

import { useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { ApiError } from '@/lib/api';
import { createReview } from '@/lib/reviews';

interface ReviewFormProps {
  appointmentId: number;
  /** Nom du destinataire (ex. nom de l'entreprise) affiché dans le formulaire. */
  targetName: string;
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/** Sélecteur d'étoiles 1–5. */
function StarRatingInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-labelledby={`${id}-label`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
          onClick={() => onChange(star)}
          className={`text-2xl leading-none transition ${value >= star ? 'text-amber-400' : 'text-zinc-200 hover:text-amber-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ appointmentId, targetName, token, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (rating === 0) {
      setFormError('Choisissez une note globale (1 à 5 étoiles).');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview(token, {
        appointmentId,
        rating,
        punctualityRating: punctualityRating > 0 ? punctualityRating : undefined,
        qualityRating: qualityRating > 0 ? qualityRating : undefined,
        comment: comment.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Déjà noté — on traite ça comme un succès silencieux
        onSuccess();
      } else if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError("L'envoi de l'avis a échoué. Réessayez.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-4 flex flex-col gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
    >
      <p className="text-sm font-medium text-zinc-800">
        Votre avis sur <span className="text-zinc-900">{targetName}</span>
      </p>

      {formError && <FormBanner tone="error">{formError}</FormBanner>}

      {/* Note globale */}
      <div className="flex flex-col gap-1.5">
        <span id="rating-label" className="text-sm font-medium text-zinc-700">
          Note globale
        </span>
        <StarRatingInput id="rating" value={rating} onChange={setRating} />
      </div>

      {/* Notes optionnelles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700">
            Ponctualité <span className="font-normal text-zinc-400">(optionnel)</span>
          </span>
          <StarRatingInput id="punctuality" value={punctualityRating} onChange={setPunctualityRating} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700">
            Qualité <span className="font-normal text-zinc-400">(optionnel)</span>
          </span>
          <StarRatingInput id="quality" value={qualityRating} onChange={setQualityRating} />
        </div>
      </div>

      {/* Commentaire */}
      <FormField label="Commentaire" htmlFor="review-comment" optional>
        <textarea
          id="review-comment"
          rows={3}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez votre expérience…"
          className={`${FIELD_CLASSES} resize-none`}
        />
      </FormField>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Envoi…' : 'Publier l\'avis'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
