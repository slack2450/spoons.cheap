import type { Drink, DrinksResult, DrinksUnavailableReason, Venue } from './types';
import { requestJson } from './request';

const apiBase = import.meta.env.DEV ? '/price-api' : 'https://api.spoons.cheap';
const unavailableReasons = new Set<DrinksUnavailableReason>([
  'venue-closed', 'ordering-unavailable', 'no-sales-area', 'no-orderable-menus', 'no-usable-drinks',
]);

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object');
  return value as Record<string, unknown>;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${field}`);
  return value;
}

function currency(value: unknown): string {
  const parsed = string(value, 'drink currency');
  if (!/^[A-Z]{3}$/.test(parsed)) throw new Error('Invalid drink currency');
  return parsed;
}

function number(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Invalid ${field}`);
  return value;
}

function boolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new Error(`Invalid ${field}`);
  return value;
}

export function parseVenue(value: unknown): Venue {
  const raw = object(value);
  const address = object(raw.address);
  const country = address.country === undefined ? undefined : object(address.country);
  return {
    franchise: string(raw.franchise, 'venue franchise'),
    id: number(raw.id, 'venue ID'),
    isClosed: boolean(raw.isClosed, 'venue closed flag'),
    name: string(raw.name, 'venue name'),
    venueRef: number(raw.venueRef, 'venue reference'),
    address: {
      town: address.town === null || address.town === undefined ? address.town : string(address.town, 'town'),
      county: address.county === null || address.county === undefined ? address.county : string(address.county, 'county'),
      country: country ? { name: string(country.name, 'country name'), code: string(country.code, 'country code') } : undefined,
    },
  };
}

function parseDrink(value: unknown): Drink {
  const raw = object(value);
  return {
    name: string(raw.name, 'drink name'),
    units: number(raw.units, 'drink units'),
    productId: number(raw.productId, 'product ID'),
    price: number(raw.price, 'drink price'),
    ppu: number(raw.ppu, 'drink price per unit'),
    currency: currency(raw.currency),
  };
}

export function parseDrinksResult(value: unknown): DrinksResult {
  const raw = object(value);
  if (raw.status === 'available' && Array.isArray(raw.drinks)) {
    if (raw.partial !== undefined && typeof raw.partial !== 'boolean') throw new Error('Invalid partial flag');
    return raw.partial === true
      ? { status: 'available', drinks: raw.drinks.map(parseDrink), partial: true }
      : { status: 'available', drinks: raw.drinks.map(parseDrink) };
  }
  if (raw.status === 'unavailable' && Array.isArray(raw.drinks) && raw.drinks.length === 0
    && unavailableReasons.has(raw.reason as DrinksUnavailableReason)) {
    return { status: 'unavailable', reason: raw.reason as DrinksUnavailableReason, drinks: [] };
  }
  throw new Error('Invalid drinks response');
}

async function get(path: string, signal?: AbortSignal): Promise<unknown> {
  return requestJson(`${apiBase}${path}`, { signal });
}

export async function loadVenues(signal?: AbortSignal): Promise<Venue[]> {
  const payload = await get('/v2/venues', signal);
  if (!Array.isArray(payload)) throw new Error('Venue response is not an array');
  return payload.map(parseVenue);
}

export async function loadDrinks(venueRef: number, signal?: AbortSignal): Promise<DrinksResult> {
  return parseDrinksResult(await get(`/v2/drinks/${venueRef}`, signal));
}
