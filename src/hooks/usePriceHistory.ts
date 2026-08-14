import { useEffect, useRef, useState } from 'react';
import { Drink, HighLevelVenue } from 'wetherspoons-api';

export type PricePoint = { time: number; price: number };
export type PriceRange = '24h' | '7d' | '30d' | '1y';

const priceApiBase = import.meta.env.DEV ? '/price-api' : 'https://api.spoons.cheap';

function parsePriceHistory(payload: unknown): PricePoint[] {
  if (!Array.isArray(payload)) throw new Error('Price history response is not an array');

  return payload.map((item) => {
    if (typeof item !== 'object' || item === null || !('time' in item) || !('price' in item)) {
      throw new Error('Price history contains an invalid item');
    }

    const { time, price } = item;
    const timestamp = typeof time === 'string' ? Date.parse(time) : Number.NaN;
    if (!Number.isFinite(timestamp) || typeof price !== 'number' || !Number.isFinite(price)) {
      throw new Error('Price history contains invalid values');
    }

    return { time: timestamp, price };
  });
}

export function usePriceHistory(pub: HighLevelVenue, drink: Drink, enabled: boolean, range: PriceRange) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const cache = useRef(new Map<PriceRange, PricePoint[]>());

  useEffect(() => {
    if (!enabled) return;

    const cachedData = cache.current.get(range);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();
    setData([]);
    setLoading(true);
    setError(false);

    void fetch(
      `${priceApiBase}/v2/price/${pub.venueRef}/${drink.productId}?range=${range}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(`Price history returned ${response.status}`);
        const points = parsePriceHistory(await response.json());
        cache.current.set(range, points);
        setData(points);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        console.error(`Failed to load ${range} price history for ${drink.name}`, requestError);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [drink.name, drink.productId, enabled, pub.venueRef, range]);

  return { data, loading, error };
}
