export enum ProductCategories {
  wheat,
  flour,
  bread,
}

export interface Product {
  category: ProductCategories;
  batchId: number;
  type?: string;
  qualityGrade?: string;
  certificates?: string[];
  ecoCertified: boolean;
  productionMethod?: string;
  ean?: string;
  unit?: string;
  amount?: number;
  ingredients?: this[];
  qrCode?: string;
}
