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
   * Search assembled products with optional filters.
   * GET /AssembledProduct/search
   */
  searchProducts: async (params: { searchTerm?: string; pageNumber?: number; pageSize?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/AssembledProduct/search?${queryString}` : '/AssembledProduct/search';

    return api.get<unknown, ApiResponse<AssembledProductListData>>(url);
  },

  /**
   * Get my assembled products (automatically filters by logged-in shop token).
   * GET /AssembledProduct/my-products
   */
  getMyAssembledProducts: async () => {
    return api.get<unknown, ApiResponse<AssembledProductItem[]>>(
      `/AssembledProduct/my-products`,
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

  /**
   * Get assembled products by shop ID (public).
   * GET /AssembledProduct/shop/{shopId}
   * Returns a flat array, not paginated.
   */
  getAssembledProductsByShop: async (
    shopId: string,
    page: number = 1,
    pageSize: number = 50,
  ) => {
    return api.get<unknown, ApiResponse<AssembledProductItem[]>>(
      `/AssembledProduct/shop/${shopId}?CurrentPage=${page}&PageSize=${pageSize}`,
    );
  },
};
