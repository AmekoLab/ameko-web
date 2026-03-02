import api from "@/src/utils/api";
import {
  CategoryItem,
  CreateCategoryPayload,
  CreateCategoryResponse,
  UpdateCategoryPayload,
} from "@/src/types/category.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string | null;
}

export const categoryService = {
  /**
   * Get categories.
   * - Admin (no shopId): returns global categories only
   * - Shop (with shopId): returns global + shop's private categories
   */
  getCategories: async (shopId?: string) => {
    const params = shopId ? `?ShopId=${shopId}` : "";
    return api.get<any, ApiResponse<CategoryItem[]>>(
      `/catalog/categories${params}`,
    );
  },

  /**
   * Create category (multipart/form-data).
   * - Admin creates global categories
   * - Shop creates private categories
   */
  createCategory: async (payload: CreateCategoryPayload) => {
    const formData = new FormData();
    formData.append("Name", payload.name);
    if (payload.parentId) {
      formData.append("ParentId", payload.parentId);
    }
    formData.append("IsActive", String(payload.isActive));
    if (payload.thumbnailImage) {
      formData.append("ThumbnailImage", payload.thumbnailImage);
    }
    return api.post<any, ApiResponse<CreateCategoryResponse>>(
      `/catalog/categories`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  /**
   * Delete category (soft delete).
   * - Admin: deletes global categories
   * - Shop: deletes own private categories (enforced via token)
   */
  deleteCategory: async (id: string) => {
    return api.delete<any, ApiResponse<string>>(`/catalog/categories/${id}`);
  },

  /**
   * Update category (multipart/form-data via PATCH).
   */
  updateCategory: async (payload: UpdateCategoryPayload) => {
    const formData = new FormData();
    formData.append("Name", payload.name);
    if (payload.parentId) {
      formData.append("ParentId", payload.parentId);
    }
    formData.append("IsActive", String(payload.isActive));
    if (payload.thumbnailImage) {
      formData.append("ThumbnailImage", payload.thumbnailImage);
    }
    return api.patch<any, ApiResponse<CreateCategoryResponse>>(
      `/catalog/categories/${payload.id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
};
