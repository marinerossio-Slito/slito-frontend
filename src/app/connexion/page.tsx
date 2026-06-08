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
 * Component — un formulaire contrôlé a besoin d'état et de gestionnaires
 * d'événements, donc de JavaScript côté client).
 *
 * `next` est l'URL vers laquelle revenir une fois connecté (cf. `RouteGuard`,
 * qui y redirige les visiteurs anonymes). On ne la valide qu'ici, côté serveur,
 * et on ne transmet au formulaire qu'un chemin interne vérifié — jamais une URL
 * arbitraire (un `next` externe permettrait une redirection ouverte/phishing).
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<RouteSearchParams> }) {
  const { next } = await searchParams;
  const redirectTo = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Connexion</h1>
        <p className="mt-2 text-sm text-zinc-600">Accédez à votre espace client ou artisan Slito.</p>
      </header>

      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
