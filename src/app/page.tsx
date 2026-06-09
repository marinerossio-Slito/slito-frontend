import Link from 'next/link';

import { BusinessCard } from '@/components/BusinessCard';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';
import { fetchCategories, searchBusinesses } from '@/lib/catalog';

// Rendu dynamique : le contenu dépend de l'API (évolue dans le temps) et
// un prérendu statique échouerait si le back-end n'est pas démarré au build.
// Cf. node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [categories, businesses] = await Promise.all([fetchCategories(), searchBusinesses()]);
  const featuredBusinesses = businesses.slice(0, 6);

  // Compte d'artisans par catégorie (calculé depuis les businesses chargés)
  const countBySlug = businesses.reduce<Record<string, number>>((acc, b) => {
    if (b.category?.slug) acc[b.category.slug] = (acc[b.category.slug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-1 flex-col">
      <Hero />

      {/* ── Catégories ──────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-8 py-16">
        <SectionHeader
          title="Explorez par métier"
          action={
            <Link href="/recherche" className="text-sm font-medium text-terra transition hover:underline">
              Voir tous →
            </Link>
          }
        />
        {categories.length === 0 ? (
          <EmptyState message="Aucune catégorie n'est disponible pour le moment." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={countBySlug[category.slug]}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Artisans recommandés ─────────────────────────────────────────────── */}
      <section className="bg-sand-light py-16">
        <div className="mx-auto w-full max-w-6xl px-8">
          <SectionHeader
            title="Artisans recommandés"
            description="Une sélection approuvée par notre équipe, prête à recevoir votre demande."
            action={
              <Link href="/recherche" className="text-sm font-medium text-terra transition hover:underline">
                Voir tous →
              </Link>
            }
          />
          {featuredBusinesses.length === 0 ? (
            <EmptyState message="Aucune entreprise n'est disponible pour le moment." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Comment ça marche ────────────────────────────────────────────────── */}
      <HowItWorks />
    </div>
  );
}

/* ── Composants de section ─────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      className="relative overflow-hidden px-8 pb-24 pt-20 text-center bg-forest"
      style={{ backgroundColor: '#2D4A3E' }}
    >

      {/* Badge */}
      <div className="relative mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80">
        La plateforme des artisans de confiance
      </div>

      {/* Titre */}
      <h1 className="relative mx-auto mb-5 max-w-3xl font-serif text-5xl font-bold leading-[1.15] text-white sm:text-6xl">
        Trouvez l&apos;artisan{' '}
        <em className="not-italic text-terra-light" style={{ color: '#E8896A' }}>qu&apos;il vous faut</em>,
        <br className="hidden sm:block" />
        {' '}quand vous en avez besoin
      </h1>

      {/* Sous-titre */}
      <p className="relative mx-auto mb-10 max-w-xl text-lg font-light leading-relaxed text-white/70">
        Réservez en ligne avec des professionnels certifiés, notés par une communauté de clients
        comme vous.
      </p>

      {/* Barre de recherche */}
      <form
        method="get"
        action="/recherche"
        className="relative mx-auto flex max-w-2xl items-center gap-2 rounded-2xl bg-warm-white p-2 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: '#FFFDF9' }}
      >
        <input
          name="category"
          type="text"
          placeholder="Plombier, électricien, menuisier..."
          className="flex-1 bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink-light focus:outline-none"
        />
        <div className="h-7 w-px bg-sand" aria-hidden />
        <input
          name="city"
          type="text"
          placeholder="📍 Ville ou code postal"
          className="bg-transparent px-4 py-3 text-sm text-ink-mid placeholder:text-ink-light focus:outline-none"
          style={{ minWidth: '160px' }}
        />
        <button
          type="submit"
          className="rounded-xl bg-terra px-7 py-3.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-terra-dark"
          style={{ backgroundColor: '#C4613A' }}
        >
          Rechercher
        </button>
      </form>

      {/* Chips de filtres rapides */}
      <div className="relative mt-4 flex flex-wrap justify-center gap-2.5">
        {[
          '🚿 Plomberie',
          '⚡ Électricité',
          '🪵 Menuiserie',
          '🎨 Peinture',
          '🏗️ Maçonnerie',
          '🔑 Serrurerie',
        ].map((chip) => (
          <Link
            key={chip}
            href="/recherche"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            {chip}
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Recherchez',
      desc: 'Saisissez votre besoin et votre ville pour trouver les artisans disponibles près de chez vous.',
    },
    {
      num: '2',
      title: 'Choisissez',
      desc: 'Consultez les fiches, les avis clients et les tarifs pour sélectionner le bon professionnel.',
    },
    {
      num: '3',
      title: 'Réservez',
      desc: 'Prenez rendez-vous directement en ligne en quelques clics, sans décrocher le téléphone.',
    },
    {
      num: '4',
      title: 'Profitez',
      desc: "Votre artisan intervient au créneau convenu. Laissez ensuite un avis pour aider la communauté.",
    },
  ];

  return (
    <section className="bg-forest py-20 text-center">
      <div className="mx-auto max-w-5xl px-8">
        <h2 className="mb-3 font-serif text-3xl font-bold text-white">Comment ça marche ?</h2>
        <p className="mb-14 text-base text-white/60">
          Réserver un artisan n&apos;a jamais été aussi simple.
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/20 font-serif text-2xl font-bold text-gold">
                {step.num}
              </div>
              <p className="mb-2.5 text-base font-semibold text-white">{step.title}</p>
              <p className="text-sm leading-relaxed text-white/55">{step.desc}</p>
            </div>
          ))}
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
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-9 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink">{title}</h2>
        {description && <p className="mt-1 text-ink-mid">{description}</p>}
      </div>
      {action}
    </div>
  );
}
