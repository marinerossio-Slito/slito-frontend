import Link from 'next/link';

import { BusinessCard } from '@/components/BusinessCard';
import { CategoryCard } from '@/components/CategoryCard';
import { fetchCategories, searchBusinesses } from '@/lib/catalog';

// Page entièrement publique, dont le contenu dépend de l'API : on ne met pas
// en cache les réponses (comportement par défaut de `fetch` dans Next 16,
// cf. node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
// — « fetch requests are not cached by default »).
//
// On force également le rendu dynamique (par requête) : sans cela, `next build`
// tente de prérendre statiquement cette page (et donc d'appeler l'API au moment
// du build, ce qui échoue si le back-end n'est pas démarré) et figerait les
// catégories/entreprises affichées au contenu de l'API au moment du build.
// Cf. node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [categories, businesses] = await Promise.all([fetchCategories(), searchBusinesses()]);

  const featuredBusinesses = businesses.slice(0, 6);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <Hero />

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeader
          title="Trouvez l'artisan qu'il vous faut"
          description="Parcourez les métiers disponibles sur Slito et accédez directement aux profils correspondants."
        />

        {categories.length === 0 ? (
          <EmptyState message="Aucune catégorie n'est disponible pour le moment." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <SectionHeader
          title="Artisans recommandés"
          description="Une sélection d'entreprises approuvées par notre équipe, prêtes à recevoir votre demande."
          action={
            <Link href="/recherche" className="text-sm font-medium text-amber-700 hover:text-amber-800">
              Voir toute la recherche →
            </Link>
          }
        />

        {featuredBusinesses.length === 0 ? (
          <EmptyState message="Aucune entreprise n'est disponible pour le moment." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Slito</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Réservez un artisan de confiance, en quelques clics.
        </h1>
        <p className="max-w-xl text-lg text-zinc-600">
          Plombiers, électriciens, peintres... trouvez le bon professionnel près de chez vous, consultez les avis
          d&apos;autres clients et prenez rendez-vous directement en ligne.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/recherche"
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Trouver un artisan
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:border-zinc-400"
          >
            Je suis artisan, je m&apos;inscris
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-zinc-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">{message}</p>;
}
