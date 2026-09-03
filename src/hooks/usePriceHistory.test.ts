import { describe, expect, it } from 'vitest';
import { parsePriceHistory } from './usePriceHistory';

describe('parsePriceHistory', () => {
  it('parses finite price points', () => {
    expect(parsePriceHistory([{ time: '2026-01-01T00:00:00Z', price: 3.25 }])).toEqual([{
      time: Date.parse('2026-01-01T00:00:00Z'),
      price: 3.25,
    }]);
  });

  it.each([
    null,
    [{ time: 'bad', price: 3 }],
    [{ time: '2026-01-01T00:00:00Z', price: Number.NaN }],
    [{ time: '2026-01-01T00:00:00Z', price: '3' }],
  ])('rejects malformed history payloads', (payload) => {
    expect(() => parsePriceHistory(payload)).toThrow();
  });
});
