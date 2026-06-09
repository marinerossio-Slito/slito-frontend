import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RatingBadge } from '@/components/RatingBadge';

describe('RatingBadge', () => {
  describe('no reviews', () => {
    it('shows "Pas encore d\'avis" when averageRating is null', () => {
      render(<RatingBadge averageRating={null} reviewsCount={0} />);
      expect(screen.getByText(/Pas encore/)).toBeDefined();
    });
  });

  describe('with reviews', () => {
    it('shows the rating formatted to one decimal place', () => {
      render(<RatingBadge averageRating={4.7} reviewsCount={12} />);
      expect(screen.getByText(/4\.7/)).toBeDefined();
    });

    it('shows the review count', () => {
      render(<RatingBadge averageRating={3.5} reviewsCount={5} />);
      expect(screen.getByText(/5 avis/)).toBeDefined();
    });

    it('formats integer rating with one decimal (e.g. 5.0)', () => {
      render(<RatingBadge averageRating={5} reviewsCount={1} />);
      expect(screen.getByText(/5\.0/)).toBeDefined();
    });
  });

  describe('size variants', () => {
    it('renders without error with size="sm" (default)', () => {
      const { container } = render(<RatingBadge averageRating={4} reviewsCount={3} size="sm" />);
      expect(container.firstChild).toBeDefined();
    });

    it('renders without error with size="lg"', () => {
      const { container } = render(<RatingBadge averageRating={4} reviewsCount={3} size="lg" />);
      expect(container.firstChild).toBeDefined();
    });
  });
});
