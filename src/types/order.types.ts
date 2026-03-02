// ============================================================
// Order / Cart / Checkout Types
// ============================================================

/** A component inside a custom-built order item */
export interface OrderItemComponent {
  partId: string;
  partName: string;
  partPriceSnapshot: number;
  partImageUrl: string;
  quantity: number;
  note: string | null;
}

/** A single item in the cart / order */
export interface OrderItem {
  id: string;
  productId: string;
  assembledProductId: string | null;
  productName: string;
  productImage: string | null;
  shopId: string;
  shopName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom: boolean;
  note: string | null;
  customComponentIds: string[];
  orderItemComponents: OrderItemComponent[];
}

/** Cart data returned by GET /orders/cart */
export interface CartData {
  id: string;
  orderGroupId: string;
  shopId: string;
  shopName: string;
  shopAvatar: string | null;
  orderStatus: string;
  paymentStatus: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  note: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

/** Payload for POST /orders/cart (Add to Cart) */
export interface AddToCartPayload {
  quantity: number;
  isCustom: boolean;
  builderSessionId: string;
}

/** Payload for POST /orders/checkout */
export interface CheckoutPayload {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  note: string;
  successUrl: string;
  cancelUrl: string;
  selectedOrderItemIds: string[];
}

/** Response data from POST /orders/checkout */
export interface CheckoutResponseData {
  orderGroupId: string;
  totalAmount: number;
  paymentUrl: string;
}
