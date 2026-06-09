'use client';

/**
 * Gestion de l'abonnement Slito Pro de l'artisan.
 *
 * Flux Stripe (côté client) :
 *   1. POST /api/artisan/subscription/checkout (plan: 'monthly' | 'yearly')
 *      → renvoie checkoutUrl → redirection vers la page Stripe hébergée.
 *   2. POST /api/artisan/subscription/portal
 *      → renvoie portalUrl → ouverture d'un nouvel onglet Stripe Portal.
 *
 * Aucune donnée bancaire ne transite par notre serveur.
 */

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { fetchSubscription, startCheckout, startPortal } from '@/lib/artisan';
import { formatDateTime } from '@/lib/format';
import type { SubscriptionPlan, SubscriptionResponse } from '@/types/artisan';

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Mensuel',
  yearly: 'Annuel',
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  trialing: { label: 'Essai gratuit', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  past_due: { label: 'Paiement en attente', className: 'bg-sand-light text-terra border-sand' },
  canceled: { label: 'Résilié', className: 'bg-sand-light text-ink-light border-sand' },
  unpaid: { label: 'Non payé', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function SubscriptionPanel() {
  const { token } = useAuth();

  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchSubscription(token)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Chargement échoué.'); });

    return () => { cancelled = true; };
  }, [token]);

  async function handleCheckout() {
    if (!token) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { checkoutUrl } = await startCheckout(token, selectedPlan);
      window.location.href = checkoutUrl;
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'Impossible d\'ouvrir la page de paiement.');
      setCheckoutLoading(false);
    }
  }

  async function handlePortal() {
    if (!token) return;
    setPortalLoading(true);
    setPortalError(null);
    try {
      const { portalUrl } = await startPortal(token);
      window.open(portalUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setPortalError(err instanceof ApiError ? err.message : 'Impossible d\'ouvrir le portail Stripe.');
    } finally {
      setPortalLoading(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  if (!data) {
    return <div className="h-40 animate-pulse rounded-2xl bg-sand-light" />;
  }

  const { subscription } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Statut courant */}
      <div className="rounded-2xl border border-sand bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">Votre abonnement</h2>

        {subscription ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-ink-mid">
                Formule : {PLAN_LABELS[subscription.plan] ?? subscription.plan}
              </span>
              <StatusBadge status={subscription.status} />
            </div>

            {subscription.currentPeriodEnd && (
              <p className="text-sm text-ink-light">
                {subscription.active ? 'Renouvellement' : 'Fin d\'abonnement'} :{' '}
                <span className="font-medium text-ink-mid">
                  {formatDateTime(subscription.currentPeriodEnd)}
                </span>
              </p>
            )}

            {subscription.active && (
              <div className="mt-2 flex flex-col gap-2">
                {portalError && (
                  <p className="text-xs text-red-600">{portalError}</p>
                )}
                <button
                  type="button"
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="self-start rounded-full border border-sand px-5 py-2 text-sm font-semibold text-ink-mid transition hover:border-sand hover:text-terra disabled:opacity-60"
                >
                  {portalLoading ? 'Ouverture…' : 'Gérer mon abonnement (portail Stripe)'}
                </button>
                <p className="text-xs text-ink-light">
                  Modifiez votre formule, mettez à jour votre moyen de paiement ou résiliez
                  directement depuis le portail Stripe sécurisé.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-light">
            Vous n&apos;avez pas encore d&apos;abonnement actif.
          </p>
        )}
      </div>

      {/* Panneau de souscription (si pas actif) */}
      {(!subscription || !subscription.active) && (
        <div className="rounded-2xl border border-sand bg-sand-light p-6">
          <h2 className="mb-1 text-base font-semibold text-ink">Passer à Slito Pro</h2>
          <p className="mb-4 text-sm text-ink-mid">
            Débloquez la réservation en ligne, les statistiques avancées et la mise en avant
            dans les résultats de recherche.
          </p>

          {checkoutError && (
            <p className="mb-3 text-xs text-red-600">{checkoutError}</p>
          )}

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <PlanOption
              label="Mensuel"
              price="29 €/mois"
              selected={selectedPlan === 'monthly'}
              onSelect={() => setSelectedPlan('monthly')}
            />
            <PlanOption
              label="Annuel"
              price="290 €/an"
              note="Économisez 2 mois"
              selected={selectedPlan === 'yearly'}
              onSelect={() => setSelectedPlan('yearly')}
            />
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="inline-flex items-center justify-center rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkoutLoading ? 'Redirection vers Stripe…' : `S'abonner — ${selectedPlan === 'monthly' ? '29 €/mois' : '290 €/an'}`}
          </button>

          <p className="mt-2 text-xs text-ink-light">
            Paiement sécurisé via Stripe. Aucune donnée bancaire ne transite par Slito.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, className: 'bg-sand-light text-ink-light border-sand' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function PlanOption({
  label,
  price,
  note,
  selected,
  onSelect,
}: {
  label: string;
  price: string;
  note?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-1 flex-col gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition ${
        selected
          ? 'border-terra bg-white'
          : 'border-sand bg-white hover:border-sand'
      }`}
    >
      <span className="font-semibold text-ink">{label}</span>
      <span className="text-sm text-ink-mid">{price}</span>
      {note && <span className="text-xs text-emerald-600">{note}</span>}
    </button>
  );
}
