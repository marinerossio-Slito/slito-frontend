import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  clearStoredToken,
  hasAnyRole,
  isExpired,
  primaryAccountPath,
  readStoredToken,
  translateAuthError,
  userFromToken,
  writeStoredToken,
} from '@/lib/auth';

/** Encode un objet en segment base64url, comme le ferait un émetteur de JWT. */
function base64UrlEncode(value: unknown): string {
  const json = JSON.stringify(value);
  const base64 = btoa(unescape(encodeURIComponent(json)));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Construit un faux JWT `header.payload.signature` (signature non vérifiée côté front). */
function buildJwt(payload: unknown): string {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlEncode(payload);

  return `${header}.${body}.signature`;
}

describe('userFromToken', () => {
  it('decodes a valid token into an AuthUser', () => {
    const token = buildJwt({ username: 'user@example.com', roles: ['ROLE_USER', 'ROLE_ARTISAN'], exp: 1999999999 });

    expect(userFromToken(token)).toEqual({
      email: 'user@example.com',
      roles: ['ROLE_USER', 'ROLE_ARTISAN'],
      expiresAt: 1999999999,
    });
  });

  it('defaults roles to an empty array when missing or invalid', () => {
    const token = buildJwt({ username: 'user@example.com' });

    expect(userFromToken(token)).toEqual({
      email: 'user@example.com',
      roles: [],
      expiresAt: null,
    });
  });

  it('filters out non-string roles', () => {
    const token = buildJwt({ username: 'user@example.com', roles: ['ROLE_USER', 42, null] });

    expect(userFromToken(token)?.roles).toEqual(['ROLE_USER']);
  });

  it('returns null when the username claim is missing', () => {
    const token = buildJwt({ roles: ['ROLE_USER'] });

    expect(userFromToken(token)).toBeNull();
  });

  it('returns null for a token that does not have 3 segments', () => {
    expect(userFromToken('not-a-jwt')).toBeNull();
  });

  it('returns null for a token whose payload is not valid JSON', () => {
    const token = `${base64UrlEncode({ alg: 'HS256' })}.not-base64-json.signature`;

    expect(userFromToken(token)).toBeNull();
  });
});

describe('isExpired', () => {
  it('returns false when expiresAt is null', () => {
    expect(isExpired({ expiresAt: null })).toBe(false);
  });

  it('returns false for a timestamp in the future', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;

    expect(isExpired({ expiresAt: future })).toBe(false);
  });

  it('returns true for a timestamp in the past', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;

    expect(isExpired({ expiresAt: past })).toBe(true);
  });
});

describe('hasAnyRole', () => {
  it('returns true when no role is required, even without a user', () => {
    expect(hasAnyRole(null, [])).toBe(true);
  });

  it('returns false when roles are required but user is null', () => {
    expect(hasAnyRole(null, ['ROLE_ADMIN'])).toBe(false);
  });

  it('returns true when the user has one of the required roles', () => {
    expect(hasAnyRole({ roles: ['ROLE_USER', 'ROLE_ARTISAN'] }, ['ROLE_ADMIN', 'ROLE_ARTISAN'])).toBe(true);
  });

  it('returns false when the user has none of the required roles', () => {
    expect(hasAnyRole({ roles: ['ROLE_USER'] }, ['ROLE_ADMIN'])).toBe(false);
  });
});

describe('primaryAccountPath', () => {
  it('returns / for an anonymous user', () => {
    expect(primaryAccountPath(null)).toBe('/');
  });

  it('returns /admin for an admin', () => {
    expect(primaryAccountPath({ roles: ['ROLE_USER', 'ROLE_ADMIN'] })).toBe('/admin');
  });

  it('returns /artisan for an artisan', () => {
    expect(primaryAccountPath({ roles: ['ROLE_USER', 'ROLE_ARTISAN'] })).toBe('/artisan');
  });

  it('prioritises admin over artisan when both roles are present', () => {
    expect(primaryAccountPath({ roles: ['ROLE_ADMIN', 'ROLE_ARTISAN'] })).toBe('/admin');
  });

  it('returns /compte for a plain customer', () => {
    expect(primaryAccountPath({ roles: ['ROLE_USER'] })).toBe('/compte');
  });
});

describe('translateAuthError', () => {
  it('translates the invalid credentials message', () => {
    expect(translateAuthError('Invalid credentials.')).toBe('Email ou mot de passe incorrect.');
  });

  it('returns unknown messages unchanged', () => {
    expect(translateAuthError('Compte banni.')).toBe('Compte banni.');
  });
});

/** `localStorage` n'est pas toujours disponible tel quel sous jsdom/Vitest : on fournit un mock mémoire. */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('token storage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: new MemoryStorage(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    clearStoredToken();
  });

  it('returns null when nothing is stored', () => {
    expect(readStoredToken()).toBeNull();
  });

  it('persists and retrieves a token', () => {
    writeStoredToken('jwt.token.value');

    expect(readStoredToken()).toBe('jwt.token.value');
  });

  it('removes the token on clear', () => {
    writeStoredToken('jwt.token.value');
    clearStoredToken();

    expect(readStoredToken()).toBeNull();
  });
});
