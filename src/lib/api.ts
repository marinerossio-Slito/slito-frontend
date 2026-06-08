/**
 * Client HTTP centralisé pour l'API Slito (back-end Symfony, cf. slito-backend).
 *
 * Toute la connaissance du protocole HTTP (URL de base, en-têtes JSON, jeton
 * d'authentification, normalisation des erreurs) vit ici : les composants ne
 * font jamais de `fetch` directement, ils appellent `apiFetch`.
 *
 * Le back-end est entièrement stateless (JWT, cf. ARCHITECTURE.md back-end,
 * section « Authentification ») : on porte donc le jeton nous-mêmes dans
 * l'en-tête `Authorization: Bearer <token>` à chaque requête authentifiée.
 */

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

/**
 * Forme des réponses d'erreur renvoyées par les contrôleurs de l'API : tantôt
 * un message simple (`{ error }`), tantôt une liste de violations de
 * validation (`{ violations: [{ field, message }] }`, cf. par ex.
 * ReviewController::formatViolations côté back-end).
 */
export interface ApiViolation {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error?: string;
  message?: string;
  violations?: ApiViolation[];
}

/**
 * Erreur levée pour toute réponse HTTP en échec (status >= 400). Conserve le
 * code et le corps décodé pour que l'appelant puisse afficher un message
 * pertinent (ex. les violations de champ d'un formulaire).
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | null,
  ) {
    super(ApiError.extractMessage(status, body));
    this.name = 'ApiError';
  }

  private static extractMessage(status: number, body: ApiErrorBody | null): string {
    if (body?.error) {
      return body.error;
    }
    if (body?.message) {
      return body.message;
    }
    if (body?.violations?.length) {
      return body.violations.map((violation) => violation.message).join(' ');
    }

    return `La requête a échoué (code ${status}).`;
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Corps JSON de la requête : sérialisé automatiquement. */
  body?: unknown;
  /** Jeton JWT à porter dans `Authorization: Bearer`, si la route est protégée. */
  token?: string | null;
  /** Transmis tel quel à `fetch` (utile pour le cache des pages publiques côté serveur). */
  cache?: RequestCache;
  /** Paramètres de requête ajoutés à l'URL (valeurs `null`/`undefined` ignorées). */
  query?: Record<string, string | number | boolean | null | undefined>;
}

function buildUrl(path: string, query?: ApiFetchOptions['query']): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, `${API_URL}/`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Effectue une requête vers l'API Slito et renvoie le corps JSON décodé et
 * typé. Lève une `ApiError` pour toute réponse en échec.
 *
 * @template T Forme attendue de la réponse (laissée à la charge de l'appelant,
 *             à faire correspondre aux types de `src/types/`).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token, cache, query } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
  });

  const raw = await response.text();
  const data = raw === '' ? null : (JSON.parse(raw) as unknown);

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody | null);
  }

  return data as T;
}
