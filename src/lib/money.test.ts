import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats pounds and euros from the API currency', () => {
    expect(formatMoney(3.5, 'GBP')).toBe('£3.50');
    expect(formatMoney(3.5, 'EUR')).toBe('€3.50');
  });

  it('uses the requested precision and handles missing values', () => {
    expect(formatMoney(1.2345, 'GBP', 3)).toBe('£1.235');
    expect(formatMoney(undefined, 'GBP')).toBe('—');
  });

  it('falls back to currency-neutral formatting for malformed currency', () => {
    expect(formatMoney(3.5, 'not-a-currency')).toBe('3.50');
    expect(formatMoney(3.5, '')).toBe('3.50');
  });

  it('cannot be crashed by an invalid precision', () => {
    expect(formatMoney(3.5, 'GBP', -100)).toBe('£4');
  });
});
