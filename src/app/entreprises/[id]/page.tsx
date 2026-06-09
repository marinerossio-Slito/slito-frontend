import type { Metadata } from 'next';
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
    <div className="flex flex-1 flex-col bg-zinc-50">
      <BusinessHero business={business} />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          {business.description && (
            <section>
              <h2 className="text-xl font-semibold text-zinc-900">À propos</h2>
              <p className="mt-3 whitespace-pre-line text-zinc-700">{business.description}</p>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-zinc-900">Prestations</h2>
            {business.services.length === 0 ? (
              <div className="mt-4">
                <EmptyState message="Cette entreprise n'a pas encore renseigné de prestations." />
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {business.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <BookingPanel business={business} />
          <BusinessInfoCard business={business} />
        </aside>
      </div>
    </div>
  );
}

function BusinessHero({ business }: { business: BusinessDetail }) {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          {business.category && (
            <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              {business.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{business.name}</h1>
          {business.headline && <p className="max-w-2xl text-lg text-zinc-600">{business.headline}</p>}
          {business.officeAddress && (
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <span aria-hidden>📍</span> {business.officeAddress}
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <RatingBadge averageRating={business.averageRating} reviewsCount={business.reviewsCount} size="lg" />
          {business.priceFrom !== null && (
            <p className="text-sm text-zinc-500">
              Prestations dès <span className="font-semibold text-zinc-900">{formatPrice(business.priceFrom)}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="font-semibold text-zinc-900">{service.name}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDuration(service.duration)}
            {service.location && <> · {LOCATION_LABELS[service.location] ?? service.location}</>}
          </p>
        </div>
        <p className="shrink-0 text-lg font-semibold text-zinc-900">{formatPrice(service.price)}</p>
      </div>

      {service.description && <p className="mt-3 text-sm text-zinc-600">{service.description}</p>}

      {service.faq && service.faq.length > 0 && (
        <dl className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4">
          {service.faq.map((entry) => (
            <div key={entry.question}>
              <dt className="text-sm font-medium text-zinc-800">{entry.question}</dt>
              <dd className="mt-1 text-sm text-zinc-600">{entry.answer}</dd>
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
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-base font-semibold text-zinc-900">Informations pratiques</h2>

      {hasContactInfo && (
        <dl className="flex flex-col gap-3 text-sm">
          {business.contactNumber && (
            <InfoRow label="Téléphone">
              <a href={`tel:${business.contactNumber}`} className="text-amber-700 transition hover:text-amber-800">
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
                className="break-all text-amber-700 transition hover:text-amber-800"
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
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="text-zinc-700">{children}</dd>
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
    <div className="border-t border-zinc-100 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Horaires d&apos;ouverture</p>
      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {[...knownDays, ...otherDays].map((day) => {
          const slot = workingHours[day];

          return (
            <li key={day} className="flex items-center justify-between gap-4">
              <span className="capitalize text-zinc-700">{day}</span>
              <span className={slot ? 'text-zinc-700' : 'text-zinc-400'}>
                {slot ? `${slot[0]} – ${slot[1]}` : 'Fermé'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
