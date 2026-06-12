'use client';

/**
 * Gestion des comptes utilisateurs par l'administrateur.
 *
 * L'API expose un seul endpoint PATCH /api/admin/users/{id} (pas de listing).
 * Ce composant propose un formulaire de recherche par ID utilisateur,
 * affiche les informations du compte et permet :
 *   - d'approuver ou révoquer l'approbation d'un artisan
 *   - de bannir ou réactiver un compte
 *
 * Note UX : un vrai back-office complèterait cela avec une liste paginée,
 * mais les contraintes API actuelles (pas de GET /api/admin/users) limitent
 * cette fonctionnalité à la recherche par ID.
 */

import { useState, type FormEvent } from 'react';

import { FIELD_CLASSES } from '@/components/forms/FormField';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { updateAdminUser } from '@/lib/admin';
import type { AdminUserRef } from '@/types/admin';

export function UserManager() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [userId, setUserId] = useState('');
  const [user, setUser] = useState<AdminUserRef | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  // Lookup via une action (ban ou approve) — le PATCH renvoie le user complet
  // comme effet de bord de la recherche.
  async function handleLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = Number(userId);
    if (!token || !id || !Number.isInteger(id) || id <= 0) return;

    setLookupError(null);
    setUser(null);
    setActing(true);

    // On fait une action neutre (isBanned=false si non banni, pour forcer
    // un PATCH et récupérer le user). Mais l'API requiert au moins un champ.
    // Stratégie : tentative avec isBanned=false (idempotent si déjà false).
    try {
      const result = await updateAdminUser(token, id, { isBanned: false });
      setUser(result);
    } catch (err) {
      setLookupError(
        err instanceof ApiError
          ? err.message
          : 'Utilisateur introuvable ou accès refusé.',
      );
    } finally {
      setActing(false);
    }
  }

  async function applyAction(payload: { isBanned?: boolean; isApproved?: boolean }, successMsg: string) {
    if (!token || !user) return;
    setActing(true);
    try {
      const result = await updateAdminUser(token, user.id, payload);
      setUser(result);
      showToast(successMsg, 'success');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Action échouée.', 'error');
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Formulaire de recherche */}
      <section className="rounded-2xl border border-sand bg-warm-white p-6">
        <h2 className="mb-1 text-base font-semibold text-ink">Rechercher un utilisateur</h2>
        <p className="mb-4 text-sm text-ink-light">
          Entrez l&apos;identifiant numérique (ID) du compte à gérer.
        </p>

        <form onSubmit={handleLookup} className="flex gap-3">
          <input
            type="number"
            min={1}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Ex. : 42"
            className={`${FIELD_CLASSES} w-32`}
            aria-label="ID utilisateur"
          />
          <button
            type="submit"
            disabled={acting || !userId}
            className="rounded-full bg-terra px-5 py-2 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:opacity-60"
          >
            {acting ? '…' : 'Rechercher'}
          </button>
        </form>

        {lookupError && (
          <p className="mt-3 text-sm text-red-600">{lookupError}</p>
        )}
      </section>

      {/* Fiche utilisateur + actions */}
      {user && (
        <section className="rounded-2xl border border-sand bg-warm-white p-6">
          <h2 className="mb-4 text-base font-semibold text-ink">
            Compte #{user.id}
          </h2>

          {/* Infos */}
          <dl className="mb-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Row label="Email" value={user.email} />
            <Row label="Nom" value={`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—'} />
            <Row label="Rôles" value={user.roles.join(', ')} />
            <Row label="Vérifié" value={user.isVerified ? 'Oui' : 'Non'} />
            <Row
              label="Statut"
              value={
                user.isBanned
                  ? '🚫 Banni'
                  : '✅ Actif'
              }
            />
            {user.artisan && (
              <Row
                label="Artisan"
                value={user.artisan.isApproved ? '✅ Approuvé' : '⏳ En attente d\'approbation'}
              />
            )}
          </dl>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {user.artisan && !user.artisan.isApproved && (
              <ActionButton
                label="Approuver l'artisan"
                variant="success"
                disabled={acting}
                onClick={() => applyAction({ isApproved: true }, "Artisan approuvé avec succès !")}
              />
            )}
            {user.artisan && user.artisan.isApproved && (
              <ActionButton
                label="Révoquer l'approbation"
                variant="warning"
                disabled={acting}
                onClick={() => applyAction({ isApproved: false }, "Approbation révoquée.")}
              />
            )}
            {!user.isBanned ? (
              <ActionButton
                label="Bannir le compte"
                variant="danger"
                disabled={acting}
                onClick={() => applyAction({ isBanned: true }, "Compte banni.")}
              />
            ) : (
              <ActionButton
                label="Réactiver le compte"
                variant="success"
                disabled={acting}
                onClick={() => applyAction({ isBanned: false }, "Compte réactivé.")}
              />
            )}
          </div>
        </section>
      )}

      {/* Note API */}
      <p className="text-xs text-ink-light">
        Note : l&apos;API courante n&apos;expose pas d&apos;endpoint de liste des utilisateurs.
        La recherche s&apos;effectue par ID numérique. Utilisez l&apos;interface base de données
        pour obtenir les IDs.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-light">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

function ActionButton({
  label,
  variant,
  disabled,
  onClick,
}: {
  label: string;
  variant: 'success' | 'warning' | 'danger';
  disabled: boolean;
  onClick: () => void;
}) {
  const cls = {
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    warning: 'border border-sand text-terra hover:border-terra',
    danger: 'border border-red-300 text-red-700 hover:border-red-400',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${cls}`}
    >
      {label}
    </button>
  );
}
