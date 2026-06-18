/**
 * Accès aux endpoints publics du catalogue (cf. CatalogController côté
 * back-end). Aucune authentification requise — ces fonctions peuvent être
 * appelées depuis des composants serveur (rendu des pages publiques).
 */

import { apiFetch } from '@/lib/api';
import type { ArtisanCategory, BusinessDetail, BusinessSummary, SearchFilters } from '@/types/catalog';

interface FetchOptions {
  /** Transmis à `fetch` : permet par ex. `'no-store'` pour des données fraîches à chaque requête. */
  cache?: RequestCache;
}

export function fetchCategories(options: FetchOptions = {}): Promise<ArtisanCategory[]> {
  return apiFetch<ArtisanCategory[]>('/api/categories', { cache: options.cache });
}

export function searchBusinesses(filters: SearchFilters = {}, options: FetchOptions = {}): Promise<BusinessSummary[]> {
  return apiFetch<BusinessSummary[]>('/api/search', {
    query: { ...filters },
    cache: options.cache,
  });
}

export function fetchBusiness(id: number, options: FetchOptions = {}): Promise<BusinessDetail> {
  return apiFetch<BusinessDetail>(`/api/businesses/${id}`, { cache: options.cache });
}

/**
 * Forme brute de `searchParams` telle que fournie par les pages du App
 * Router (`Promise<{ [key: string]: string | string[] | undefined }>`).
 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Convertit les paramètres d'URL de `/recherche` (chaînes ou tableaux de
 * chaînes selon la query string) en `SearchFilters` typés et nettoyés :
 * valeurs vides ignorées, nombres invalides écartés plutôt que transmis tels
 * quels à l'API.
 */
export function parseSearchFilters(searchParams: RawSearchParams): SearchFilters {
  const readString = (key: string): string | undefined => {
    const raw = searchParams[key];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();

    return value ? value : undefined;
  };

  const readNumber = (key: string): number | undefined => {
    const raw = readString(key);
    if (raw === undefined) {
      return undefined;
    }

    const parsed = Number(raw);

    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return {
    category: readString('category'),
    q: readString('q'),
    city: readString('city'),
    minPrice: readNumber('minPrice'),
    maxPrice: readNumber('maxPrice'),
    minRating: readNumber('minRating'),
  };
}
