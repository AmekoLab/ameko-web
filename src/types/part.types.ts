export type PartType = "kit" | "accessory" | "component";

/** Status mapping: 1 = Active, 0 = Inactive (adjust as needed) */
export type PartStatus = 0 | 1;

export interface PartItem {
  id: string;
  name: string;
  slug: string;
  partType: PartType;
  price: number;
  stockQuantity: number;
  status: PartStatus;
  thumbnailUrl: string | null;
  defaultLayerImageUrl: string | null;
  description: string | null;
  specifications: string | null;
  recipeSwitchCount: number;
  recipeStabilizerCount: number;
  shopId: string;
  shopName: string;
  categoryName: string;
  isAddonEligible: boolean;
}

export interface PartListData {
  data: PartItem[];
  total: number;
}

export interface PartListResponse {
  success: boolean;
  message: string;
  data: PartListData;
  errors: string | null;
}

// --- Specifications sub-types (for Kit) ---
export interface PartRecipe {
  switch: number;
  stabilizer: number;
}

export interface PartWorkflowStep {
  step: string;
  title: string;
  quantity: number;
}

export interface PartSpecifications {
  recipe: PartRecipe;
  workflow: PartWorkflowStep[];
}

// --- Create Part ---
export interface CreatePartPayload {
  name: string;
  partType: PartType;
  price: number;
  stockQuantity: number;
  description: string;
  categoryId: string;
  specifications?: PartSpecifications | null;
  recipeSwitchCount?: number;
  recipeStabilizerCount?: number;
  thumbnailImage?: File | null;
  layerImage?: File | null;
  isAddonEligible?: boolean;
}

export interface CreatePartResponse {
  success: boolean;
  message: string;
  data: {
    data: PartItem[];
  };
  errors: string | null;
}

// --- Check Stock ---
export interface CheckStockPayload {
  productIds: string[];
}

/** Map of productId → available stock quantity */
export type CheckStockData = Record<string, number>;

// --- Update Part ---
export interface UpdatePartPayload {
  id: string;
  name: string;
  partType: PartType;
  price: number;
  stockQuantity: number;
  description: string;
  categoryId: string;
  specifications?: PartSpecifications | null;
  recipeSwitchCount?: number;
  recipeStabilizerCount?: number;
  thumbnailImage?: File | null;
  layerImage?: File | null;
  isAddonEligible?: boolean;
}
