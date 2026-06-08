import type { Metadata } from 'next';

import { PasswordResetConfirmForm } from '@/components/auth/PasswordResetConfirmForm';

export const metadata: Metadata = {
  title: 'Choisir un nouveau mot de passe',
  description: 'Définissez un nouveau mot de passe pour votre compte Slito.',
};

type RouteParams = { token: string };

/**
 * Page sur laquelle arrive la personne en cliquant le lien reçu par email.
 *
 * Le back-end construit ce lien en concaténant `FRONTEND_RESET_PASSWORD_URL`
 * et le jeton brut (cf. slito-backend/src/Controller/Api/
 * PasswordResetController.php, `rtrim($this->frontendResetPasswordUrl, '/').
 * '/'.$resetToken->getToken()`) — d'où la route `[token]` ici, et la valeur
 * `FRONTEND_RESET_PASSWORD_URL=.../mot-de-passe-oublie` à configurer côté
 * back-end (cf. slito-backend/.env) pour que le lien envoyé pointe bien ici.
 */
export default async function PasswordResetConfirmPage({ params }: { params: Promise<RouteParams> }) {
  const { token } = await params;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-zinc-600">Choisissez un nouveau mot de passe pour votre compte Slito.</p>
      </header>

      <PasswordResetConfirmForm token={token} />
    </div>
  );
}
