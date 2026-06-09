'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { primaryAccountPath, registerArtisan, registerCustomer, translateAuthError } from '@/lib/auth';

type AccountType = 'customer' | 'artisan';

interface FormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  /** Client uniquement (cf. RegisterCustomerRequest::homeAddress). */
  homeAddress: string;
  /** Artisan uniquement (cf. RegisterArtisanRequest). */
  siret: string;
  officeAddress: string;
  ownershipDocument: string;
}

const INITIAL_VALUES: FormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  homeAddress: '',
  siret: '',
  officeAddress: '',
  ownershipDocument: '',
};

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'customer', label: 'Je suis un client' },
  { value: 'artisan', label: 'Je suis un artisan' },
];

/**
 * Formulaire d'inscription — bascule entre les deux DTOs réellement exposés
 * par l'API (`POST /api/register/customer` et `POST /api/register/artisan`).
 */
export function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(key: keyof FormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
    };
  }

  function handleAccountTypeChange(next: AccountType) {
    setAccountType(next);
    setFieldErrors({});
    setFormError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (accountType === 'customer') {
        await registerCustomer({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || undefined,
          homeAddress: values.homeAddress || undefined,
        });

        const user = await login({ email: values.email, password: values.password });
        router.push(primaryAccountPath(user));
        return;
      }

      const response = await registerArtisan({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        siret: values.siret,
        officeAddress: values.officeAddress || undefined,
        ownershipDocument: values.ownershipDocument,
      });

      setSuccessMessage(response.message);
      setValues(INITIAL_VALUES);
    } catch (err) {
      if (err instanceof ApiError && err.body?.violations?.length) {
        setFieldErrors(
          Object.fromEntries(err.body.violations.map((violation) => [violation.field, violation.message])),
        );
        setFormError('Le formulaire contient des erreurs : corrigez les champs signalés ci-dessous.');
      } else if (err instanceof ApiError) {
        setFormError(translateAuthError(err.message));
      } else {
        setFormError("L'inscription a échoué. Réessayez.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="flex flex-col gap-5">
        <FormBanner tone="success">{successMessage}</FormBanner>
        <Link
          href="/connexion"
          className="inline-flex items-center justify-center rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark"
          style={{ backgroundColor: '#c56339' }}
        >
          Aller à la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Sélecteur de type de compte */}
      <div className="grid grid-cols-2 gap-1 rounded-full bg-sand-light p-1 text-sm font-medium">
        {ACCOUNT_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleAccountTypeChange(option.value)}
            aria-pressed={accountType === option.value}
            className={
              accountType === option.value
                ? 'rounded-full bg-warm-white px-4 py-2 text-ink shadow-sm'
                : 'rounded-full px-4 py-2 text-ink-light transition hover:text-ink-mid'
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {formError && <FormBanner tone="error">{formError}</FormBanner>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Prénom" htmlFor="firstName" error={fieldErrors.firstName}>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={values.firstName}
            onChange={handleChange('firstName')}
            className={FIELD_CLASSES}
          />
        </FormField>

        <FormField label="Nom" htmlFor="lastName" error={fieldErrors.lastName}>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={values.lastName}
            onChange={handleChange('lastName')}
            className={FIELD_CLASSES}
          />
        </FormField>
      </div>

      <FormField label="Adresse email" htmlFor="email" error={fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange('email')}
          className={FIELD_CLASSES}
        />
      </FormField>

      <FormField label="Mot de passe" htmlFor="password" error={fieldErrors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={values.password}
          onChange={handleChange('password')}
          className={FIELD_CLASSES}
        />
        <span className="text-xs font-normal text-ink-light">8 caractères minimum.</span>
      </FormField>

      <FormField label="Téléphone" htmlFor="phone" optional error={fieldErrors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange('phone')}
          className={FIELD_CLASSES}
        />
      </FormField>

      {accountType === 'customer' ? (
        <FormField label="Adresse personnelle" htmlFor="homeAddress" optional error={fieldErrors.homeAddress}>
          <input
            id="homeAddress"
            name="homeAddress"
            type="text"
            autoComplete="street-address"
            placeholder="Utile pour les prestations à domicile"
            value={values.homeAddress}
            onChange={handleChange('homeAddress')}
            className={FIELD_CLASSES}
          />
        </FormField>
      ) : (
        <>
          <FormField label="SIRET" htmlFor="siret" error={fieldErrors.siret}>
            <input
              id="siret"
              name="siret"
              type="text"
              inputMode="numeric"
              pattern="\d{14}"
              placeholder="14 chiffres"
              required
              value={values.siret}
              onChange={handleChange('siret')}
              className={FIELD_CLASSES}
            />
            <span className="text-xs font-normal text-ink-light">Exactement 14 chiffres, sans espaces.</span>
          </FormField>

          <FormField label="Adresse du local professionnel" htmlFor="officeAddress" optional error={fieldErrors.officeAddress}>
            <input
              id="officeAddress"
              name="officeAddress"
              type="text"
              autoComplete="street-address"
              value={values.officeAddress}
              onChange={handleChange('officeAddress')}
              className={FIELD_CLASSES}
            />
          </FormField>

          <FormField label="Justificatif d'entreprise" htmlFor="ownershipDocument" error={fieldErrors.ownershipDocument}>
            <input
              id="ownershipDocument"
              name="ownershipDocument"
              type="text"
              placeholder="Référence ou lien vers votre Kbis"
              required
              value={values.ownershipDocument}
              onChange={handleChange('ownershipDocument')}
              className={FIELD_CLASSES}
            />
            <span className="text-xs font-normal text-ink-light">
              Le dépôt de fichier n&apos;est pas encore disponible : indiquez pour l&apos;instant une référence ou un
              lien vers votre justificatif (Kbis ou équivalent), qu&apos;un administrateur vérifiera avant
              d&apos;activer votre compte.
            </span>
          </FormField>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: '#c56339' }}
      >
        {isSubmitting ? 'Création du compte…' : 'Créer mon compte'}
      </button>

      <p className="text-center text-sm text-ink-light">
        Déjà inscrit ?{' '}
        <Link href="/connexion" className="font-medium text-terra transition hover:text-terra-dark">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
