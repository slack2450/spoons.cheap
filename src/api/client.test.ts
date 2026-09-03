import { describe, expect, it } from 'vitest';
import { parseDrinksResult, parseVenue } from './client';

describe('API response parsing', () => {
  it('parses a venue without inventing optional address fields', () => {
    expect(parseVenue({
      franchise: 'jdw', id: 1, isClosed: false, name: 'Test', venueRef: 123, address: {},
    })).toMatchObject({ name: 'Test', venueRef: 123, address: {} });
  });

  it('preserves drink currency', () => {
    const result = parseDrinksResult({
      status: 'available',
      drinks: [{ name: 'Lager', units: 2, productId: 4, price: 4.5, ppu: 2.25, currency: 'EUR' }],
    });
    expect(result.drinks[0]?.currency).toBe('EUR');
  });

  it.each(['gbp', 'GB', 'POUNDS', '', 123])('rejects malformed drink currency %j', (currency) => {
    expect(() => parseDrinksResult({
      status: 'available',
      drinks: [{ name: 'Lager', units: 2, productId: 4, price: 4.5, ppu: 2.25, currency }],
    })).toThrow('Invalid drink currency');
  });

  it.each([
    { status: 'available', drinks: [{ name: 'broken' }] },
    { status: 'unavailable', reason: 'anything', drinks: [] },
    { status: 'available', drinks: 'not-an-array' },
  ])('rejects malformed payloads', (payload) => {
    expect(() => parseDrinksResult(payload)).toThrow();
  });
});
