import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import { CartData } from "@/src/types/order.types";

// Map string status to backend integer enum
const OrderStatusMap: Record<string, number> = {
  Pending: 0,
  InCart: 1,
  Processing: 2,
  Shipped: 3,
  Completed: 4,
  Cancelled: 5,
  Returning: 6,
  Returned: 7,
  Refunded: 8
};

export interface GetShopOrdersParams {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}

export const shopOrderService = {
  /**
   * Fetch shop orders with pagination and server-side filters.
   * GET /orders/shop
   */
  getShopOrders: async (params: GetShopOrdersParams): Promise<ApiResponse<any>> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.size) query.append('size', params.size.toString());
    
    // Map string status to integer enum
    if (params.status && params.status !== 'All') {
      const mappedStatus = OrderStatusMap[params.status];
      if (mappedStatus !== undefined) {
        query.append('status', mappedStatus.toString());
      }
    }
    
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    return api.get(`/orders/shop${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Fetch details for a specific shop order.
   * GET /orders/shop/{orderId}
   */
  getShopOrderDetail: async (orderId: string): Promise<ApiResponse<CartData>> => {
    return api.get(`/orders/shop/${orderId}`);
  },

  updateOrderStatus: async (orderId: string, status: number, expectedDeliveryDate?: string): Promise<ApiResponse<null>> => {
    return api.put(`/orders/shop/${orderId}/status`, { status, expectedDeliveryDate }, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  /**
   * Shop cancels a customer order.
   * POST /orders/shop/{orderId}/cancel
   */
  shopCancelOrder: async (
    orderId: string,
    reason: string,
  ): Promise<ApiResponse<null>> => {
    // Map 'reason' to 'cancelReason' as expected by the new backend API
    return api.post(`/orders/shop/${orderId}/cancel`, { cancelReason: reason });
  },
};
