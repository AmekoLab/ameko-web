export type ProductStatus =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "PRE_ORDER"
  | "GROUP_BUY";

export interface ProductAccessory {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface ProductSoundTest {
  videoUrl: string;
  description: string;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  value: string;
  priceModifier?: number;
  image?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  type: "color" | "button" | "select";
  values: ProductOptionValue[];
}

export interface ProductSpecs {
  layout: string;
  mounting: string;
  pcb: string;
  connection: string;
  battery?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  status: ProductStatus;
  shortDesc: string;
  description?: string;
  images: string[];
  options: ProductOption[];
  specs: ProductSpecs;

  boughtTogether?: ProductAccessory[];
  soundTest?: ProductSoundTest;

  relatedProducts?: Product[];
}

export interface CartItemInput {
  productId: string;
  quantity: number;
  selectedOptions: Record<string, ProductOptionValue>;
  finalPrice: number;
}
