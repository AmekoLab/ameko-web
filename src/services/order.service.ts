import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  CartData,
  AddToCartPayload,
  CheckoutPayload,
  CheckoutResponseData,
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
   * Submit checkout — collects shipping info and initiates Stripe payment.
   * POST /orders/checkout
   */
  checkout: async (
    payload: CheckoutPayload,
  ): Promise<ApiResponse<CheckoutResponseData>> => {
    return api.post("/orders/checkout", payload);
  },
};
