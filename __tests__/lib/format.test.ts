import { describe, expect, it } from 'vitest';

import { formatDateTime, formatDuration, formatPrice } from '@/lib/format';

/** Normalise les espaces insécables (U+00A0 / U+202F) renvoyées par Intl selon l'ICU disponible. */
function normalizeSpaces(value: string): string {
  return value.replace(/[  ]/g, ' ');
}

describe('formatPrice', () => {
  it('formats a number as euros without decimals', () => {
    expect(normalizeSpaces(formatPrice(45))).toBe('45 €');
  });

  it('formats a Doctrine decimal string as euros', () => {
    expect(normalizeSpaces(formatPrice('45.00'))).toBe('45 €');
  });

  it('rounds the maximum fraction digits to zero', () => {
    expect(normalizeSpaces(formatPrice('45.90'))).toBe('46 €');
  });

  it('falls back to 0 for a non-numeric string', () => {
    expect(normalizeSpaces(formatPrice('not-a-number'))).toBe('0 €');
  });

  it('formats zero', () => {
    expect(normalizeSpaces(formatPrice(0))).toBe('0 €');
  });
});

describe('formatDuration', () => {
  it('formats minutes under an hour as "X min"', () => {
    expect(formatDuration(30)).toBe('30 min');
  });

  it('formats exactly one hour as "1 h"', () => {
    expect(formatDuration(60)).toBe('1 h');
  });

  it('formats an hour and a half as "1 h 30"', () => {
    expect(formatDuration(90)).toBe('1 h 30');
  });

  it('formats multiple hours with remaining minutes', () => {
    expect(formatDuration(125)).toBe('2 h 5');
  });

  it('formats multiple whole hours without remainder', () => {
    expect(formatDuration(180)).toBe('3 h');
  });
});

describe('formatDateTime', () => {
  it('includes the French weekday, day, month and year', () => {
    // Midi UTC : aucun décalage de fuseau réaliste ne fait basculer la date.
    const result = formatDateTime('2026-07-01T12:00:00Z');

    expect(result).toContain('2026');
    expect(result).toContain('juillet');
    expect(result.toLowerCase()).toContain('mercredi');
  });

  it('produces different output for different dates', () => {
    const a = formatDateTime('2026-01-01T12:00:00Z');
    const b = formatDateTime('2026-12-25T12:00:00Z');

    expect(a).not.toBe(b);
  });
});
