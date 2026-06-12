import { describe, expect, it } from 'vitest';

import { parseSearchFilters } from '@/lib/catalog';

describe('parseSearchFilters', () => {
  it('returns undefined for every field when given an empty object', () => {
    expect(parseSearchFilters({})).toEqual({
      category: undefined,
      city: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
    });
  });

  it('reads simple string and numeric values', () => {
    expect(
      parseSearchFilters({
        category: 'plomberie',
        city: 'Lyon',
        minPrice: '50',
        maxPrice: '120',
        minRating: '4',
      }),
    ).toEqual({
      category: 'plomberie',
      city: 'Lyon',
      minPrice: 50,
      maxPrice: 120,
      minRating: 4,
    });
  });

  it('trims whitespace and ignores empty strings', () => {
    expect(
      parseSearchFilters({
        category: '  électricité  ',
        city: '   ',
      }),
    ).toEqual({
      category: 'électricité',
      city: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
    });
  });

  it('takes the first value when a parameter is repeated (array)', () => {
    expect(parseSearchFilters({ category: ['menuiserie', 'peinture'], minPrice: ['80', '100'] })).toEqual(
      expect.objectContaining({ category: 'menuiserie', minPrice: 80 }),
    );
  });

  it('discards non-numeric values for numeric fields', () => {
    expect(
      parseSearchFilters({
        minPrice: 'abc',
        maxPrice: 'NaN',
        minRating: 'beaucoup',
      }),
    ).toEqual({
      category: undefined,
      city: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
    });
  });

  it('accepts decimal numbers', () => {
    expect(parseSearchFilters({ minRating: '4.5' })).toEqual(
      expect.objectContaining({ minRating: 4.5 }),
    );
  });
});
