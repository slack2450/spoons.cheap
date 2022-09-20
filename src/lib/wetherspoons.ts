import axios from 'axios';
import { Drink } from '../types/Drink';
import { Pub } from '../types/Pub';

const axiosInstance = axios.create({
  baseURL: 'https://static.wsstack.nn4maws.net',
});

export async function getTodaysDrinks(venueId: string): Promise<Drink[]> {
  const res = await axiosInstance.get(`/content/v3/menus/${venueId}.json`);

  let drinksMenu;
  for (const menu of res.data.menus) {
    if (menu.name === 'Drinks') {
      drinksMenu = menu;
      break;
    }
  }

  const drinks: Drink[] = [];

  for (const drinkCategory of drinksMenu.subMenu) {
    for (const productGroup of drinkCategory.productGroups) {
      for (const product of productGroup.products) {
        const regex = /ABV, (...) unit/;
        const matches = product.description.match(regex);

        if (matches && matches.length > 0) {
          let shouldContinue = false;
          for (const existing of drinks) {
            if (existing.name === product.displayName) shouldContinue = true;
          }

          if (shouldContinue) continue;

          const units: number = parseFloat(matches[1]);

          const drink: Drink = {
            name: product.displayName,
            productId: product.productId,
            price: product.priceValue,
            units,
            ppu: product.priceValue / units,
          };

          drinks.push(drink);
        }
      }
    }
  }

  drinks.sort((a, b) => {
    return a.ppu - b.ppu;
  });

  return drinks;
}

export async function getOpenPubs(): Promise<Pub[]> {
  const pubs: Pub[] = [];
  const res = await axiosInstance.get('/v1/venues/en_gb/venues.json');
  for (let i = 0; i < res.data.venues.length; i++) {
    const venue = res.data.venues[i];
    if (venue.pubIsClosed || venue.pubIsTempClosed) {
      res.data.venues.splice(venue, 1);
      console.log(`${venue.name} is closed ☹ Removing from list`);
      continue;
    }
    pubs.push(venue);
  }
  return pubs;
}
