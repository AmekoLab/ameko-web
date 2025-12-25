export interface Category {
  id: number;
  name: string;
  slug: string;
  stepOrder?: number;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  thumbnailUrl: string;
  layerImageUrl: string;

  attributes: Record<string, string | number | boolean>;
  categoryId: number;
  category?: Category;

  _tempSlug?: string;
}

export interface BuilderSession {
  id: string;
  selection: Record<string, number>;
  totalPrice: string;
}

export interface NextStep {
  step: Category;
  products: Product[];
}

export interface BuilderResponse {
  session: BuilderSession;
  nextStep: NextStep | null;
  selectedDetails?: Product[];
}
