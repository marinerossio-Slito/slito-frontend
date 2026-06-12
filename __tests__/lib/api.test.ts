import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch } from '@/lib/api';

function jsonResponse(body: unknown, init: { status?: number; ok?: boolean } = {}): Response {
  const status = init.status ?? 200;

  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('ApiError', () => {
  it('prefers body.error over the other fields', () => {
    const error = new ApiError(400, {
      error: 'Erreur explicite.',
      message: 'Autre message.',
      violations: [{ field: 'x', message: 'y' }],
    });

    expect(error.message).toBe('Erreur explicite.');
    expect(error.status).toBe(400);
    expect(error.name).toBe('ApiError');
  });

  it('falls back to body.message when there is no error field', () => {
    const error = new ApiError(400, { message: 'Message générique.' });

    expect(error.message).toBe('Message générique.');
  });

  it('joins violation messages when there is no error or message', () => {
    const error = new ApiError(422, {
      violations: [
        { field: 'email', message: 'Email invalide.' },
        { field: 'password', message: 'Mot de passe trop court.' },
      ],
    });

    expect(error.message).toBe('Email invalide. Mot de passe trop court.');
  });

  it('falls back to a generic message when the body is empty', () => {
    expect(new ApiError(500, null).message).toBe('La requête a échoué (code 500).');
  });
});

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('performs a GET request against the API base URL with default headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<{ ok: boolean }>('/api/ping');

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:8000/api/ping');
    expect(init.method).toBe('GET');
    expect(init.headers.Accept).toBe('application/json');
    expect(init.headers['Content-Type']).toBeUndefined();
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('serialises the body as JSON and sets Content-Type for write requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/things', { method: 'POST', body: { name: 'Perceuse' } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ name: 'Perceuse' }));
  });

  it('adds the Authorization header when a token is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/me', { token: 'abc123' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not add an Authorization header when no token is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/public');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('builds the URL with query parameters, dropping empty/null/undefined values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/search', {
      query: { city: 'Lyon', minPrice: 50, category: '', other: undefined, missing: null, flag: false },
    });

    const [url] = fetchMock.mock.calls[0];
    const parsed = new URL(url as string);
    expect(parsed.searchParams.get('city')).toBe('Lyon');
    expect(parsed.searchParams.get('minPrice')).toBe('50');
    expect(parsed.searchParams.get('flag')).toBe('false');
    expect(parsed.searchParams.has('category')).toBe(false);
    expect(parsed.searchParams.has('other')).toBe(false);
    expect(parsed.searchParams.has('missing')).toBe(false);
  });

  it('returns null for an empty response body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, text: () => Promise.resolve('') });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch('/api/void');

    expect(result).toBeNull();
  });

  it('throws an ApiError carrying the status and decoded body on a failed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: 'Accès refusé.' }, { status: 403, ok: false }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/api/forbidden')).rejects.toMatchObject({
      status: 403,
      message: 'Accès refusé.',
    });
  });
});
