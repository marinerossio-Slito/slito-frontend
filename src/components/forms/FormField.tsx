/**
 * Petits composants partagés entre les formulaires d'authentification
 * (`LoginForm`, `RegisterForm`, `PasswordResetRequestForm`...) : style commun
 * des champs et bandeaux de retour (erreur / succès), pour ne pas redéfinir
 * les mêmes classes Tailwind dans chaque formulaire.
 *
 * Charte : focus terracotta, fond warm-white, bordures sand.
 */

export const FIELD_CLASSES =
  'rounded-lg border border-sand bg-warm-white px-3 py-2 text-sm text-ink transition focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra/20';

export function FormField({
  label,
  htmlFor,
  optional,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  /** Affiche un indicateur « (optionnel) » à côté du libellé. */
  optional?: boolean;
  /** Message de validation associé au champ (ex. violation renvoyée par l'API). */
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm font-medium text-ink-mid">
      <span>
        {label}
        {optional && <span className="ml-1 font-normal text-ink-light">(optionnel)</span>}
      </span>
      {children}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

const BANNER_TONE_CLASSES = {
  error:   'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
} as const;

/** Bandeau de retour global d'un formulaire (erreur de soumission, message de succès...). */
export function FormBanner({
  tone,
  children,
}: {
  tone: keyof typeof BANNER_TONE_CLASSES;
  children: React.ReactNode;
}) {
  return (
    <p className={`rounded-lg border px-4 py-3 text-sm ${BANNER_TONE_CLASSES[tone]}`}>
      {children}
    </p>
  );
}
