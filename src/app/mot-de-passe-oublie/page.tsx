import type { Metadata } from 'next';

import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Recevez un lien par email pour réinitialiser votre mot de passe Slito.',
};

export default function PasswordResetRequestPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-ink-mid">
          Indiquez votre adresse email : si un compte lui correspond, vous recevrez un lien de réinitialisation.
        </p>
      </header>

      <PasswordResetRequestForm />
    </div>
  );
}
