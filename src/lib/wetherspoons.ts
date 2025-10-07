import { Drink } from '../types/Drink';

export const HighLevelMenuSchema = z.object({
  canOrder: z.boolean(),
  description: z.string().nullable(),
  franchise: z.string(),
  id: z.number(),
  name: z.string(),
  salesAreaId: z.number(),
  venueRef: z.number(),
})

const HighLevelMenuArraySchema = z.array(HighLevelMenuSchema);

type HighLevelMenu = z.infer<typeof HighLevelMenuSchema>

async function getMenus(venue: VenueDetailResponse): Promise<HighLevelMenu[]> {

  console.log(venue)

  const res = await fetch(`https://ca.jdw-apps.net/api/v0.1/${venue.franchise}/venues/${venue.venueRef}/sales-areas/${venue.salesAreas[0].id}/menus`, {
    headers: {
      Authorization: "Bearer 1|SFS9MMnn5deflq0BMcUTSijwSMBB4mc7NSG2rOhqb2765466"
    }
  });

  const json = await res.json();

  const parsed = HighLevelMenuArraySchema.parse(json.data);

  console.log(parsed);

  return parsed;
}

export const DetailedMenuItemTextSchema = z.object({
  itemType: z.literal("text"),
  text: z.string(),
})

export const DetailedMenuItemDividerSchema = z.object({
  itemType: z.literal("divider"),
})

// TODO: Ale
export const DetailedMenuItemAleSchema = z.object({
  itemType: z.literal("ale"),
})

export const DetailedMenuItemProductOptionsSchema = z.object({
  addOns: z.array(z.unknown()),
  choices: z.array(z.unknown()),
  linked: z.array(z.unknown()),
  portion: z.object({
    options: z.array(z.object({
      isDefault: z.boolean(),
      label: z.string(),
      value: z.object({
        price: z.object({
          currency: z.string(),
          discount: z.number(),
          initialValue: z.number(),
          value: z.number(),
        })
      })
    }))
  }),
  swap: z.unknown(),
  tags: z.unknown(),
  tillRequests: z.unknown(),
});

type DetailedMenuProduct = z.infer<typeof DetailedMenuItemProductSchema>

export const DetailedMenuItemProductSchema = z.object({
  ageRestriction: z.number().nullable(),
  alerts: z.unknown(),
  calories: z.unknown().nullable(),
  checkout: z.unknown(),
  courseId: z.number(),
  description: z.string().nullable(),
  displayRecordId: z.number(),
  id: z.number(),
  isOutOfStock: z.boolean(),
  itemType: z.literal("product"),
  keywords: z.array(z.unknown()),
  name: z.string(),
  options: DetailedMenuItemProductOptionsSchema,
  related: z.array(z.unknown()),
  salesAreaId: z.array(z.unknown()),
  showPrice: z.boolean(),
  sortOrder: z.number(),
})

export const DetailedMenuItemGroupsSchema = z.object({
  description: z.string().nullable(),
  items: z.array(z.union([DetailedMenuItemTextSchema, DetailedMenuItemDividerSchema, DetailedMenuItemAleSchema, DetailedMenuItemProductSchema])),
  name: z.string().nullable(),
  sortOrder: z.number(),
});

export const DetailedMenuCategorySchema = z.object({
  hidden: z.boolean(),
  id: z.number(),
  itemGroups: z.array(DetailedMenuItemGroupsSchema),
  name: z.string(),
  sortOrder: z.number(),
  subCategories: z.unknown(),
});

export const DetailedMenuSchema = z.object({
  canOrder: z.boolean(),
  categories: z.array(DetailedMenuCategorySchema),
  description: z.string(),
  franchise: z.string(),
  id: z.number(),
  image: z.unknown(),
  isSpecials: z.boolean(),
  name: z.string(),
  salesAreaId: z.number(),
  sortOrder: z.number(),
  updated: z.string(),
  venueRef: z.number(),
  versionId: z.number(),
});

type DetailedMenu = z.infer<typeof DetailedMenuSchema>

export const DetailedMenuDataSchema = z.object({
  data: DetailedMenuSchema
});

async function getMenuPages(menu: HighLevelMenu): Promise<DetailedMenu> {
  const res = await fetch(`https://ca.jdw-apps.net/api/v0.1/${menu.franchise}/venues/${menu.venueRef}/sales-areas/${menu.salesAreaId}/menus/${menu.id}`, {
    headers: {
      Authorization: "Bearer 1|SFS9MMnn5deflq0BMcUTSijwSMBB4mc7NSG2rOhqb2765466"
    }
  });

  const json = await res.json();

  console.log(json);

  const parsed = DetailedMenuDataSchema.parse(json)

  return parsed.data;
}

function strengthAndVolumeToUnits(strength: number, volume: number) {
  return (strength * volume) / 1000;
}

export async function getTodaysDrinks(venue: VenueDetailResponse): Promise<Drink[]> {

  const menus = await getMenus(venue);

  let drinksMenu;
  for (const menu of menus) {
    if (menu.name === 'Drinks') {
      drinksMenu = menu;
      break;
    }
  }

  const res = await getMenuPages(drinksMenu!);

  const hash_map = new Map<number, DetailedMenuProduct>();

  for (const categories of res.categories) {
    for (const itemGroup of categories.itemGroups) {
      for (const item of itemGroup.items) {
        if (item.itemType == 'product') {
          // Skip out of stock
          if (item.isOutOfStock) continue;
          hash_map.set(item.id, item)
        }
      }
    }
  }

  const drinks = [];

  for (const product of hash_map.values()) {

    const strengthMatches = product.description!.match(/(\d?\d?\.?\d?\d%)\s?ABV/);
    const volumeDescriptionMatches = product.description!.match(/(\d?\d\d)ml/);

    let strength;
    if (strengthMatches)
      strength = parseFloat(strengthMatches[0])

    let volumeDescription;
    if (volumeDescriptionMatches)
      volumeDescription = parseFloat(volumeDescriptionMatches[0])

    let bestPortion;
    let bestPPU = Infinity;
    let bestUnits = 0;

    for (const portion of product.options.portion.options) {
      let units;

      const volumeMatches = portion.label.match(/(\d?\d\d)ml/);

      let volume;
      if (volumeMatches)
        volume = parseFloat(volumeMatches[1]);

      const unitsMatches = portion.label.match(/(\d?\.?\d?\d) unit/);
      if (unitsMatches)
        units = parseFloat(unitsMatches[1]);

      if (portion.label === 'Pint' && strength) {
        units = strengthAndVolumeToUnits(strength, 568);
      } else if (['Half pint', 'Half Pint', 'Half'].includes(portion.label) && typeof strength !== 'undefined') {
        units = strengthAndVolumeToUnits(strength, 284);
      } else if (typeof strength !== 'undefined' && volume) {
        units = strengthAndVolumeToUnits(strength, volume);
      } else if (typeof strength !== 'undefined' && volumeDescription) {
        units = strengthAndVolumeToUnits(strength, volumeDescription);
      } else if (typeof strength !== 'undefined' && portion.label === 'Single') {
        units = strengthAndVolumeToUnits(strength, 25)
      } else if (typeof strength !== 'undefined' && portion.label === 'Double') {
        units = strengthAndVolumeToUnits(strength, 50)
      }

      if (typeof units !== 'undefined') {
        const ppu = portion.value.price.value / units;

        if (ppu < bestPPU) {
          bestPPU = ppu;
          bestPortion = portion;
          bestUnits = units;
        }
      }
    }

    if (typeof bestPortion !== 'undefined') {
      drinks.push({
        name: product.name,
        units: bestUnits,
        ppu: bestPPU,
        productId: product.id,
        price: bestPortion?.value.price.value,
      })
    }
  }

  drinks.sort((a, b) => {
    return a.ppu - b.ppu;
  });

  return drinks;
}


import { z } from "zod";

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  distanceTolerance: z.number().optional()
});

export const CountrySchema = z.object({
  name: z.string(),
  code: z.string()
});

const AddressSchema = z.object({
  line1: z.string().nullable().optional(),
  line2: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  // allow extra keys like location etc if present
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      distanceTolerance: z.number().optional()
    })
    .optional()
});

export const VenueSchema = z.object({
  address: AddressSchema,
  franchise: z.string(),
  hotel: z.nullable(z.any()).optional(), // null in your sample; change type if hotel has shape
  id: z.number(),
  isClosed: z.boolean(),
  name: z.string(),
  temporaryClosed: z.nullable(z.any()).optional(),
  type: z.string(),
  venueRef: z.number()
});

// TypeScript type
export type Venue = z.infer<typeof VenueSchema>;

export const VenuesArraySchema = z.array(VenueSchema);

export async function getPubs(): Promise<Venue[]> {
  // Fetch globals.json
  // Not sure we need this anymore
  //const globals: Globals = await (await fetch('https://oandp-appmgr-prod.s3.eu-west-2.amazonaws.com/global.json')).json();

  const res = await fetch("https://ca.jdw-apps.net/api/v0.1/venues", {
    headers: {
      Authorization: "Bearer 1|SFS9MMnn5deflq0BMcUTSijwSMBB4mc7NSG2rOhqb2765466"
    }
  });

  const resBody = await res.json();

  const parsed = VenuesArraySchema.safeParse(resBody.data ?? resBody);

  if (!parsed.success) {
    console.error("❌ Validation failed:", parsed.error.format());
    return [];
  }

  console.log(parsed.data)

  const res2 = await fetch(`https://ca.jdw-apps.net/api/v0.1/venues/${parsed.data![0].venueRef}`, {
    headers: {
      Authorization: "Bearer 1|SFS9MMnn5deflq0BMcUTSijwSMBB4mc7NSG2rOhqb2765466"
    }
  });

  console.log(await res2.json());

  return parsed.data!;
}

// Currency
const CurrencySchema = z.object({
  code: z.string(), // e.g. 'GBP'
  currencyCode: z.string().optional(),
  countryCode: z.string().optional(),
  symbol: z.string().optional(),
  htmlName: z.string().optional()
}).partial(); // allow other fields or missing fields

// Sales area (sample structure seen in your object)
const SalesAreaSchema = z.object({
  id: z.number(),
  canChangeToRoom: z.boolean().optional(),
  canOrder: z.boolean().optional(),
  canPlaceOrder: z.boolean().optional(),
  description: z.string().nullable().optional(),
  friendly: z.string().nullable().optional(),
});

const PaymentPayitSchema = z.object({}).passthrough();
const PaymentApplePaySchema = z.object({}).passthrough();

const PaymentSchema = z.object({
  gateway: z.unknown(),
  payit: PaymentPayitSchema.optional(),
  applePay: PaymentApplePaySchema.optional(),
  googlePay: z.nullable(z.any()).optional(),
  methods: z.unknown()
}).partial();

/* -------------------------
   Top-level venue detail
   ------------------------- */

export const VenueDetailSchema = z.object({
  address: AddressSchema,
  allergensUrl: z.string().url().nullable().optional(),
  canPlaceOrder: z.boolean().optional(),
  clientItemId: z.nullable(z.any()).optional(),
  comingSoon: z.boolean().optional(),
  contactDetails: z.unknown(),
  currency: CurrencySchema.optional(),
  displayImages: z.array(z.string().url()).optional(),
  facilities: z.array(z.string()).optional(),
  franchise: z.string().optional(),
  hotel: z.nullable(z.any()).optional(),
  id: z.number(),
  isClosed: z.boolean().optional(),
  locale: z.string().optional(),
  menuUrl: z.object({
    dairyFree: z.nullable(z.any()).optional(),
    glutenFree: z.nullable(z.any()).optional()
  }).optional(),
  name: z.string().optional(),
  onlineOrderTaken: z.nullable(z.any()).optional(),
  openingTimes: z.unknown(),
  orderingEnabled: z.boolean().optional(),
  originalRef: z.string().optional(),
  payment: PaymentSchema.optional(),
  pricing: z.unknown(),
  rearMenuId: z.number().optional(),
  salesAreas: z.array(SalesAreaSchema),
  services: z.array(z.number()).optional(),
  station: z.nullable(z.any()).optional(),
  tableBookingsTaken: z.nullable(z.any()).optional(),
  tableBookingsUrl: z.nullable(z.any()).optional(),
  temporaryClosed: z.nullable(z.any()).optional(),
  thumbnail: z.string().nullable().optional(),
  thumbnailImages: z.array(z.string()).optional(),
  type: z.string().optional(),
  venueCanOrder: z.boolean().optional(),
  venueRef: z.union([z.string(), z.number()]).optional()
});

/* -------------------------
   Type alias for usage
   ------------------------- */

export type VenueDetailResponse = z.infer<typeof VenueDetailSchema>;

export async function fetchVenueDetail(venue: Venue): Promise<VenueDetailResponse> {
  const res = await fetch(`https://ca.jdw-apps.net/api/v0.1/venues/${venue.venueRef}`, {
    headers: {
      Authorization: "Bearer 1|SFS9MMnn5deflq0BMcUTSijwSMBB4mc7NSG2rOhqb2765466"
    }
  });

  const json = await res.json();

  // Validate at runtime; throws on failure
  const parsed = VenueDetailSchema.parse(json.data);

  return parsed;
}