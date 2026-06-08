import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    "Créez votre compte client pour réserver des artisans, ou votre compte artisan pour proposer vos services sur Slito.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Créer un compte</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Choisissez le profil qui vous correspond pour commencer à utiliser Slito.
        </p>
      </header>

      <RegisterForm />
    </div>
  );
}
