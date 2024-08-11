export interface Pub {
    id: number;
    name: string;
    address: Address;
    salesArea: SalesArea[];
  }
  
  interface Address {
    town: string,
    county: string;
    country: Country;
  }
  
  interface Country {
    name: string;
  }
  
  interface SalesArea {
    id: number;
  }
