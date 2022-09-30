import axios from 'axios';
import { Drink } from '../types/Drink';
import { Pub } from '../types/Pub';

const axiosInstance = axios.create({
  baseURL: 'https://static.wsstack.nn4maws.net',
});

export async function getTodaysDrinks(venueId: number): Promise<Drink[]> {
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
        const beerMatches = product.description.match(/(\d?\.?\d?\d) unit/);
        const wineMatches = product.description.match(/(\d?\d?\.?\d?\d%) ABV/);

        let shouldContinue = false;
        for (const existing of drinks) {
          if (existing.productId === product.productId) shouldContinue = true;
        }

        if (shouldContinue) continue;


        if (product.productId == 10000143825) {
          console.log(product);
          console.log(beerMatches);
          console.log(wineMatches)
        }

        if (beerMatches && beerMatches.length > 0) {


          const units: number = parseFloat(beerMatches[1]);

          const drink: Drink = {
            name: product.displayName,
            productId: product.productId,
            price: product.priceValue,
            units,
            ppu: product.priceValue / units,
          };

          drinks.push(drink);
        } else if (wineMatches && wineMatches.length > 0) {

          const descriptionVol = product.description.match(/(\d?\d\d)ml/);

          const percentage = parseFloat(wineMatches[1]);

          if (product.productId == 10000143825)
            console.log(descriptionVol);

          if (descriptionVol && descriptionVol.length > 0) {

            if (product.productId == 10000143825)
              console.log(descriptionVol);

            const units = (percentage * parseFloat(descriptionVol[1])) / 1000;

            const drink: Drink = {
              name: product.displayName,
              productId: product.productId,
              price: product.priceValue,
              units,
              ppu: product.priceValue / units,
            }

            drinks.push(drink);
          } else {
            if (product.defaultPortionName) {
              const volume = product.defaultPortionName.match(/(\d?\d\d)ml/);

              const units = (percentage * parseFloat(volume[1])) / 1000;

              const drink: Drink = {
                name: product.displayName,
                productId: product.productId,
                price: product.priceValue,
                units,
                ppu: product.priceValue / units,
              }

              drinks.push(drink);
            } else {
              const volume = 175;

              const units = (percentage * volume) / 1000;

              const drink: Drink = {
                name: product.displayName,
                productId: product.productId,
                price: product.priceValue,
                units,
                ppu: product.priceValue / units,
              }

              drinks.push(drink);
            }
          }
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
      continue;
    }
    pubs.push(venue);
  }
  return pubs;
}
