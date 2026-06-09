'use client';

/**
 * Panneau latéral de la fiche entreprise permettant de prendre rendez-vous.
 *
 * Comportement selon l'état d'authentification :
 * - `loading` : squelette (état transitoire qui évite un flash de contenu).
 * - Anonyme : CTA « Se connecter / Créer un compte » (reprend l'ancien `BusinessActions`).
 * - Authentifié mais pas ROLE_CUSTOMER (ex. artisan/admin consultant la fiche) :
 *   message neutre.
 * - Authentifié et ROLE_CUSTOMER : formulaire de prise de rendez-vous.
 *
 * Ce composant est rendu par une page serveur (`/entreprises/[id]/page.tsx`) et
 * reçoit `business` en prop — les données de catalogue sont déjà disponibles côté
 * serveur (cf. `fetchBusiness`).
 */

import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { createAppointment } from '@/lib/appointments';
import { formatDuration, formatPrice } from '@/lib/format';
import type { AppointmentLocation } from '@/types/appointment';
import type { BusinessDetail } from '@/types/catalog';

const LOCATION_LABELS: Record<AppointmentLocation, string> = {
  HOME: 'À domicile (chez moi)',
  WORKSHOP: 'En atelier (chez l\'artisan)',
};

/** Retourne la date/heure locale courante + 5 min, formatée pour un input `datetime-local`. */
function minBookingDateTime(): string {
  const d = new Date(Date.now() + 5 * 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookingPanel({ business }: { business: BusinessDetail }) {
  const { status, hasRole, token } = useAuth();

  // État transitoire : pas encore lu localStorage — évite un flash de CTA anonymous → formulaire
  if (status === 'loading') {
    return <div className="h-48 animate-pulse rounded-2xl bg-sand-light" aria-hidden />;
  }

  // Visiteur non connecté
  if (status !== 'authenticated') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-sand bg-sand-light p-5">
        <p className="text-sm text-terra-dark">
          Connectez-vous pour prendre rendez-vous avec{' '}
          <span className="font-semibold">{business.name}</span> ou lui envoyer un message directement
          depuis Slito.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/connexion"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-terra px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark"
            style={{ backgroundColor: '#C4613A' }}
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-terra-dark transition hover:border-terra"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  // Artisan, admin ou autre rôle non-client
  if (!hasRole(['ROLE_CUSTOMER'])) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-5 text-sm text-ink-mid">
        Seuls les comptes clients peuvent prendre rendez-vous via Slito.
      </div>
    );
  }

  // Aucune prestation disponible
  if (business.services.length === 0) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-5 text-sm text-ink-mid">
        Cette entreprise n&apos;a pas encore renseigné de prestations réservables.
      </div>
    );
  }

  return <BookingForm business={business} token={token!} />;
}

/** Formulaire de prise de rendez-vous — rendu uniquement pour un client authentifié. */
function BookingForm({ business, token }: { business: BusinessDetail; token: string }) {
  const [serviceId, setServiceId] = useState(String(business.services[0].id));
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState<AppointmentLocation>('HOME');
  const [customerNote, setCustomerNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<number | null>(null);

  // Calculé une seule fois au montage — `min` de l'input datetime-local
  const minDateTime = useMemo(() => minBookingDateTime(), []);

  function handleServiceChange(newId: string) {
    setServiceId(newId);
    // Pré-sélectionner le lieu de la prestation si elle en impose un
    const service = business.services.find((s) => s.id === Number(newId));
    if (service?.location) {
      setLocation(service.location);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!dateTime) {
      setFormError('Choisissez une date et une heure.');
      return;
    }

    setIsSubmitting(true);
    try {
      // datetime-local renvoie une heure locale sans fuseau ; on la convertit
      // en ISO 8601 UTC pour l'API (PHP DateTimeImmutable accepte 'Z').
      const appointment = await createAppointment(token, {
        serviceId: Number(serviceId),
        dateTime: new Date(dateTime).toISOString(),
        location,
        customerNote: customerNote.trim() || undefined,
      });
      setConfirmedId(appointment.id);
      setDateTime('');
      setCustomerNote('');
    } catch (err) {
      if (err instanceof ApiError && err.body?.violations?.length) {
        setFieldErrors(Object.fromEntries(err.body.violations.map((v) => [v.field, v.message])));
        setFormError('Le formulaire contient des erreurs : corrigez les champs signalés.');
      } else if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('La demande de rendez-vous a échoué. Réessayez dans quelques instants.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Écran de confirmation après un envoi réussi
  if (confirmedId !== null) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-800">✓ Demande envoyée !</p>
        <p className="text-sm text-emerald-700">
          Votre demande de rendez-vous a bien été transmise à{' '}
          <span className="font-semibold">{business.name}</span>. Vous serez notifié·e dès que
          l&apos;artisan l&apos;aura acceptée.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setConfirmedId(null)}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Prendre un autre rendez-vous
          </button>
          <Link
            href="/compte/rendez-vous"
            className="inline-flex items-center justify-center rounded-full border border-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-500"
          >
            Voir mes rendez-vous
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-sand bg-white p-5">
      <h2 className="text-base font-semibold text-ink">Prendre rendez-vous</h2>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && <FormBanner tone="error">{formError}</FormBanner>}

        {/* Sélecteur de prestation */}
        <FormField label="Prestation" htmlFor="booking-service" error={fieldErrors.serviceId}>
          <select
            id="booking-service"
            name="serviceId"
            value={serviceId}
            onChange={(e) => handleServiceChange(e.target.value)}
            className={FIELD_CLASSES}
          >
            {business.services.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name} — {formatDuration(s.duration)} — {formatPrice(s.price)}
              </option>
            ))}
          </select>
        </FormField>

        {/* Date et heure */}
        <FormField label="Date et heure" htmlFor="booking-datetime" error={fieldErrors.dateTime}>
          <input
            id="booking-datetime"
            name="dateTime"
            type="datetime-local"
            min={minDateTime}
            required
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className={FIELD_CLASSES}
          />
        </FormField>

        {/* Lieu de la prestation */}
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink-mid">Lieu de la prestation</legend>
          <div className="mt-1 flex flex-col gap-2">
            {(['HOME', 'WORKSHOP'] as const).map((loc) => (
              <label key={loc} className="flex cursor-pointer items-center gap-2 text-sm text-ink-mid">
                <input
                  type="radio"
                  name="location"
                  value={loc}
                  checked={location === loc}
                  onChange={() => setLocation(loc)}
                  className="accent-terra"
                />
                {LOCATION_LABELS[loc]}
              </label>
            ))}
          </div>
          {fieldErrors.location && (
            <span className="text-xs text-red-600">{fieldErrors.location}</span>
          )}
        </fieldset>

        {/* Message optionnel pour l'artisan */}
        <FormField
          label="Message pour l'artisan"
          htmlFor="booking-note"
          optional
          error={fieldErrors.customerNote}
        >
          <textarea
            id="booking-note"
            name="customerNote"
            rows={3}
            maxLength={2000}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Précisez votre besoin, vos disponibilités…"
            className={`${FIELD_CLASSES} resize-none`}
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: '#C4613A' }}
        >
          {isSubmitting ? 'Envoi en cours…' : 'Envoyer la demande'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-light">
        Ou{' '}
        <Link
          href={`/compte/messages?businessId=${business.id}&businessName=${encodeURIComponent(business.name)}`}
          className="font-medium text-terra transition hover:text-terra-dark"
        >
          envoyer un message à l&apos;artisan
        </Link>
      </p>
    </div>
  );
}
