// --- Category Management Types ---

export type CategoryType = "global" | "private";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  thumbnailURL: string | null;
  parentId: string | null;
  isActive: boolean;
  subCategoryCount: number;
  partCount: number;
  shopId: string | null;
  categoryType: CategoryType;
}

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: CategoryItem[];
  errors: string | null;
}

// --- Create Category ---
export interface CreateCategoryPayload {
  name: string;
  parentId: string | null;
  isActive: boolean;
  thumbnailImage: File | null;
}

export interface CreateCategoryResponse {
  id: string;
  name: string;
  slug: string;
  thumbnailURL: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subCategories: CategoryItem[] | null;
  shopId: string | null;
  categoryType: CategoryType;
}

// --- Update Category ---
export interface UpdateCategoryPayload {
  id: string;
  name: string;
  parentId: string | null;
  isActive: boolean;
  thumbnailImage: File | null;
}
