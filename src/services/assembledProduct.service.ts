import api from "@/src/utils/api";
import {
  AssembledProductItem,
  AssembledProductListData,
  CreateAssembledProductPayload,
  UpdateAssembledProductPayload,
} from "@/src/types/assembledProduct.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string | null;
}

export const assembledProductService = {
  /**
   * Get assembled products for current shop.
   * GET /AssembledProduct
   */
  getAssembledProducts: async (page: number = 1, pageSize: number = 50) => {
    return api.get<unknown, ApiResponse<AssembledProductListData>>(
      `/AssembledProduct?CurrentPage=${page}&PageSize=${pageSize}`,
    );
  },

  /**
   * Get assembled product detail by ID.
   * GET /AssembledProduct/{id}
   */
  getAssembledProductDetail: async (id: string) => {
    return api.get<unknown, ApiResponse<AssembledProductItem>>(
      `/AssembledProduct/${id}`,
    );
  },

  /**
   * Create assembled product (JSON body).
   * POST /AssembledProduct
   */
  createAssembledProduct: async (payload: CreateAssembledProductPayload) => {
    return api.post<unknown, ApiResponse<string>>(`/AssembledProduct`, payload);
  },

  /**
   * Update assembled product (JSON body).
   * PUT /AssembledProduct/{id}
   */
  updateAssembledProduct: async (payload: UpdateAssembledProductPayload) => {
    const { id, ...body } = payload;
    return api.put<unknown, ApiResponse<null>>(`/AssembledProduct/${id}`, body);
  },

  /**
   * Delete assembled product by ID.
   * DELETE /AssembledProduct/{id}
   */
  deleteAssembledProduct: async (id: string) => {
    return api.delete<unknown, ApiResponse<null>>(`/AssembledProduct/${id}`);
  },

  /**
   * Restore a soft-deleted assembled product.
   * POST /AssembledProduct/restore/{id}
   */
  restoreAssembledProduct: async (id: string) => {
    return api.post<unknown, ApiResponse<null>>(
      `/AssembledProduct/restore/${id}`,
    );
  },
};
