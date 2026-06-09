import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders the message prop', () => {
    render(<EmptyState message="Aucun resultat pour le moment." />);
    expect(screen.getByText('Aucun resultat pour le moment.')).toBeDefined();
  });

  it('accepts any string message', () => {
    render(<EmptyState message="Liste vide" />);
    expect(screen.getByText('Liste vide')).toBeDefined();
  });
});
