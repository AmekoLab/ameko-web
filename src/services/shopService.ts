import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  AdminShopListResponse,
  ApproveShopPayload,
  ShopPublicProfile,
  ShopResponse,
  ShopListParams,
  ShopListResponse,
} from "@/src/types/shop.types";
import { deactivateShop } from "../store/slices/shopSlice";

export const shopService = {
  registerShop: async (formData: FormData) => {
    return api.post<any, ApiResponse<ShopResponse>>(
      "/shops/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },

  getMyShop: async () => {
    return api.get<any, ApiResponse<ShopResponse>>("/shops/my-shop");
  },

  approveShop: async (data: ApproveShopPayload) => {
    return api.post<any, ApiResponse<any>>(
      `/shops/admin/${data.shopId}/approve`,
      {
        status: data.status,
        adminNote: data.adminNote,
      },
    );
  },

  getAdminShopList: async (page = 1, size = 20) => {
    // Truyền query params page và size
    return api.get<any, ApiResponse<AdminShopListResponse>>(
      `/shops/admin/list?page=${page}&size=${size}`,
    );
  },

  updateShopProfile: async (formData: FormData) => {
    return api.put<any, ApiResponse<null>>("/shops/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  patchShopProfile: async (formData: FormData) => {
    return api.patch<any, ApiResponse<null>>("/shops/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getShopById: async (shopId: string) => {
    return api.get<any, ApiResponse<ShopPublicProfile>>(`/shops/${shopId}`);
  },

  banShop: async (shopId: string) => {
    return api.post<any, ApiResponse<null>>(`/shops/admin/${shopId}/ban`);
  },

  unbanShop: async (shopId: string) => {
    return api.patch<any, ApiResponse<null>>(`/shops/admin/${shopId}/unban`);
  },

  deactivate: async () => {
    return api.put<any, ApiResponse<null>>("/shops/deactivate");
  },

  reactivate: async () => {
    return api.put<any, ApiResponse<null>>("/shops/reactivate");
  },

  /**
   * Public: Fetch paginated shop list with optional search.
   * GET /shops
   */
  getShops: async (params: ShopListParams): Promise<ShopListResponse> => {
    return api.get<unknown, ShopListResponse>("/shops", { params });
  },

};
