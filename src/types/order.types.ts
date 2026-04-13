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
  orderItemId: string;
  productId: string;
  assembledProductId: string | null;
  productName: string;
  productImage: string | null;
  shopId: string;
  shopName: string | null;
  // systemDiscountAmount?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom: boolean;
  // expectedDeliveryDate?: string | null;
  note: string | null;
  customComponentIds: string[];
  orderItemComponents: OrderItemComponent[];
}

/** Cart data returned by GET /orders/cart */
export interface CartData {
  orderId: string;
  orderGroupId: string;
  shopId: string;
  shopName: string;
  shopAvatar: string | null;
  orderStatus: string;
  paymentStatus: string;
  subTotal: number;
  hasCancelRequest?: boolean;
  shippingFee: number;
  systemDiscountAmount?: number;
  discountAmount: number;
  totalAmount: number;
  receiverName: string;
  expectedDeliveryDate?: string | null;
  receiverPhone: string;
  shippingAddress: string;
  note: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

/** Payload for POST /orders/cart (Add to Cart) */
export interface AddToCartPayload {
  productId: string;
  quantity: number;
  isCustom: boolean;
  builderSessionId?: string; // Only required for custom builder flow
}

/** Payload for POST /orders/checkout */
export interface CheckoutPayload {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  note: string;
  successUrl?: string;
  cancelUrl?: string;
  selectedOrderItemIds: string[];
  paymentMethod: number;
  appliedSystemVoucherCode?: string;
  appliedShopVoucherCodeGroups?: Record<string, string[]>;
}

/** Response data from POST /orders/checkout */
export interface CheckoutResponseData {
  orderGroupId: string;
  totalAmount: number;
  paymentUrl: string;
}

/** Payload for PUT /orders/{orderId}/shipping-address */
export interface UpdateShippingAddressPayload {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
}

// ============================================================
// Payment History Types
// ============================================================

/** A single item in a payment-history order */
export interface PaymentHistoryOrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom: boolean;
}

/** A single order within a payment-history order group */
export interface PaymentHistoryOrder {
  orderId: string;
  orderGroupId: string;
  shopId: string;
  shopName: string;
  shopAvatar: string;
  orderStatus: string;
  paymentStatus: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  orderItems: PaymentHistoryOrderItem[];
}

/** A group of orders sharing the same payment */
export interface OrderGroup {
  orderGroupId: string;
  totalGroupAmount: number;
  paymentStatus: string;
  createdAt: string;
  orders: PaymentHistoryOrder[];
}

// ============================================================
// Calculate Preview Types
// ============================================================

/** Payload for POST /orders/calculate-preview */
export interface CalculatePreviewPayload {
  selectedOrderItemIds: string[];
  appliedSystemVoucherCode?: string;
  appliedShopVoucherCodeGroups?: Record<string, string[]>;
}

/** Breakdown of applied vouchers for a shop */
export interface AppliedVoucherBreakdown {
  voucherCode: string;
  discountType: string;
  discountAmount: number;
}

/** Per-shop result from the calculate-preview response */
export interface ShopPreview {
  shopId: string;
  shopName: string;
  subTotal: number;
  shippingFee: number;
  shopDiscountAmount: number;
  totalAmount: number;
  includedOrderItemIds: string[];
  appliedVoucherBreakdowns?: AppliedVoucherBreakdown[];
  shopVoucherError: string | null;
}

/** Full response from POST /orders/calculate-preview */
export interface CartPreviewData {
  totalCartSubTotal: number;
  totalShippingFee: number;
  totalDiscountAmount: number;
  finalTotalAmount: number;
  systemVoucherError: string | null;
  shopPreviews: ShopPreview[];
}
