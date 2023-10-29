export enum ProductCategories {
  wheat,
  flour,
  bread,
}

export interface Product {
  category: ProductCategories;
  batchId: number;
  ean?: string;
  unit?: string;
  Ingredients?: this[];
}

// export interface Waypoint {
//   nodeName: string;
//   nodeUrl: string;
// }

// export interface ShipmentInput {
//   route: string[];
//   products: Product[];
// }
