export type Address = {
  town?: string | null | undefined
  county?: string | null | undefined
  country?: { name: string, code: string } | undefined
};

export type Venue = {
  franchise: string
  id: number
  isClosed: boolean
  name: string
  venueRef: number
  address: Address
};

export type Drink = {
  name: string
  units: number
  productId: number
  price: number
  ppu: number
  currency: string
};

export type DrinksUnavailableReason
  = | 'venue-closed'
    | 'ordering-unavailable'
    | 'no-sales-area'
    | 'no-orderable-menus'
    | 'no-usable-drinks';

export type DrinksResult
  = | { status: 'available', drinks: Drink[], partial?: boolean }
    | { status: 'unavailable', reason: DrinksUnavailableReason, drinks: [] };
