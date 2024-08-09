import axios from 'axios';
import { Drink } from '../types/Drink';
import { Pub } from '../types/Pub';

const axiosInstance = axios.create({
  baseURL: 'https://api.spoons.cheap/v1/proxy',
});

export async function getTodaysDrinks(venueId: number, salesAreaId: number): Promise<Drink[]> {

  const getMenusForm = new FormData();
  getMenusForm.append(
    "request",
    JSON.stringify(
      {
        "request":
        {
          "platform": "nintendo-ds",
          "bundleIdentifier": "com.stella.enjoyers",
          "userDeviceIdentifier": "i-love-drinking-beer",
          "version": "1.0.0",
          "method": "getMenus",
          "siteId": venueId,
          "salesAreaId": salesAreaId,
        }
      }
    )
  );

  const menusRes = await fetch("https://zc.ca.jdw-apps.net/api/iorder", {
    "headers": {
      "x-api-key": "SH0obBv23pj7lUrg5SESDdJO8fS9p0ND",
    },
    body: getMenusForm,
    "method": "POST"
  });

  const menusData = await menusRes.json();

  let menuId;
  for (const menu of menusData.menus) {
    if (menu.name === 'Drinks') {
      menuId = menu.id;
      break;
    }
  }

  const requestData = new FormData();
  requestData.append(
    "request",
    JSON.stringify(
      {
        "request":
        {
          "platform": "nintendo-ds",
          "bundleIdentifier": "com.stella.enjoyers",
          "userDeviceIdentifier": "i-love-drinking-beer",
          "version": "1.0.0",
          "method": "getMenuPages",
          "siteId": venueId,
          "menuId": menuId,
          "salesAreaId": salesAreaId
        }
      }
    )
  );

  const response = await fetch("https://zc.ca.jdw-apps.net/api/iorder", {
    "headers": {
      "x-api-key": "SH0obBv23pj7lUrg5SESDdJO8fS9p0ND",
    },
    body: requestData,
    "method": "POST"
  });

  const res = await response.json()

  const drinks: Drink[] = [];

  for (const product of res.aztec.products) {
    console.log(product.eposName);

    const beerMatches = product.displayRecords?.[0]?.description.match(/(\d?\.?\d?\d) unit/);
    const wineMatches = product.displayRecords?.[0]?.description.match(/(\d?\d?\.?\d?\d%) ABV/);

    if (beerMatches && beerMatches.length > 0) {

      const units: number = parseFloat(beerMatches[1]);

      if (product.portions.length == 0) continue;

      const price = product.portions[0]?.price;

      const drink: Drink = {
        name: product.eposName,
        productId: product.id,
        price: price,
        units,
        ppu: price / units,
      };

      drinks.push(drink);
    } else if (wineMatches && wineMatches.length > 0) {

      let volume = 0;
      let price = 0;
      for (const portion of product.portions) {
        const match = portion.name.match(/(\d?\d\d)ml/);
        if (!match) continue;
        const portionSize = parseFloat(match[1]);
        if (portionSize > volume) {
          volume = portionSize;
          price = portion.price;
        }
      }

      const percentage = parseFloat(wineMatches[1]);

      if (volume > 0) {

        const units = (percentage * volume) / 1000;

        const drink: Drink = {
          name: product.eposName,
          productId: product.id,
          price: price,
          units,
          ppu: price / units,
        }

        drinks.push(drink);
      } else {

        if (product.defaultPortionName) {
          const volume = product.defaultPortionName.match(/(\d?\d\d)ml/);

          if (!volume) {
            console.log(product);
            continue;
          }

          const units = (percentage * parseFloat(volume[1])) / 1000;

          const price = parseFloat(product.displayPrice.slice(1));

          const drink: Drink = {
            name: product.eposName,
            productId: product.id,
            price: price,
            units,
            ppu: price / units,
          }

          drinks.push(drink);
        } else {
          const volume = 175;

          const units = (percentage * volume) / 1000;

          const drink: Drink = {
            name: product.eposName,
            productId: product.id,
            price: product.priceValue,
            units,
            ppu: product.priceValue / units,
          }

          drinks.push(drink);
        }
      }
    }
  }

  console.log(drinks);

  drinks.sort((a, b) => {
    return a.ppu - b.ppu;
  });

  return drinks;
}

export async function getOpenPubs(): Promise<Pub[]> {
  const pubs: Pub[] = [];

  const requestData = new FormData();
  requestData.append(
    "request",
    JSON.stringify(
      {
        "request":
        {
          "platform": "nintendo-ds",
          "bundleIdentifier": "com.stella.enjoyers",
          "userDeviceIdentifier": "i-love-drinking-beer",
          "version": "1.0.0",
          "method": "venues",
        }
      }
    )
  );

  const res = await fetch("https://zc.ca.jdw-apps.net/api/iorder", {
    "headers": {
      "x-api-key": "SH0obBv23pj7lUrg5SESDdJO8fS9p0ND",
    },
    body: requestData,
    "method": "POST"
  });

  const resBody = await res.json();

  for (const venue of resBody.venues) {
    if (venue?.salesArea?.[0]?.canPlaceOrder) {
      pubs.push(venue)
    }
  }
  return pubs;
}
