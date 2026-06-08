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
