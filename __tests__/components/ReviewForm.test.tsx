import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewForm } from '@/components/account/ReviewForm';
import { ApiError } from '@/lib/api';
import { createReview } from '@/lib/reviews';
import type { Review } from '@/types/review';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast }),
}));

vi.mock('@/lib/reviews', () => ({
  createReview: vi.fn(),
}));

const SAMPLE_REVIEW: Review = {
  id: 1,
  rating: 5,
  punctualityRating: null,
  qualityRating: null,
  comment: null,
  createdAt: '2026-06-01T10:00:00+00:00',
  authorType: 'CUSTOMER',
  appointmentId: 42,
  author: null,
  target: null,
};

function setup() {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  render(
    <ReviewForm
      appointmentId={42}
      targetName="Plomberie Dupont"
      token="jwt-token"
      onSuccess={onSuccess}
      onCancel={onCancel}
    />,
  );

  return { onSuccess, onCancel };
}

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.mocked(createReview).mockReset();
    showToast.mockReset();
  });

  it('exposes the rating groups with their visible labels via aria-labelledby', () => {
    setup();

    expect(screen.getByRole('radiogroup', { name: 'Note globale' })).toBeDefined();
    expect(screen.getByRole('radiogroup', { name: 'Ponctualité (optionnel)' })).toBeDefined();
    expect(screen.getByRole('radiogroup', { name: 'Qualité (optionnel)' })).toBeDefined();
  });

  it('lets the user pick a star rating, toggling aria-pressed', async () => {
    const user = userEvent.setup();
    setup();

    const ratingGroup = screen.getByRole('radiogroup', { name: 'Note globale' });
    const fourStars = within(ratingGroup).getByRole('button', { name: '4 étoiles' });
    const fiveStars = within(ratingGroup).getByRole('button', { name: '5 étoiles' });

    expect(fourStars.getAttribute('aria-pressed')).toBe('false');

    await user.click(fourStars);

    expect(fourStars.getAttribute('aria-pressed')).toBe('true');
    expect(fiveStars.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows a validation error when submitting without an overall rating', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole('button', { name: "Publier l'avis" }));

    expect(screen.getByText('Choisissez une note globale (1 à 5 étoiles).')).toBeDefined();
    expect(createReview).not.toHaveBeenCalled();
  });

  it('submits the review and reports success', async () => {
    vi.mocked(createReview).mockResolvedValue(SAMPLE_REVIEW);
    const user = userEvent.setup();
    const { onSuccess } = setup();

    const ratingGroup = screen.getByRole('radiogroup', { name: 'Note globale' });
    await user.click(within(ratingGroup).getByRole('button', { name: '5 étoiles' }));
    await user.click(screen.getByRole('button', { name: "Publier l'avis" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    expect(createReview).toHaveBeenCalledWith(
      'jwt-token',
      expect.objectContaining({ appointmentId: 42, rating: 5 }),
    );
    expect(showToast).toHaveBeenCalledWith('Merci, votre avis a été publié !', 'success');
  });

  it('treats a 409 conflict (already reviewed) as a silent success', async () => {
    vi.mocked(createReview).mockRejectedValue(new ApiError(409, null));
    const user = userEvent.setup();
    const { onSuccess } = setup();

    const ratingGroup = screen.getByRole('radiogroup', { name: 'Note globale' });
    await user.click(within(ratingGroup).getByRole('button', { name: '3 étoiles' }));
    await user.click(screen.getByRole('button', { name: "Publier l'avis" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(showToast).not.toHaveBeenCalled();
  });

  it('shows an error banner and toast for other API errors', async () => {
    vi.mocked(createReview).mockRejectedValue(new ApiError(500, { error: 'Erreur serveur.' }));
    const user = userEvent.setup();
    const { onSuccess } = setup();

    const ratingGroup = screen.getByRole('radiogroup', { name: 'Note globale' });
    await user.click(within(ratingGroup).getByRole('button', { name: '3 étoiles' }));
    await user.click(screen.getByRole('button', { name: "Publier l'avis" }));

    await waitFor(() => expect(screen.getByText('Erreur serveur.')).toBeDefined());
    expect(onSuccess).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith('Erreur serveur.', 'error');
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = setup();

    await user.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(onCancel).toHaveBeenCalled();
  });
});
