"use client";

import { FC, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";
import {
  CartData,
  OrderItem,
  OrderItemComponent,
} from "@/src/types/order.types";

// Constants
const ROUTES = {
  SHOP: "/shop/all-products",
  CHECKOUT: "/checkout",
} as const;

// ─── Loading Skeleton ──────────────────────────────────────
const CartSkeleton: FC = () => (
  <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-48 bg-gray-200 rounded mb-12" />
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4 py-6 border-b border-gray-100">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full lg:w-[350px] shrink-0">
        <div className="bg-gray-100 p-8 rounded space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Empty Cart ────────────────────────────────────────────
const EmptyCart: FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
    <ShoppingBag className="w-16 h-16 text-gray-200 mb-6" />
    <h1 className="text-3xl font-oswald font-bold text-black mb-4 uppercase">
      Your Cart is Empty
    </h1>
    <p className="text-gray-500 mb-8 max-w-md">
      Looks like you haven&apos;t added anything yet. Browse our collection to
      find your perfect keyboard setup.
    </p>
    <Link
      href={ROUTES.SHOP}
      className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors duration-200"
    >
      Continue Shopping
    </Link>
  </div>
);

// ─── Component Row (inside accordion) ──────────────────────
const ComponentRow: FC<{ component: OrderItemComponent }> = ({ component }) => (
  <div className="flex items-center gap-3 py-3 pl-4 border-l-2 border-gray-200">
    {/* Part image */}
    <div className="relative w-12 h-12 bg-gray-50 shrink-0 border border-gray-100 rounded overflow-hidden">
      {component.partImageUrl ? (
        <Image
          src={component.partImageUrl}
          alt={component.partName}
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
          N/A
        </div>
      )}
    </div>

    {/* Part info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate capitalize">
        {component.partName}
      </p>
      <p className="text-xs text-gray-400">Qty: {component.quantity}</p>
    </div>

    {/* Part price */}
    <span className="text-sm text-gray-600 tabular-nums shrink-0">
      {component.partPriceSnapshot > 0
        ? `${component.partPriceSnapshot.toLocaleString()}₫`
        : "Included"}
    </span>
  </div>
);

// ─── Cart Item (with accordion for custom builds) ──────────
interface CartItemCardProps {
  item: OrderItem;
  onRemove: (id: string) => void;
  removing: boolean;
}

const CartItemCard: FC<CartItemCardProps> = ({ item, onRemove, removing }) => {
  const [expanded, setExpanded] = useState(false);
  const isCustom = item.isCustom && item.orderItemComponents.length > 0;

  // Determine the first component image as fallback for custom items
  const displayImage =
    item.productImage ||
    (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

  return (
    <div className="py-6 border-b border-gray-100">
      {/* Main row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Product Info */}
        <div className="md:col-span-7 flex gap-4">
          {/* Image */}
          <div className="relative w-24 h-24 bg-gray-50 shrink-0 border border-gray-100 rounded-sm overflow-hidden">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={item.productName}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-200" />
              </div>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="font-bold text-black text-lg leading-tight mb-1 truncate capitalize">
              {item.productName}
            </h3>

            {isCustom && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-[#ce2a32] hover:underline mt-1 w-fit"
              >
                {expanded ? (
                  <>
                    Hide components <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    View {item.orderItemComponents.length} components{" "}
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}

            <p className="md:hidden text-sm font-medium text-gray-700 mt-1">
              {item.unitPrice.toLocaleString()}₫
            </p>
          </div>
        </div>

        {/* Quantity */}
        <div className="md:col-span-2 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded">
            ×{item.quantity}
          </span>
        </div>

        {/* Total Price & Remove */}
        <div className="md:col-span-3 flex items-center justify-end gap-4">
          <span className="font-bold text-lg">
            {item.totalPrice.toLocaleString()}₫
          </span>
          <button
            onClick={() => onRemove(item.id)}
            disabled={removing}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
            aria-label={`Remove ${item.productName}`}
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Accordion: Component list for custom builds */}
      {isCustom && expanded && (
        <div className="mt-4 ml-0 md:ml-28 space-y-0 bg-gray-50/50 rounded-lg p-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Build Components
          </p>
          {item.orderItemComponents.map((comp) => (
            <ComponentRow key={comp.partId} component={comp} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Order Summary Sidebar ─────────────────────────────────
interface OrderSummaryProps {
  cart: CartData;
  onCheckout: () => void;
}

const OrderSummary: FC<OrderSummaryProps> = ({ cart, onCheckout }) => (
  <div className="w-full lg:w-[350px] shrink-0">
    <div className="bg-gray-50 p-6 md:p-8 rounded-sm sticky top-28">
      <h3 className="font-oswald font-bold text-lg uppercase mb-4 border-b border-gray-200 pb-2">
        Order Summary
      </h3>

      {/* Subtotal */}
      {cart.subTotal > 0 && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{cart.subTotal.toLocaleString()}₫</span>
        </div>
      )}

      {/* Shipping */}
      {cart.shippingFee > 0 && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {cart.shippingFee.toLocaleString()}₫
          </span>
        </div>
      )}

      {/* Discount */}
      {cart.discountAmount > 0 && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-600">Discount</span>
          <span className="font-medium text-green-600">
            -{cart.discountAmount.toLocaleString()}₫
          </span>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-end mb-2 mt-4 pt-3 border-t border-gray-200">
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          Total
        </span>
        <span className="text-xl font-black text-black">
          {cart.totalAmount.toLocaleString()}₫
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-6 text-right">
        Taxes and shipping calculated at checkout
      </p>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onCheckout}
          className="w-full bg-black text-white h-12 text-sm font-bold uppercase tracking-widest hover:bg-[#ce2a32] transition-colors duration-200 rounded-sm"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════
// Main Cart Page
// ═════════════════════════════════════════════════════════════
export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch cart from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderService.getCart();
        if (res.success) {
          setCart(res.data);
        } else {
          setError(res.message || "Failed to load cart");
        }
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleCheckout = useCallback(() => {
    router.push(ROUTES.CHECKOUT);
  }, [router]);

  const handleRemoveItem = useCallback(async (orderItemId: string) => {
    setRemovingId(orderItemId);
    try {
      const res = await orderService.deleteCartItem(orderItemId);
      if (res.success) {
        toast.success("Item removed from cart");
        // Re-fetch cart to get updated totals
        const cartRes = await orderService.getCart();
        if (cartRes.success) {
          setCart(cartRes.data);
        }
      } else {
        toast.error(res.message || "Failed to remove item");
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  }, []);

  // Loading state
  if (loading) {
    return <CartSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:bg-gray-900 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.orderItems.length === 0) {
    return <EmptyCart />;
  }

  // Main cart content
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 md:mb-12 pb-4">
        <h1 className="text-3xl md:text-4xl font-oswald font-bold uppercase tracking-wide">
          Your Cart
        </h1>
        <Link
          href={ROUTES.SHOP}
          className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-[#ce2a32] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product List */}
        <div className="flex-1">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-7">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {/* Cart Items */}
          <div className="flex flex-col">
            {cart.orderItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                removing={removingId === item.id}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <OrderSummary cart={cart} onCheckout={handleCheckout} />
      </div>
    </div>
  );
}
