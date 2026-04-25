import api from "@/src/utils/api";
import {
  PartItem,
  PartListData,
  CreatePartPayload,
  CreatePartResponse,
  UpdatePartPayload,
  CheckStockPayload,
  CheckStockData,
} from "@/src/types/part.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string | null;
}

export const partService = {
  /**
   * Get parts for a shop.
   * GET /parts?ShopId={shopId}&PageNumber={pageNumber}&PageSize={pageSize}
   */
  getParts: async (
    shopId: string,
    pageNumber: number = 1,
    pageSize: number = 1000,
  ) => {
    return api.get<any, ApiResponse<PartListData>>(
      `/parts?ShopId=${shopId}&PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );
  },
  /**
   * Create part (multipart/form-data).
   * - JSON.stringify specifications before sending
   * - Only append images if present
   */
  createPart: async (payload: CreatePartPayload) => {
    const formData = new FormData();
    formData.append("Name", payload.name);
    formData.append("PartType", payload.partType);
    formData.append("Price", String(payload.price));
    formData.append("StockQuantity", String(payload.stockQuantity));
    formData.append("Description", payload.description);
    if (payload.recipeSwitchCount != null) {
      formData.append("RecipeSwitchCount", String(payload.recipeSwitchCount));
    }
    if (payload.recipeStabilizerCount != null) {
      formData.append(
        "RecipeStabilizerCount",
        String(payload.recipeStabilizerCount),
      );
    }
    formData.append("CategoryId", payload.categoryId);
    if (payload.specifications) {
      formData.append("Specifications", JSON.stringify(payload.specifications));
    }
    if (payload.thumbnailImage) {
      formData.append("ThumbnailImage", payload.thumbnailImage);
    }
    if (payload.layerImage) {
      formData.append("LayerImage", payload.layerImage);
    }
    if (payload.isAddonEligible != null) {
      formData.append("IsAddonEligible", String(payload.isAddonEligible));
    }
    return api.post<any, ApiResponse<CreatePartResponse>>(`/parts`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Get part detail by slug.
   * GET /parts/detail/{slug}
   */
  getPartDetail: async (slug: string) => {
    return api.get<any, ApiResponse<PartItem>>(`/parts/detail/${slug}`);
  },

  /**
   * Update part (multipart/form-data via PUT).
   * PUT /parts/{id}
   * All fields are sent; empty string for fields with no value.
   * Specifications is JSON.stringify()-ed if present.
   * Images are only appended when a real File is provided.
   */
  updatePart: async (payload: UpdatePartPayload) => {
    const formData = new FormData();
    formData.append("Name", payload.name);
    formData.append("PartType", payload.partType);
    formData.append("Price", String(payload.price));
    formData.append("StockQuantity", String(payload.stockQuantity));
    formData.append("Description", payload.description || "");
    formData.append("CategoryId", payload.categoryId);
    formData.append(
      "RecipeSwitchCount",
      payload.recipeSwitchCount != null
        ? String(payload.recipeSwitchCount)
        : "",
    );
    formData.append(
      "RecipeStabilizerCount",
      payload.recipeStabilizerCount != null
        ? String(payload.recipeStabilizerCount)
        : "",
    );
    formData.append(
      "Specifications",
      payload.specifications ? JSON.stringify(payload.specifications) : "",
    );

    // Images – only append real File, otherwise send empty
    if (payload.thumbnailImage instanceof File) {
      formData.append("ThumbnailImage", payload.thumbnailImage);
    } else {
      formData.append("ThumbnailImage", "");
    }
    if (payload.layerImage instanceof File) {
      formData.append("LayerImage", payload.layerImage);
    } else {
      formData.append("LayerImage", "");
    }
    if (payload.isAddonEligible != null) {
      formData.append("IsAddonEligible", String(payload.isAddonEligible));
    }

    return api.put<any, ApiResponse<null>>(`/parts/${payload.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Delete part by ID.
   * DELETE /parts/{id}
   */
  deletePart: async (id: string) => {
    return api.delete<any, ApiResponse<null>>(`/parts/${id}`);
  },

  /**
   * Restore a soft-deleted part by ID.
   * PATCH /parts/{id}/restore
   */
  restorePart: async (id: string) => {
    return api.patch<unknown, ApiResponse<null>>(`/parts/${id}/restore`);
  },

  /**
   * Check available inventory for given product IDs.
   * POST /parts/check-stock
   */
  checkStock: async (payload: CheckStockPayload) => {
    return api.post<any, ApiResponse<CheckStockData>>(
      `/parts/check-stock`,
      payload,
    );
  },

  /**
   * Get existing configuration/rules for a Kit
   * GET /api/v1/Builder/config/{baseKitId}
   */
  getKitConfig: async (baseKitId: string) => {
    return api.get<any, ApiResponse<any>>(`/Builder/config/${baseKitId}`);
  },

  /**
   * Upload a single layer image for a builder option.
   * POST /api/v1/Builder/options/upload-layer  (multipart/form-data)
   * Returns { success: true, data: { url: "..." } } OR { success: true, data: "..." }
   */
  uploadLayerImage: async (file: File | Blob) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<any, ApiResponse<{ url: string } | string>>(
      `/Builder/options/upload-layer`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 30_000 },
    );
  },

  /**
   * Batch-save all builder options for a kit in a single transactional call.
   * POST /api/v1/Builder/options/batch  (application/json)
   * Uses a replace-all strategy — the payload array replaces every existing option.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  batchSaveBuilderOptions: async (payload: any[]) => {
    return api.post<any, ApiResponse<null>>(`/Builder/options/batch`, payload);
  },
};
