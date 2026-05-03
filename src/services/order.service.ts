import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  CartData,
  AddToCartPayload,
  CheckoutPayload,
  CheckoutResponseData,
  OrderGroup,
  CalculatePreviewPayload,
  CartPreviewData,
  UpdateShippingAddressPayload,
  GetMyOrdersParams,
  GetMyPaymentHistoryParams,
  PaginatedResult,
} from "@/src/types/order.types";

export interface RepayOrderPayload {
  paymentMethod: number;
  walletPin?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const orderService = {
  /**
   * Add an item to the cart.
   * POST /orders/cart
   */
  addToCart: async (payload: AddToCartPayload): Promise<ApiResponse<null>> => {
    return api.post("/orders/cart", payload);
  },

  /**
   * Fetch the current cart.
   * GET /orders/cart
   */
  getCart: async (): Promise<ApiResponse<CartData>> => {
    return api.get("/orders/cart");
  },

  /**
   * Remove an item from the cart.
   * DELETE /orders/cart/:orderItemId
   */
  deleteCartItem: async (orderItemId: string): Promise<ApiResponse<null>> => {
    return api.delete(`/orders/cart/${orderItemId}`);
  },

  /**
   * Fetch user's orders (paginated).
   * GET /orders/my-orders
   */
  getMyOrders: async (params?: GetMyOrdersParams): Promise<ApiResponse<PaginatedResult<CartData>>> => {
    // Construct query string
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.size) query.append('size', params.size.toString());
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.shopName) query.append('shopName', params.shopName);
    if (params?.fromDate) query.append('fromDate', params.fromDate);
    if (params?.toDate) query.append('toDate', params.toDate);

    const queryString = query.toString();
    return api.get(`/orders/my-orders${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Update the quantity of a cart item.
   * PUT /orders/cart/:orderItemId
   */
  updateCartItemQuantity: async (
    orderItemId: string,
    quantity: number,
  ): Promise<ApiResponse<null>> => {
    return api.put(`/orders/cart/${orderItemId}`, { quantity });
  },

  /**
   * Submit checkout — collects shipping info and initiates Stripe payment.
   * POST /orders/checkout
   */
  checkout: async (
    payload: CheckoutPayload,
  ): Promise<ApiResponse<CheckoutResponseData>> => {
    return api.post("/orders/checkout", payload);
  },

  /**
   * Repay an order group.
   * POST /orders/{orderGroupId}/repay
   */
 repayOrder: async (
    orderGroupId: string,
    payload: RepayOrderPayload
  ): Promise<ApiResponse<{ paymentUrl?: string }>> => {
    return api.post(`/orders/repay/${orderGroupId}`, payload);
  },

  /**
   * Fetch user's payment / order history (paginated).
   * GET /orders/my-payment-history
   */
  getMyPaymentHistory: async (params?: GetMyPaymentHistoryParams): Promise<ApiResponse<any>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.size) query.append('size', params.size.toString());
    if (params?.paymentStatus && params.paymentStatus !== 'all') query.append('paymentStatus', params.paymentStatus);
    if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params?.fromDate) query.append('fromDate', params.fromDate);
    if (params?.toDate) query.append('toDate', params.toDate);

    const queryString = query.toString();
    return api.get(`/orders/my-payment-history${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Calculate cart preview (subtotal, shipping, discounts) without persisting.
   * POST /orders/calculate-preview
   */
  calculateCartPreview: async (
    payload: CalculatePreviewPayload,
  ): Promise<ApiResponse<CartPreviewData>> => {
    return api.post("/orders/calculate-preview", payload);
  },

  /**
   * Fetch details for a specific order.
   * GET /orders/{orderId}
   */
  getOrderDetail: async (orderId: string): Promise<ApiResponse<CartData>> => {
    return api.get(`/orders/${orderId}`);
  },

  /**
   * Update shipping address for a Processing order.
   * PUT /orders/{orderId}/shipping-address
   */
  updateShippingAddress: async (
    orderId: string,
    payload: UpdateShippingAddressPayload,
  ): Promise<ApiResponse<null>> => {
    return api.put(`/orders/${orderId}/shipping-address`, payload);
  },

  /**
   * Download the invoice PDF for an order.
   * GET /api/v1/invoices/orders/{orderId}
   */
  downloadInvoicePDF: async (orderId: string): Promise<Blob> => {
    const response: any = await api.get(`/invoices/orders/${orderId}`, {
      responseType: "blob",
    });
    return response.data || response;
  },
};
