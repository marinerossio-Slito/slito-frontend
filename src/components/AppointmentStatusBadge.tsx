/**
 * Pastille de statut pour un rendez-vous — reflète les quatre valeurs de
 * l'enum `AppointmentStatus` du back-end (cf. `slito-backend/src/Enum/AppointmentStatus.php`).
 */

import type { AppointmentStatus } from '@/types/appointment';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Confirmé', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Terminé', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  CANCELLED: { label: 'Annulé', className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
