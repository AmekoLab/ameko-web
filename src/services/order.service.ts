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
} from "@/src/types/order.types";

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
   * Fetch user's orders (excluding InCart).
   * GET /orders/my-orders
   */
  getMyOrders: async (): Promise<ApiResponse<CartData[]>> => {
    return api.get("/orders/my-orders");
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
   * Generate a new Stripe payment link for an order.
   * POST /orders/repay/{orderGroupId}
   */
  repayOrder: async (
    orderGroupId: string,
  ): Promise<ApiResponse<{ paymentUrl: string }>> => {
    return api.post(`/orders/repay/${orderGroupId}`);
  },

  /**
   * Fetch user's payment / order history.
   * GET /orders/my-payment-history
   */
  getMyPaymentHistory: async (): Promise<ApiResponse<OrderGroup[]>> => {
    return api.get("/orders/my-payment-history");
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
};
