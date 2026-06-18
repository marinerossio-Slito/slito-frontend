'use client';

/**
 * Formulaire de gestion de la fiche entreprise de l'artisan.
 *
 * Flux :
 * 1. Charge le tableau de bord pour obtenir l'ID de la fiche si elle existe.
 * 2. Si elle existe, charge la fiche publique (GET /api/businesses/{id}) pour
 *    pré-remplir le formulaire avec les données actuelles.
 * 3. Charge les catégories disponibles (GET /api/categories).
 * 4. Soumet via PUT /api/artisan/business (crée ou remplace).
 *
 * L'artisan voit un formulaire unifié qu'il soit en création ou en édition.
 */

import { useEffect, useState, type FormEvent } from 'react';

import { FIELD_CLASSES, FormBanner, FormField } from '@/components/forms/FormField';
import { SkeletonStack } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api';
import { fetchDashboard, upsertBusiness } from '@/lib/artisan';
import { fetchCategories } from '@/lib/catalog';
import { fetchBusiness } from '@/lib/catalog';
import type { ArtisanBusiness, UpsertBusinessPayload } from '@/types/artisan';
import type { ArtisanCategory } from '@/types/catalog';

export function BusinessForm() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<ArtisanCategory[] | null>(null);
  const [current, setCurrent] = useState<ArtisanBusiness | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Champs du formulaire
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [headline, setHeadline] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [website, setWebsite] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [replyDelay, setReplyDelay] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Charge dashboard + catégories + éventuellement la fiche courante
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      fetchDashboard(token),
      fetchCategories(),
    ])
      .then(async ([dash, cats]) => {
        if (cancelled) return;
        setCategories(cats);

        if (dash.business) {
          // Charger le détail public pour pré-remplir
          try {
            const biz = await fetchBusiness(dash.business.id);
            if (!cancelled) {
              setCurrent({
                id: biz.id,
                name: biz.name,
                headline: biz.headline,
                specialty: biz.specialty ?? null,
                description: biz.description ?? null,
                coverImage: biz.coverImage ?? null,
                website: biz.website ?? null,
                paymentMethods: biz.paymentMethods ?? null,
                contactNumber: biz.contactNumber ?? null,
                officeAddress: biz.officeAddress ?? null,
                workingHours: null,
                replyDelay: biz.replyDelay ?? null,
                category: biz.category ? { id: biz.category.id, name: biz.category.name, slug: biz.category.slug } : null,
              });
              setName(biz.name);
              setCategoryId(String(biz.category?.id ?? cats[0]?.id ?? ''));
              setHeadline(biz.headline ?? '');
              setSpecialty(biz.specialty ?? '');
              setDescription(biz.description ?? '');
              setCoverImage(biz.coverImage ?? '');
              setWebsite(biz.website ?? '');
              setContactNumber(biz.contactNumber ?? '');
              setOfficeAddress(biz.officeAddress ?? '');
              setReplyDelay(biz.replyDelay ?? '');
            }
          } catch {
            // La fiche existe côté dashboard mais est inaccessible publiquement ?
            // On continue avec un formulaire vide.
            if (!cancelled && cats.length > 0) {
              setCategoryId(String(cats[0].id));
            }
          }
        } else if (cats.length > 0) {
          setCategoryId(String(cats[0].id));
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Chargement échoué.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setFormError(null);
    setFieldErrors({});

    const catIdNum = Number(categoryId);
    if (!name.trim() || !catIdNum) {
      setFormError('Le nom et la catégorie sont obligatoires.');
      return;
    }

    const payload: UpsertBusinessPayload = {
      name: name.trim(),
      categoryId: catIdNum,
      headline: headline.trim() || null,
      specialty: specialty.trim() || null,
      description: description.trim() || null,
      coverImage: coverImage.trim() || null,
      website: website.trim() || null,
      contactNumber: contactNumber.trim() || null,
      officeAddress: officeAddress.trim() || null,
      replyDelay: replyDelay.trim() || null,
    };

    setSubmitting(true);
    try {
      const updated = await upsertBusiness(token, payload);
      setCurrent(updated);
      showToast('Fiche enregistrée avec succès !', 'success');
    } catch (err) {
      if (err instanceof ApiError && err.body?.violations?.length) {
        setFieldErrors(Object.fromEntries(err.body.violations.map((v: { field: string; message: string }) => [v.field, v.message])));
        setFormError('Le formulaire contient des erreurs.');
      } else if (err instanceof ApiError) {
        setFormError(err.message);
        showToast(err.message, 'error');
      } else {
        setFormError('Sauvegarde échouée. Réessayez.');
        showToast('Sauvegarde échouée. Réessayez.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  if (loading) {
    return <SkeletonStack count={4} className="h-12 rounded-xl" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">
          {current ? 'Modifier la fiche' : 'Créer ma fiche entreprise'}
        </h2>
        {current && (
          <a
            href={`/entreprises/${current.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-terra hover:underline"
          >
            Voir la fiche publique →
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <FormBanner tone="error">{formError}</FormBanner>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Nom */}
          <FormField
            label="Nom de l'entreprise"
            htmlFor="biz-name"
            error={fieldErrors.name}
          >
            <input
              id="biz-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              required
              className={FIELD_CLASSES}
            />
          </FormField>

          {/* Catégorie */}
          <FormField
            label="Catégorie"
            htmlFor="biz-category"
            error={fieldErrors.categoryId}
          >
            <select
              id="biz-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={FIELD_CLASSES}
            >
              {categories?.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Accroche */}
        <FormField
          label="Accroche"
          htmlFor="biz-headline"
          optional
          error={fieldErrors.headline}
        >
          <input
            id="biz-headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            maxLength={255}
            placeholder="Une phrase courte qui présente votre activité"
            className={FIELD_CLASSES}
          />
        </FormField>

        {/* Spécialité / dénomination libre */}
        <FormField
          label="Spécialité"
          htmlFor="biz-specialty"
          optional
          error={fieldErrors.specialty}
        >
          <input
            id="biz-specialty"
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            maxLength={255}
            placeholder="Votre dénomination précise, ex : Ébéniste d'art, Pisciniste…"
            className={FIELD_CLASSES}
          />
          <p className="mt-1.5 text-xs text-ink-light">
            Au-delà de votre catégorie principale, précisez votre métier exact. Ce terme aide les
            clients à vous trouver dans la recherche.
          </p>
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          htmlFor="biz-description"
          optional
          error={fieldErrors.description}
        >
          <textarea
            id="biz-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
            placeholder="Décrivez vos savoir-faire, votre expérience, vos services…"
            className={`${FIELD_CLASSES} resize-none`}
          />
        </FormField>

        {/* Photo de couverture (URL) + aperçu */}
        <FormField
          label="Photo de couverture"
          htmlFor="biz-cover"
          optional
          error={fieldErrors.coverImage}
        >
          <input
            id="biz-cover"
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            maxLength={255}
            placeholder="https://… (lien vers une image de votre travail)"
            className={FIELD_CLASSES}
          />
          <p className="mt-1.5 text-xs text-ink-light">
            Collez le lien d&apos;une image en ligne. Elle s&apos;affichera en haut de votre fiche
            publique.
          </p>
          {coverImage.trim() && (
            <div className="mt-3 overflow-hidden rounded-xl border border-sand">
              {/* Aperçu : balise img native (URL arbitraire, hors domaines next/image). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage.trim()}
                alt="Aperçu de la photo de couverture"
                className="h-40 w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Téléphone */}
          <FormField
            label="Téléphone"
            htmlFor="biz-phone"
            optional
            error={fieldErrors.contactNumber}
          >
            <input
              id="biz-phone"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              maxLength={30}
              placeholder="06 12 34 56 78"
              className={FIELD_CLASSES}
            />
          </FormField>

          {/* Site web */}
          <FormField
            label="Site web"
            htmlFor="biz-website"
            optional
            error={fieldErrors.website}
          >
            <input
              id="biz-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              maxLength={255}
              placeholder="https://…"
              className={FIELD_CLASSES}
            />
          </FormField>
        </div>

        {/* Adresse */}
        <FormField
          label="Adresse de l'atelier"
          htmlFor="biz-address"
          optional
          error={fieldErrors.officeAddress}
        >
          <input
            id="biz-address"
            type="text"
            value={officeAddress}
            onChange={(e) => setOfficeAddress(e.target.value)}
            maxLength={255}
            placeholder="12 rue des Artisans, 75001 Paris"
            className={FIELD_CLASSES}
          />
        </FormField>

        {/* Délai de réponse */}
        <FormField
          label="Délai de réponse habituel"
          htmlFor="biz-reply"
          optional
          error={fieldErrors.replyDelay}
        >
          <input
            id="biz-reply"
            type="text"
            value={replyDelay}
            onChange={(e) => setReplyDelay(e.target.value)}
            maxLength={100}
            placeholder="Exemple : sous 24h, dans la journée…"
            className={FIELD_CLASSES}
          />
        </FormField>

        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-full bg-terra px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-terra-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sauvegarde…' : current ? 'Enregistrer les modifications' : 'Créer ma fiche'}
        </button>
      </form>
    </div>
  );
}
