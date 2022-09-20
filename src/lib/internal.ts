import axios from 'axios';
import { DrinksOnDate } from '../types/Drink';
import { Ranking } from '../types/Ranking';

const axiosInstance = axios.create({
  baseURL: 'https://api.spoons.cheap',
});
export async function getHistoricalDrinks(
  venueId: string
): Promise<DrinksOnDate[]> {
  const res = await axiosInstance.get(`/v1/price/${venueId}`);

  // Calculate price per unit
  for (const date of res.data) {
    for (const drink of date.drinks) {
      drink.ppu = drink.price / drink.units;
    }
  }

  return res.data;
}

export async function getRankings(): Promise<Ranking[]> {
  const res = await axiosInstance.get('/v1/rankings');
  return res.data;
}
