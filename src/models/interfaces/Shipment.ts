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

// export interface ShipmentInput {
//   route: string[];
//   products: Product[];
// }
