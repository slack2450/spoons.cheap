export interface Drink {
    name: string;
    units: number;
    productId: number;
    price: number;
    ppu: number;
  }
  
  export interface DrinksOnDate {
    date: number;
    drinks: Drink[];
  }
  
