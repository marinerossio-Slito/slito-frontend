/**
 * Accès aux endpoints d'administration.
 * Toutes ces fonctions nécessitent un jeton JWT avec ROLE_ADMIN.
 *
 *   GET   /api/admin/stats
 *   POST  /api/admin/categories
 *   PATCH /api/admin/users/{id}
 */

import { apiFetch } from '@/lib/api';
import type { AdminCategory, AdminStats, AdminUserRef, CreateCategoryPayload, UpdateUserPayload } from '@/types/admin';

export function fetchAdminStats(token: string): Promise<AdminStats> {
  return apiFetch<AdminStats>('/api/admin/stats', { token });
}

/**
 * Crée une nouvelle catégorie d'artisan.
 * Si `slug` est absent ou vide, le serveur le déduit du `name`.
 * Retourne 409 si le slug est déjà pris.
 */
export function createAdminCategory(token: string, payload: CreateCategoryPayload): Promise<AdminCategory> {
  return apiFetch<AdminCategory>('/api/admin/categories', {
    method: 'POST',
    token,
    body: payload,
  });
}

/**
 * Met à jour un compte utilisateur (ban/unban et/ou approbation artisan).
 * Au moins l'un des champs `isBanned` ou `isApproved` doit être fourni.
 */
export function updateAdminUser(token: string, id: number, payload: UpdateUserPayload): Promise<AdminUserRef> {
  return apiFetch<AdminUserRef>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}
