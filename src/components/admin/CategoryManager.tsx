'use client';

/**
 * Gestion des catégories d'artisans.
 * - Liste via GET /api/categories (endpoint public).
 * - Création via POST /api/admin/categories.
 */

import { useEffect, useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { SkeletonGrid } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { createAdminCategory } from '@/lib/admin';
import { fetchCategories } from '@/lib/catalog';
import type { AdminCategory } from '@/types/admin';
import type { ArtisanCategory } from '@/types/catalog';

export function CategoryManager() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<ArtisanCategory[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [slug, setSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchCategories({ cache: 'no-store' })
      .then((d) => { if (!cancelled) setCategories(d); })
      .catch((err) => { if (!cancelled) setListError(err instanceof ApiError ? err.message : 'Chargement échoué.'); });

    return () => { cancelled = true; };
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !name.trim()) return;

    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const created: AdminCategory = await createAdminCategory(token, {
        name: name.trim(),
        icon: icon.trim() || null,
        slug: slug.trim() || null,
      });
      // Ajouter à la liste locale
      setCategories((prev) => (prev ? [...prev, created] : [created]));
      setName('');
      setIcon('');
      setSlug('');
      showToast('Catégorie créée avec succès !', 'success');
    } catch (err) {
      if (err instanceof ApiError && err.body?.violations?.length) {
        setFieldErrors(Object.fromEntries(err.body.violations.map((v: { field: string; message: string }) => [v.field, v.message])));
        setFormError('Corrigez les erreurs du formulaire.');
      } else if (err instanceof ApiError) {
        setFormError(err.message);
        showToast(err.message, 'error');
      } else {
        setFormError('Création échouée. Réessayez.');
        showToast('Création échouée. Réessayez.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Liste existante */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-ink">
          Catégories existantes ({categories?.length ?? '…'})
        </h2>

        {listError && (
          <p className="mb-3 text-sm text-red-600">{listError}</p>
        )}

        {categories === null && !listError && (
          <SkeletonGrid count={3} className="h-12 rounded-xl" gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3" />
        )}

        {categories !== null && categories.length === 0 && (
          <p className="text-sm text-ink-light">Aucune catégorie pour le moment.</p>
        )}

        {categories !== null && categories.length > 0 && (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center gap-3 rounded-xl border border-sand bg-warm-white px-4 py-3"
              >
                {cat.icon && <span className="text-lg" aria-hidden>{cat.icon}</span>}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink">{cat.name}</span>
                  <span className="text-xs text-ink-light">{cat.slug}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Formulaire de création */}
      <section className="rounded-2xl border border-sand bg-warm-white p-6">
        <h2 className="mb-5 text-base font-semibold text-ink">Créer une catégorie</h2>

        <form onSubmit={handleCreate} noValidate className="flex flex-col gap-4">
          {formError && <FormBanner tone="error">{formError}</FormBanner>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nom" htmlFor="cat-name" error={fieldErrors.name}>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                placeholder="Ex. : Plomberie"
                className={FIELD_CLASSES}
              />
            </FormField>

            <FormField label="Icône (emoji)" htmlFor="cat-icon" optional error={fieldErrors.icon}>
              <input
                id="cat-icon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={10}
                placeholder="🔧"
                className={FIELD_CLASSES}
              />
            </FormField>
          </div>

          <FormField
            label="Slug (identifiant URL)"
            htmlFor="cat-slug"
            optional
            error={fieldErrors.slug}
          >
            <input
              id="cat-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={100}
              placeholder="Déduit automatiquement du nom si absent"
              className={FIELD_CLASSES}
            />
          </FormField>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="self-start rounded-full bg-terra px-5 py-2 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Création…' : 'Créer la catégorie'}
          </button>
        </form>
      </section>
    </div>
  );
}
