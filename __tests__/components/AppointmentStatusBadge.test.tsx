import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppointmentStatusBadge } from '@/components/AppointmentStatusBadge';

describe('AppointmentStatusBadge', () => {
  it('affiche « En attente » pour le statut PENDING', () => {
    render(<AppointmentStatusBadge status="PENDING" />);
    expect(screen.getByText('En attente')).toBeDefined();
  });

  it('affiche « Confirmé » pour le statut CONFIRMED', () => {
    render(<AppointmentStatusBadge status="CONFIRMED" />);
    expect(screen.getByText('Confirmé')).toBeDefined();
  });

  it('affiche « Terminé » pour le statut COMPLETED', () => {
    render(<AppointmentStatusBadge status="COMPLETED" />);
    expect(screen.getByText('Terminé')).toBeDefined();
  });

  it('affiche « Annulé » pour le statut CANCELLED', () => {
    render(<AppointmentStatusBadge status="CANCELLED" />);
    expect(screen.getByText('Annulé')).toBeDefined();
  });
});
