import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Slito pour gérer vos rendez-vous, vos messages et votre fiche.',
};

type RouteSearchParams = { next?: string | string[] };

/**
 * Page d'authentification : Server Component « coquille » (métadonnées,
 * lecture de `?next=`) autour du formulaire interactif (`LoginForm`, Client
 * Component). `next` est l'URL vers laquelle revenir une fois connecté —
 * validée ici pour ne transmettre que des chemins internes (anti open-redirect).
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const { next } = await searchParams;
  const redirectTo = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Connexion</h1>
        <p className="mt-2 text-sm text-ink-mid">Accédez à votre espace client ou artisan Slito.</p>
      </header>

      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
