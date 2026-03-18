import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import { CartData } from "@/src/types/order.types";

export const shopOrderService = {
  /**
   * Fetch shop orders with pagination.
   * GET /orders/shop?page={page}&size={size}
   */
  getShopOrders: async (page: number = 1, size: number = 10): Promise<ApiResponse<CartData[]>> => {
    return api.get(`/orders/shop?page=${page}&size=${size}`);
  },

  /**
   * Fetch details for a specific shop order.
   * GET /orders/shop/{orderId}
   */
  getShopOrderDetail: async (orderId: string): Promise<ApiResponse<CartData>> => {
    return api.get(`/orders/shop/${orderId}`);
  },
};
