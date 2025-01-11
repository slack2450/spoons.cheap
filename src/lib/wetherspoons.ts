import { Drink } from '../types/Drink';
import { Pub } from '../types/Pub';

interface WetherspoonRequest {
  method: string;
  siteId?: number;
  menuId?: number;
  salesAreaId?: number;
}

async function wetherspoonRequest(request: WetherspoonRequest): Promise<any> {
  const requestDefaults = {
    platform: "nintendo-ds",
    bundleIdentifier: "com.stella.enjoyers",
    userDeviceIdentifier: "i-love-drinking-beer",
    version: "1.0.0",
  }

  const form = new FormData();
  form.append(
    'request',
    JSON.stringify(
      {
        'request': { ...requestDefaults, ...request }
      }
    )
  );

  const res = await fetch('https://zc.ca.jdw-apps.net/api/iorder',
    {
      headers: {
        'x-api-key': 'SH0obBv23pj7lUrg5SESDdJO8fS9p0ND',
      },
      body: form,
      method: 'POST'
    }
  );

  return res.json()
}

interface MenuResponse {
  menus: Menu[];
}

interface Menu {
  id: number;
  name: string;
}

async function getMenus(siteId: number, salesAreaId: number): Promise<Menu[]> {
  const res: MenuResponse = await wetherspoonRequest(
    {
      method: 'getMenus',
      siteId,
      salesAreaId
    }
  )
  return res.menus;
}

interface MenuPagesResponse {
  aztec: Aztec;
  display: Display;
}

interface Aztec {
  products: Product[];
}

interface Product {
  id: number;
  eposName: string;
  displayRecords: DisplayRecord[];
  portions: Portion[];
}

interface DisplayRecord {
  description: string;
  name: string;
}

interface Portion {
  name: string;
  price: number;
}

interface Display {
  displayGroups: DisplayGroup[];
}

interface DisplayGroup {
  groupId: number;
  groupName: string;
  items: Item[]
}

type Item = ProductItem | TextItem | HyperLinkItem | SubHeaderItem;

interface SubHeaderItem {
  itemId: number;
  itemType: 'subHeader';
}

interface TextItem {
  itemId: number;
  itemType: 'textField';
}

interface HyperLinkItem {
  itemId: number;
  itemType: 'hyperlink';
}

interface ProductItem {
  itemId: number;
  itemType: 'product'
  product: ProductItemProduct;
}

interface ProductItemProduct {
  productId: number;
  displayName: string;
}

async function getMenuPages(siteId: number, salesAreaId: number, menuId: number): Promise<MenuPagesResponse> {
  return wetherspoonRequest(
    {
      method: 'getMenuPages',
      siteId,
      salesAreaId,
      menuId
    }
  );
}

function strengthAndVolumeToUnits(strength: number, volume: number) {
  return (strength * volume) / 1000;
}

export async function getTodaysDrinks(venueId: number, salesAreaId: number): Promise<Drink[]> {

  const menus = await getMenus(venueId, salesAreaId);

  let menuId;
  for (const menu of menus) {
    if (menu.name === 'Drinks') {
      menuId = menu.id;
      break;
    }
  }

  if (!menuId) return [];
  const res = await getMenuPages(venueId, salesAreaId, menuId);

  // Convert menu to flat array of drinks
  const displayedItems = res.display.displayGroups.map(
    (displayGroup) => {
      const products = displayGroup.items.filter(item => item.itemType === 'product') as ProductItem[];
      return products.map((item) => item.product)
    }
  ).flat(1);

  const displayNameLookup = new Map<number, string>();
  for (const displayItem of displayedItems) {
    displayNameLookup.set(displayItem.productId, displayItem.displayName);
  }

  const drinks: Drink[] = [];

  for (const product of res.aztec.products) {

    // Skip hidden menus items
    if (!displayNameLookup.has(product.id)) continue;


    const strengthMatches = product.displayRecords?.[0]?.description.match(/(\d?\d?\.?\d?\d%)\s?ABV/);
    const volumeDescriptionMatches = product.displayRecords?.[0]?.description.match(/(\d?\d\d)ml/);

    let strength;
    if (strengthMatches)
      strength = parseFloat(strengthMatches[0])

    let volumeDescription;
    if (volumeDescriptionMatches)
      volumeDescription = parseFloat(volumeDescriptionMatches[0])

    let bestPortion;
    let bestPPU = Infinity;
    let bestUnits = 0;

    for (const portion of product.portions) {
      let units;

      const volumeMatches = portion.name.match(/(\d?\d\d)ml/);

      let volume;
      if (volumeMatches)
        volume = parseFloat(volumeMatches[1]);

      const unitsMatches = portion.name.match(/(\d?\.?\d?\d) unit/);
      if (unitsMatches)
        units = parseFloat(unitsMatches[1]);

      if (portion.name === 'Pint' && strength) {
        units = strengthAndVolumeToUnits(strength, 568);
      } else if (['Half pint', 'Half Pint', 'Half'].includes(portion.name) && typeof strength !== 'undefined') {
        units = strengthAndVolumeToUnits(strength, 284);
      } else if (typeof strength !== 'undefined' && volume) {
        units = strengthAndVolumeToUnits(strength, volume);
      } else if (typeof strength !== 'undefined' && volumeDescription) {
        units = strengthAndVolumeToUnits(strength, volumeDescription);
      } else if (typeof strength !== 'undefined' && portion.name === 'Single') {
        units = strengthAndVolumeToUnits(strength, 25)
      } else if (typeof strength !== 'undefined' && portion.name === 'Double') {
        units = strengthAndVolumeToUnits(strength, 50)
      }

      if (typeof units !== 'undefined') {
        const ppu = portion.price / units;

        if (ppu < bestPPU) {
          bestPPU = ppu;
          bestPortion = portion;
          bestUnits = units;
        }
      }
    }

    if (typeof bestPortion !== 'undefined') {
      drinks.push({
        name: displayNameLookup.get(product.id) || product.eposName,
        units: bestUnits,
        ppu: bestPPU,
        productId: product.id,
        price: bestPortion?.price,
      })
    }
  }

  drinks.sort((a, b) => {
    return a.ppu - b.ppu;
  });

  return drinks;
}


interface GlobalsVenue {
  identifier: number | null;
  is_closed: number;
}

interface Globals {
  venues: GlobalsVenue[];
}

export async function getOpenPubs(): Promise<Pub[]> {
  const pubs: Pub[] = [];

  // Fetch globals.json
  const globals: Globals = await (await fetch('https://oandp-appmgr-prod.s3.eu-west-2.amazonaws.com/global.json')).json();

  console.log(globals)

  const open = new Set<string>();
  for (const venue of globals.venues) {
    console.log(venue)
    if (venue.is_closed === 0 && venue.identifier != null) {
      open.add(venue.identifier.toString());
    }
  }

  const resBody = await wetherspoonRequest(
    {
      method: 'venues'
    }
  );

  for (const venue of resBody.venues) {
    if (venue?.salesArea?.[0]?.canPlaceOrder && open.has(venue.venueRef)) {
      pubs.push(venue)
    }
  }
  return pubs;
}
