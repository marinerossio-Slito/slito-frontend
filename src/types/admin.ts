/**
 * Types métier pour l'espace administrateur.
 *
 * Correspondent aux réponses des endpoints /api/admin/… :
 *   - GET   /api/admin/stats
 *   - POST  /api/admin/categories
 *   - PATCH /api/admin/users/{id}
 */

export interface AdminStats {
  users: {
    total: number;
    customers: number;
    artisans: number;
    banned: number;
  };
  artisans: {
    approved: number;
    pendingApproval: number;
  };
  businesses: {
    total: number;
  };
  appointments: {
    total: number;
    byStatus: Record<string, number>;
  };
  revenue: number;
  reviews: {
    average: number | null;
    count: number;
  };
}

export interface AdminCategory {
  id: number;
  name: string;
  icon: string | null;
  slug: string;
}

export interface CreateCategoryPayload {
  name: string;
  icon?: string | null;
  /** Si absent, le slug est déduit du nom côté serveur. */
  slug?: string | null;
}

export interface AdminUserRef {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  isVerified: boolean;
  isBanned: boolean;
  artisan: {
    id: number;
    isApproved: boolean;
  } | null;
}

export interface UpdateUserPayload {
  /** true = bannir, false = réactiver */
  isBanned?: boolean;
  /** true = valider le compte artisan */
  isApproved?: boolean;
}
