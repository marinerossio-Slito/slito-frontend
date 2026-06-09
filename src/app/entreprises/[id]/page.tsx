import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EmptyState } from '@/components/EmptyState';
import { RatingBadge } from '@/components/RatingBadge';
import { BookingPanel } from '@/components/booking/BookingPanel';
import { ApiError } from '@/lib/api';
import { fetchBusiness } from '@/lib/catalog';
import { formatDuration, formatPrice } from '@/lib/format';
import type { BusinessDetail, Service, WorkingHours } from '@/types/catalog';

// Fiche entreprise : son contenu (services, tarifs, horaires, avis...) peut
// changer à tout moment côté back-office artisan, donc on la rend à la
// demande plutôt que de la figer au build (même raisonnement que pour `/` et
// `/recherche`, cf. leurs commentaires `dynamic`).
export const dynamic = 'force-dynamic';

const WEEK_DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const LOCATION_LABELS: Record<string, string> = {
  HOME: 'À domicile',
  WORKSHOP: 'En atelier',
};

type RouteParams = { id: string };

/**
 * Charge la fiche correspondant à `id`, ou déclenche la page 404 si l'identifiant
 * n'est pas un entier positif (cf. la contrainte `{id<\d+>}` de la route
 * `api_business_show` côté back-end : un id non numérique ne matcherait même pas
 * la route et renverrait une page d'erreur HTML, pas du JSON) ou si l'API répond
 * 404 (fiche inexistante ou artisan non approuvé, cf. CatalogController::showBusiness).
 */
async function loadBusiness(id: string): Promise<BusinessDetail> {
  const businessId = Number(id);
  if (!Number.isInteger(businessId) || businessId <= 0) {
    notFound();
  }

  try {
    return await fetchBusiness(businessId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

// `fetch` est mémoïsé automatiquement par requête (cf. docs Next 16, fonction
// `fetch` → « Memoization ») : appeler `loadBusiness` ici et dans la page ne
// déclenche donc qu'un seul appel réseau réel.
export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { id } = await params;
  const business = await loadBusiness(id);

  return {
    title: business.name,
    description:
      business.headline ?? business.description ?? `Découvrez la fiche de ${business.name} sur Slito.`,
  };
}

export default async function BusinessDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;
  const business = await loadBusiness(id);

  return (
    <div className="flex flex-1 flex-col bg-cream">
      <BusinessHero business={business} />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          {business.description && (
            <div className="rounded-2xl border border-sand bg-white p-7">
              <h2 className="mb-4 border-b border-sand pb-4 font-serif text-[22px] font-bold text-ink">
                À propos
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-ink-mid">{business.description}</p>
            </div>
          )}

          <div className="rounded-2xl border border-sand bg-white p-7">
            <h2 className="mb-4 border-b border-sand pb-4 font-serif text-[22px] font-bold text-ink">
              Services proposés
            </h2>
            {business.services.length === 0 ? (
              <EmptyState message="Cette entreprise n'a pas encore renseigné de prestations." />
            ) : (
              <ul className="flex flex-col gap-3">
                {business.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside id="booking" className="flex flex-col gap-4">
          <BookingPanel business={business} />
          <BusinessInfoCard business={business} />
        </aside>
      </div>
    </div>
  );
}

function BusinessHero({ business }: { business: BusinessDetail }) {
  return (
    <section
      className="bg-forest"
      style={{ backgroundColor: '#2D4A3E' }}
    >
      {/* Cover – zone décorative avec l'icône en filigrane */}
      <div className="relative h-56 overflow-hidden">
        {business.category?.icon && (
          <span
            className="pointer-events-none absolute right-24 top-1/2 -translate-y-1/2 select-none leading-none"
            aria-hidden
            style={{ fontSize: '220px', opacity: 0.09 }}
          >
            {business.category.icon}
          </span>
        )}
        <nav aria-label="Fil d'Ariane" className="absolute left-0 top-0 px-8 pt-5 text-sm">
          <Link href="/recherche" className="font-medium text-white/60 transition hover:text-white">
            ← Retour aux résultats
          </Link>
        </nav>
      </div>

      {/* Profil — avatar chevauchant + nom côte à côte, boutons à droite */}
      <div className="pb-8">
        <div className="mx-auto w-full max-w-6xl px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* Gauche : avatar + nom */}
            <div className="flex items-end gap-5">
              {/* Avatar blanc chevauchant la zone cover */}
              <div
                className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-white text-5xl"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                aria-hidden
              >
                {business.category?.icon ?? '🏢'}
              </div>

              {/* Texte aligné en bas avec l'avatar */}
              <div className="pb-2">
                <h1
                  className="font-serif text-[28px] font-bold leading-tight text-white"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  {business.name}
                </h1>
                <p className="mt-1 text-sm text-white/80">
                  {[business.category?.name, business.officeAddress].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {/* Droite : bouton */}
            <div className="pb-2">
              <a
                href="#booking"
                className="rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark"
                style={{ backgroundColor: '#C4613A' }}
              >
                📅 Prendre RDV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <li className="rounded-lg border-[1.5px] border-sand p-4 transition hover:border-terra"
        style={{ borderRadius: '8px' }}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="font-serif text-lg font-semibold text-ink">{service.name}</p>
          <p className="mt-1 text-sm text-ink-light">
            {formatDuration(service.duration)}
            {service.location && <> · {LOCATION_LABELS[service.location] ?? service.location}</>}
          </p>
        </div>
        <p className="shrink-0 font-serif text-xl font-bold text-terra">{formatPrice(service.price)}</p>
      </div>

      {service.description && <p className="mt-3 text-sm leading-relaxed text-ink-mid">{service.description}</p>}

      {service.faq && service.faq.length > 0 && (
        <dl className="mt-4 flex flex-col gap-3 border-t border-sand pt-4">
          {service.faq.map((entry) => (
            <div key={entry.question}>
              <dt className="text-sm font-semibold text-ink">{entry.question}</dt>
              <dd className="mt-1 text-sm text-ink-mid">{entry.answer}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}


function BusinessInfoCard({ business }: { business: BusinessDetail }) {
  const hasWorkingHours = business.workingHours !== null && Object.keys(business.workingHours).length > 0;
  const hasContactInfo =
    business.contactNumber || business.website || business.replyDelay || (business.paymentMethods?.length ?? 0) > 0;

  if (!hasContactInfo && !hasWorkingHours) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-sand bg-white p-7">
      <h2 className="border-b border-sand pb-4 font-serif text-[22px] font-bold text-ink">Informations pratiques</h2>

      {hasContactInfo && (
        <dl className="flex flex-col gap-3 text-sm">
          {business.contactNumber && (
            <InfoRow label="Téléphone">
              <a href={`tel:${business.contactNumber}`} className="text-terra transition hover:text-terra-dark">
                {business.contactNumber}
              </a>
            </InfoRow>
          )}
          {business.website && (
            <InfoRow label="Site web">
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer noopener"
                className="break-all text-terra transition hover:text-terra-dark"
              >
                {business.website}
              </a>
            </InfoRow>
          )}
          {business.replyDelay && <InfoRow label="Délai de réponse habituel">{business.replyDelay}</InfoRow>}
          {business.paymentMethods && business.paymentMethods.length > 0 && (
            <InfoRow label="Moyens de paiement acceptés">{business.paymentMethods.join(', ')}</InfoRow>
          )}
        </dl>
      )}

      {hasWorkingHours && <WorkingHoursList workingHours={business.workingHours as WorkingHours} />}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-light">{label}</dt>
      <dd className="text-ink-mid">{children}</dd>
    </div>
  );
}

function WorkingHoursList({ workingHours }: { workingHours: WorkingHours }) {
  // On affiche d'abord les jours de la semaine dans l'ordre habituel, puis
  // toute clé inattendue (l'API sérialise un champ `json` à la forme libre :
  // mieux vaut rester tolérant qu'avaler silencieusement une donnée).
  const knownDays = WEEK_DAYS.filter((day) => day in workingHours);
  const otherDays = Object.keys(workingHours).filter((day) => !WEEK_DAYS.includes(day));

  return (
    <div className="border-t border-sand-light pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-light">Horaires d&apos;ouverture</p>
      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {[...knownDays, ...otherDays].map((day) => {
          const slot = workingHours[day];

          return (
            <li key={day} className="flex items-center justify-between gap-4">
              <span className="capitalize text-ink-mid">{day}</span>
              <span className={slot ? 'text-ink-mid' : 'text-ink-light'}>
                {slot ? `${slot[0]} – ${slot[1]}` : 'Fermé'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
