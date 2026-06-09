/**
 * Pastille de statut pour un rendez-vous — reflète les quatre valeurs de
 * l'enum `AppointmentStatus` du back-end (cf. `slito-backend/src/Enum/AppointmentStatus.php`).
 */

import type { AppointmentStatus } from '@/types/appointment';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-sand-light text-ink-mid border-sand' },
  CONFIRMED: { label: 'Confirmé', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Terminé', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  CANCELLED: { label: 'Annulé', className: 'bg-cream text-ink-light border-sand' },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
