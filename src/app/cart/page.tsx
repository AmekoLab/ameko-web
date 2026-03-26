"use client";

import { FC, useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  Trash2,
  Minus,
  Plus,
  Ticket,
  Store,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";
import {
  CartData,
  OrderItem,
  OrderItemComponent,
} from "@/src/types/order.types";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchApplicableVouchersThunk,
  selectShopVoucherGroups,
  selectSystemVouchers,
  setSelectedSystemVouchers,
  setSelectedShopVouchers,
  selectSelectedSystemVoucherIds,
} from "@/src/store/slices/voucherSlice";
import {
  toggleItemSelection,
  setAllSelectedItems,
} from "@/src/store/slices/cartSlice";
import { Voucher } from "@/src/services/voucher.service";
import VoucherSelectorModal from "@/src/components/Cart/VoucherSelectorModal";
import { useCartPreviewLogic } from "@/src/hooks/useCartPreviewLogic";

// Helper
const formatCurrency = (amount: number) => `${amount.toLocaleString()}₫`;

// Constants
const ROUTES = {
  SHOP: "/shop/all-products",
  CHECKOUT: "/checkout",
} as const;

// ─── Loading Skeleton ──────────────────────────────────────
const CartSkeleton: FC = () => (
  <div className="min-h-screen bg-black">
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 lg:py-12 animate-pulse">
      <div className="h-8 w-48 bg-[#202030] rounded-sm mb-8" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[#151515] rounded-sm border border-[#1e2126] p-4 space-y-4"
            >
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-[#202030] rounded-sm" />
                <div className="w-5 h-5 bg-[#202030] rounded-sm" />
                <div className="h-5 w-32 bg-[#202030] rounded-sm" />
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-5 h-5 bg-[#202030] rounded-sm" />
                <div className="w-20 h-20 bg-[#202030] rounded-sm" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[#202030] rounded-sm" />
                  <div className="h-4 w-1/2 bg-[#202030] rounded-sm" />
                </div>
                <div className="h-4 w-20 bg-[#202030] rounded-sm" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-[#151515] border border-[#1e2126] rounded-sm p-6 space-y-4">
            <div className="h-6 w-40 bg-[#202030] rounded-sm" />
            <div className="h-10 w-full bg-[#202030] rounded-sm" />
            <div className="h-12 w-full bg-[#202030] rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Empty Cart ────────────────────────────────────────────
const EmptyCart: FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
    <ShoppingBag className="w-16 h-16 text-[#f5d800] opacity-50 mb-6" />
    <h1 className="text-3xl font-oswald font-black text-white mb-4 uppercase tracking-widest">
      Your Cart is Empty
    </h1>
    <p className="text-gray-400 mb-8 max-w-md font-medium text-sm">
      Looks like you haven&apos;t added anything yet. Browse our collection to
      find your perfect custom build.
    </p>
    <Link
      href={ROUTES.SHOP}
      className="bg-[#f5d800] text-black px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-[#ffe500] transition-colors duration-200 rounded-sm shadow-[0_0_15px_rgba(245,216,0,0.3)]"
    >
      Continue Shopping
    </Link>
  </div>
);

// ─── Component Row (inside accordion) ──────────────────────
const ComponentRow: FC<{ component: OrderItemComponent }> = ({ component }) => (
  <div className="flex items-center gap-3 py-3 pl-4 border-l border-[#1e2126]">
    {/* Part image */}
    <div className="relative w-12 h-12 bg-[#202030] shrink-0 border border-[#1e2126] rounded-sm overflow-hidden">
      {component.partImageUrl ? (
        <Image
          src={component.partImageUrl}
          alt={component.partName}
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          N/A
        </div>
      )}
    </div>

    {/* Part info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-300 truncate uppercase tracking-wide">
        {component.partName}
      </p>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Qty: {component.quantity}</p>
    </div>

    {/* Part price */}
    <span className="text-[13px] font-bold text-gray-400 tabular-nums shrink-0">
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
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  updatingQuantity: boolean;
}

const CartItemCard: FC<CartItemCardProps> = ({
  item,
  onRemove,
  removing,
  selected,
  onToggleSelect,
  onUpdateQuantity,
  updatingQuantity,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isCustom = item.isCustom && item.orderItemComponents.length > 0;
  const isStrictCustomRequest = item.productName?.includes('Custom Request');

  // Determine the first component image as fallback for custom items
  const displayImage =
    item.productImage ||
    (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

  return (
    <div
      className={`border-b border-[#1e2126] last:border-b-0 transition-colors ${
        selected ? "bg-[#202030]/30" : "hover:bg-[#151515]"
      }`}
    >
      {/* Main row */}
      <div className="flex items-center p-4 gap-3">
        {/* Checkbox */}
        <div className="shrink-0 self-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(item.orderItemId)}
            className="w-4 h-4 accent-[#f5d800] cursor-pointer"
            aria-label={`Select ${item.productName}`}
          />
        </div>

        {/* Image */}
        <div className="relative w-20 h-20 shrink-0 rounded-sm border border-[#1e2126] overflow-hidden bg-[#151515]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={item.productName}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[13px] font-black text-white line-clamp-2 uppercase tracking-wider leading-snug">
            {item.productName}
          </p>
          {isCustom && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors mt-1.5 w-fit"
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
          {/* Mobile: price, qty, action */}
          <div className="md:hidden flex items-center gap-3 mt-2">
            <span className="text-sm font-bold text-[#f5d800]">
              {item.totalPrice.toLocaleString()}₫
            </span>
            <div className="flex items-center border border-[#1e2126] bg-[#151515] rounded-sm ml-auto">
              <button
                onClick={() =>
                  onUpdateQuantity(item.orderItemId, item.quantity - 1)
                }
                disabled={isStrictCustomRequest || item.quantity <= 1 || updatingQuantity}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 h-7 flex items-center justify-center text-xs font-bold text-white border-x border-[#1e2126] tabular-nums">
                {updatingQuantity ? (
                  <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(item.orderItemId, item.quantity + 1)
                }
                disabled={isStrictCustomRequest || item.quantity >= 99 || updatingQuantity}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.orderItemId)}
              disabled={removing}
              className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-40"
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

        {/* Desktop: Unit Price */}
        <div className="hidden md:flex w-28 justify-center shrink-0">
          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
            {item.unitPrice.toLocaleString()}₫
          </span>
        </div>

        {/* Desktop: Quantity */}
        <div className="hidden md:flex w-32 justify-center shrink-0">
          <div className="flex items-center border border-[#1e2126] bg-[#151515] rounded-sm">
            <button
              onClick={() =>
                onUpdateQuantity(item.orderItemId, item.quantity - 1)
              }
              disabled={isStrictCustomRequest || item.quantity <= 1 || updatingQuantity}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 h-8 flex items-center justify-center text-[13px] font-bold text-white border-x border-[#1e2126] tabular-nums">
              {updatingQuantity ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.orderItemId, item.quantity + 1)
              }
              disabled={isStrictCustomRequest || item.quantity >= 99 || updatingQuantity}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop: Total Price */}
        <div className="hidden md:flex w-28 justify-center shrink-0">
          <span className="text-[14px] font-black text-[#f5d800] uppercase tracking-widest">
            {item.totalPrice.toLocaleString()}₫
          </span>
        </div>

        {/* Desktop: Remove */}
        <div className="hidden md:flex w-10 justify-center shrink-0">
          <button
            onClick={() => onRemove(item.orderItemId)}
            disabled={removing}
            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-40"
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
        <div className="mx-4 mb-4 ml-[7.5rem] bg-black border border-[#1e2126] rounded-sm p-3">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-4">
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
  selectedItemIds: Set<string>;
  onCheckout: () => void;
  onOpenSystemVoucher: () => void;
  isUpdating: boolean;
}

const OrderSummary: FC<OrderSummaryProps> = ({
  cart,
  selectedItemIds,
  onCheckout,
  onOpenSystemVoucher,
  isUpdating,
}) => {
  const dispatch = useAppDispatch();
  const systemVouchers = useAppSelector(selectSystemVouchers);
  const selectedSystemIds = useAppSelector(selectSelectedSystemVoucherIds);
  const selectedShopVoucherIdsMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherIds,
  );
  const applicableVouchers = useAppSelector(
    (state) => state.voucher.applicableVouchers,
  );
  const availableSystemVouchersCount = systemVouchers.length;
  const hasSelection = selectedItemIds.size > 0;

  const { cartPreview, isCalculatingPreview } = useCartPreviewLogic(
    cart.orderItems,
    selectedItemIds,
    isUpdating,
  );

  // Derive the selected system voucher code (for display)
  const selectedSystemVoucherCode = useMemo(() => {
    if (!selectedSystemIds?.length || !applicableVouchers?.systemVouchers)
      return null;
    return (
      applicableVouchers.systemVouchers.find(
        (v) => v.id === selectedSystemIds[0],
      ) ?? null
    );
  }, [selectedSystemIds, applicableVouchers]);

  // Derive selected shop vouchers (for display)
  const selectedShopVouchers = useMemo(() => {
    if (!applicableVouchers?.shopVoucherGroups) return [];
    const result: {
      shopId: string;
      shopName: string;
      code: string;
      discountAmount: number;
    }[] = [];
    Object.entries(selectedShopVoucherIdsMap).forEach(([shopId, vIds]) => {
      if (!vIds || vIds.length === 0) return;
      const group = applicableVouchers.shopVoucherGroups.find(
        (g) => g.shopId === shopId,
      );
      const voucher = group?.vouchers.find((v) => v.id === vIds[0]);
      if (voucher) {
        const shopPreview = cartPreview?.shopPreviews.find(
          (s) => s.shopId === shopId,
        );
        result.push({
          shopId,
          shopName: shopPreview?.shopName ?? shopId,
          code: voucher.code,
          discountAmount: shopPreview?.shopDiscountAmount ?? 0,
        });
      }
    });
    return result;
  }, [selectedShopVoucherIdsMap, applicableVouchers, cartPreview]);

  const hasAppliedVouchers =
    !!selectedSystemVoucherCode || selectedShopVouchers.length > 0;

  // Derive system-only discount = total minus all shop discounts
  const totalShopDiscount =
    cartPreview?.shopPreviews?.reduce(
      (sum, shop) => sum + (shop.shopDiscountAmount || 0),
      0,
    ) || 0;
  const systemDiscountAmount =
    (cartPreview?.totalDiscountAmount || 0) - totalShopDiscount;

  return (
    <div className="w-full lg:w-[380px] shrink-0">
      <div className="bg-black border border-[#1e2126] rounded-sm p-6 sticky top-28">
        <h3 className="font-oswald font-black text-white text-lg uppercase tracking-widest mb-4 border-b border-[#1e2126] pb-2">
          Order Summary
        </h3>

        {/* Ameko Platform Voucher */}
        <div className="mb-3 p-3 rounded-sm border border-[#1e2126] bg-[#151515] transition-colors hover:border-[#f5d800]">
          <button
            type="button"
            onClick={onOpenSystemVoucher}
            className="w-full flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#f5d800]" />
              <span className="font-bold text-[13px] text-white uppercase tracking-wider">Ameko Voucher</span>
            </div>
            <div className="flex items-center gap-1">
              {selectedSystemIds.length > 0 ? (
                <span className="text-[11px] font-bold text-[#f5d800] uppercase tracking-widest">
                  Selected {selectedSystemIds.length}
                </span>
              ) : availableSystemVouchersCount > 0 ? (
                <span className="text-[11px] font-bold text-[#f5d800] uppercase tracking-widest">
                  Available ({availableSystemVouchersCount})
                </span>
              ) : (
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Select</span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </button>
          {/* System voucher error */}
          {cartPreview?.systemVoucherError && (
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1.5 px-1">
              {cartPreview.systemVoucherError}
            </p>
          )}
        </div>

        {/* Applied Vouchers Breakdown */}
        {hasAppliedVouchers && (
          <div className="mb-4 space-y-1.5 py-2 border-t border-[#1e2126]">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 px-1">
              Applied Vouchers
            </p>

            {/* System voucher row */}
            {selectedSystemVoucherCode && (
              <div className="flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-1.5 pt-1">
                  <Ticket className="w-3 h-3 text-[#f5d800]" />
                  <span className="text-white uppercase tracking-wider">
                    {selectedSystemVoucherCode.code}
                  </span>
                  <span className="text-gray-500 uppercase tracking-wider">(System)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {systemDiscountAmount > 0 && (
                    <span className="text-green-500">
                      -{formatCurrency(systemDiscountAmount)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => dispatch(setSelectedSystemVouchers([]))}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove system voucher"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Shop voucher rows */}
            {selectedShopVouchers.map((sv) => (
              <div
                key={sv.shopId}
                className="flex items-center justify-between text-[11px] font-bold"
              >
                <div className="flex items-center gap-1.5 pt-1">
                  <Ticket className="w-3 h-3 text-[#f5d800]" />
                  <span className="text-white uppercase tracking-wider">{sv.code}</span>
                  <span className="text-gray-500 uppercase tracking-wider">({sv.shopName})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {sv.discountAmount > 0 && (
                    <span className="text-green-500">
                      -{formatCurrency(sv.discountAmount)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        setSelectedShopVouchers({
                          shopId: sv.shopId,
                          voucherIds: [],
                        }),
                      )
                    }
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove voucher ${sv.code}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected items info */}
        <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <span>Selected items</span>
          <span className="text-white">
            {selectedItemIds.size} item{selectedItemIds.size !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <span>Subtotal</span>
          <span className="text-white">
            {isCalculatingPreview ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : (
              formatCurrency(cartPreview?.totalCartSubTotal || 0)
            )}
          </span>
        </div>

        {/* Shipping — Pay on Delivery (excluded from Stripe total) */}
        <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <span>Shipping</span>
          <span className="italic text-gray-400 normal-case text-xs">Pay on delivery</span>
        </div>

        {/* Discount */}
        {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
          <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span>Discount</span>
            <span className="text-green-500">
              -{formatCurrency(cartPreview!.totalDiscountAmount)}
            </span>
          </div>
        )}

        {/* Total = Subtotal - Discount (shipping is COD, excluded from Stripe) */}
        <div className="flex justify-between items-end mb-2 mt-4 pt-3 border-t border-[#1e2126]">
          <span className="text-[13px] font-black text-white uppercase tracking-widest">
            Estimated Total
          </span>
          <span className="text-xl font-black text-[#f5d800]">
            {isCalculatingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin inline" />
            ) : (
              formatCurrency(
                (cartPreview?.totalCartSubTotal || 0) - (cartPreview?.totalDiscountAmount || 0)
              )
            )}
          </span>
        </div>

        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 text-right">
          Taxes and shipping calculated at checkout
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onCheckout}
            disabled={!hasSelection || isCalculatingPreview}
            className={`w-full py-4 text-[13px] font-black uppercase tracking-[0.15em] rounded-sm transition-colors duration-200 ${
              hasSelection && !isCalculatingPreview
                ? "bg-[#f5d800] text-black hover:bg-[#ffe500] shadow-[0_0_15px_rgba(245,216,0,0.3)]"
                : "bg-[#202030] text-gray-500 cursor-not-allowed border border-[#1e2126]"
            }`}
          >
            {isCalculatingPreview ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : hasSelection ? (
              `Checkout Now (${selectedItemIds.size})`
            ) : (
              "Select Items"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// Main Cart Page
// ═════════════════════════════════════════════════════════════
export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const shopVoucherGroups = useAppSelector(selectShopVoucherGroups);
  const systemVouchersMain = useAppSelector(selectSystemVouchers);
  const selectedSystemIds = useAppSelector(selectSelectedSystemVoucherIds);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingQuantityId, setUpdatingQuantityId] = useState<string | null>(
    null,
  );
  const quantityTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Global selection from Redux (single source of truth)
  const selectedItemIdsArray = useAppSelector(
    (state) => state.cart.selectedItemIds,
  );
  const selectedItemIds = useMemo(
    () => new Set(selectedItemIdsArray),
    [selectedItemIdsArray],
  );

  // ── Voucher modal state ──
  const [voucherModal, setVoucherModal] = useState<{
    isOpen: boolean;
    title: string;
    vouchers: Voucher[];
    subtotal: number;
    brandLabel: string;
    selectedIds: string[];
    scope: { type: "system" } | { type: "shop"; shopId: string };
  }>({
    isOpen: false,
    title: "",
    vouchers: [],
    subtotal: 0,
    brandLabel: "Ameko",
    selectedIds: [],
    scope: { type: "system" },
  });

  // Toggle selection for a single item
  const handleToggleSelect = useCallback(
    (id: string) => {
      dispatch(toggleItemSelection(id));
    },
    [dispatch],
  );

  // Select / deselect all
  const handleToggleSelectAll = useCallback(() => {
    if (!cart) return;
    if (selectedItemIds.size === cart.orderItems.length) {
      dispatch(setAllSelectedItems([]));
    } else {
      dispatch(
        setAllSelectedItems(cart.orderItems.map((item) => item.orderItemId)),
      );
    }
  }, [cart, selectedItemIds.size, dispatch]);

  // Select / deselect all items belonging to one shop
  const handleToggleShopSelect = useCallback(
    (shopId: string) => {
      const shopItems =
        cart?.orderItems.filter((item) => item.shopId === shopId) ?? [];
      const shopItemIds = shopItems.map((item) => item.orderItemId);
      const allSelected = shopItemIds.every((id) => selectedItemIds.has(id));
      if (allSelected) {
        // Remove shop items from selection
        const next = selectedItemIdsArray.filter(
          (id) => !shopItemIds.includes(id),
        );
        dispatch(setAllSelectedItems(next));
      } else {
        // Add missing shop items into selection
        const next = Array.from(
          new Set([...selectedItemIdsArray, ...shopItemIds]),
        );
        dispatch(setAllSelectedItems(next));
      }
    },
    [cart, selectedItemIds, selectedItemIdsArray, dispatch],
  );

  // Fetch cart from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderService.getCart();
        if (res.success) {
          setCart(res.data);
          // Auto-select all items on load
          dispatch(
            setAllSelectedItems(
              res.data?.orderItems?.map((item) => item.orderItemId) || [],
            ),
          );
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

  // Fetch applicable vouchers
  useEffect(() => {
    dispatch(fetchApplicableVouchersThunk());
  }, [dispatch]);

  // Group cart items by shopId for shop-level voucher display
  const shopGroups = useMemo(() => {
    if (!cart) return [];
    const map = new Map<
      string,
      { shopId: string; shopName: string; items: OrderItem[] }
    >();
    cart.orderItems.forEach((item) => {
      const key = item.shopId;
      if (!map.has(key)) {
        map.set(key, {
          shopId: item.shopId,
          shopName: item.shopName || "Shop",
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [cart]);

  // ── Open voucher modal for system vouchers ──
  const handleOpenSystemVoucherModal = useCallback(() => {
    const selectedTotal = cart
      ? cart.orderItems
          .filter((i) => selectedItemIds.has(i.orderItemId))
          .reduce((s, i) => s + i.totalPrice, 0)
      : 0;
    setVoucherModal({
      isOpen: true,
      title: "Chọn Ameko Voucher",
      vouchers: systemVouchersMain,
      subtotal: selectedTotal,
      brandLabel: "Ameko",
      selectedIds: selectedSystemIds,
      scope: { type: "system" },
    });
  }, [cart, selectedItemIds, systemVouchersMain, selectedSystemIds]);

  // ── Open voucher modal for a specific shop ──
  const handleOpenShopVoucherModal = useCallback(
    (shopId: string, shopName: string) => {
      const group = shopVoucherGroups.find((g) => g.shopId === shopId);
      const shopSubtotal = cart
        ? cart.orderItems
            .filter(
              (i) => i.shopId === shopId && selectedItemIds.has(i.orderItemId),
            )
            .reduce((s, i) => s + i.totalPrice, 0)
        : 0;
      setVoucherModal({
        isOpen: true,
        title: `Chọn Voucher từ ${shopName}`,
        vouchers: group?.vouchers ?? [],
        subtotal: shopSubtotal,
        brandLabel: shopName,
        selectedIds: [],
        scope: { type: "shop", shopId },
      });
    },
    [cart, selectedItemIds, shopVoucherGroups],
  );

  // ── Handle voucher confirm ──
  const handleVoucherConfirm = useCallback(
    (selectedVouchers: Voucher[]) => {
      const ids = selectedVouchers.map((v) => v.id);
      if (voucherModal.scope.type === "system") {
        dispatch(setSelectedSystemVouchers(ids));
      } else {
        dispatch(
          setSelectedShopVouchers({
            shopId: voucherModal.scope.shopId,
            voucherIds: ids,
          }),
        );
      }
    },
    [dispatch, voucherModal.scope],
  );

  const handleCloseVoucherModal = useCallback(() => {
    setVoucherModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCheckout = useCallback(() => {
    if (selectedItemIds.size === 0) return;
    // Pass selected item IDs via URL search params
    const params = new URLSearchParams();
    selectedItemIds.forEach((id) => params.append("items", id));
    router.push(`${ROUTES.CHECKOUT}?${params.toString()}`);
  }, [router, selectedItemIds]);

  const handleRemoveItem = useCallback(async (orderItemId: string) => {
    setRemovingId(orderItemId);
    try {
      const res = await orderService.deleteCartItem(orderItemId);
      if (res.success) {
        toast.success("Item removed from cart");
        // Remove from selection
        dispatch(
          setAllSelectedItems(
            selectedItemIdsArray.filter((id) => id !== orderItemId),
          ),
        );
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
  }, [dispatch, selectedItemIdsArray]);

  // Update item quantity with debounced DB write + instant optimistic UI
  const handleUpdateQuantity = useCallback(
    async (orderItemId: string, newQuantity: number) => {
      if (!Number.isInteger(newQuantity) || newQuantity < 1 || newQuantity > 99)
        return;
      if (!cart) return;

      // 1. Instant optimistic UI update
      setCart((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderItems: prev.orderItems.map((item) => {
            if (item.orderItemId !== orderItemId) return item;
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            };
          }),
          totalAmount: prev.orderItems.reduce((sum, item) => {
            if (item.orderItemId === orderItemId)
              return sum + item.unitPrice * newQuantity;
            return sum + item.totalPrice;
          }, 0),
        };
      });

      // 2. Block the preview hook immediately
      setUpdatingQuantityId(orderItemId);

      // 3. Debounce the actual DB write (600ms)
      if (quantityTimerRef.current) clearTimeout(quantityTimerRef.current);
      quantityTimerRef.current = setTimeout(async () => {
        try {
          const res = await orderService.updateCartItemQuantity(
            orderItemId,
            newQuantity,
          );
          if (res.success) {
            // DB confirmed — unblock the preview hook. No extra getCart() needed.
            setUpdatingQuantityId(null);
          } else {
            // Rollback: fetch authoritative state, then unblock
            const cartRes = await orderService.getCart();
            if (cartRes.success) setCart(cartRes.data);
            toast.error(res.message || "Failed to update quantity");
            setUpdatingQuantityId(null);
          }
        } catch {
          const cartRes = await orderService.getCart();
          if (cartRes.success) setCart(cartRes.data);
          toast.error("Failed to update quantity");
          setUpdatingQuantityId(null);
        }
      }, 600);
    },
    [cart],
  );

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
if (!cart || !cart?.orderItems || cart?.orderItems?.length === 0) {
  return <EmptyCart />;
}

  // Main cart content
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 lg:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-widest text-white">
            Your Cart
          </h1>
          <Link
            href={ROUTES.SHOP}
            className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product List */}
          <div className="flex-1 space-y-4">
            {/* Column Header (Desktop) */}
            <div className="hidden md:flex items-center bg-[#151515] border border-[#1e2126] rounded-sm px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="checkbox"
                  checked={
                    selectedItemIds.size === cart.orderItems.length &&
                    cart.orderItems.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 accent-[#f5d800] cursor-pointer"
                  aria-label="Select all items"
                />
              </div>
              <span className="flex-1 ml-3">Product</span>
              <span className="w-28 text-center">Price</span>
              <span className="w-32 text-center">Quantity</span>
              <span className="w-28 text-center">Total</span>
              <span className="w-10 text-center">Action</span>
            </div>

            {/* Mobile: Select All */}
            <div className="md:hidden flex items-center gap-2 bg-[#151515] border border-[#1e2126] rounded-sm px-4 py-3">
              <input
                type="checkbox"
                checked={
                  selectedItemIds.size === cart.orderItems.length &&
                  cart.orderItems.length > 0
                }
                onChange={handleToggleSelectAll}
                className="w-4 h-4 accent-[#f5d800] cursor-pointer"
                aria-label="Select all items"
              />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">
                Select All ({cart.orderItems.length})
              </span>
            </div>

            {/* Shop Cards */}
            {shopGroups.map(({ shopId, shopName, items: shopItems }) => {
              const vouchers =
                shopVoucherGroups.find((g) => g.shopId === shopId)?.vouchers ??
                [];
              const shopItemIds = shopItems.map((i) => i.orderItemId);
              const allShopSelected =
                shopItemIds.length > 0 &&
                shopItemIds.every((id) => selectedItemIds.has(id));

              return (
                <div
                  key={shopId}
                  className="bg-[#151515] border border-[#1e2126] rounded-sm overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="flex items-center p-4 border-b border-[#1e2126]">
                    <input
                      type="checkbox"
                      checked={allShopSelected}
                      onChange={() => handleToggleShopSelect(shopId)}
                      className="w-4 h-4 accent-[#f5d800] cursor-pointer shrink-0"
                      aria-label={`Select all from ${shopName}`}
                    />
                    <Store className="w-[18px] h-[18px] text-gray-500 ml-3" />
                    <span className="text-[13px] font-black text-white ml-2 truncate uppercase tracking-widest">
                      {shopName}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-1 shrink-0" />
                  </div>

                  {/* Product Rows */}
                  {shopItems.map((item) => (
                    <CartItemCard
                      key={item.orderItemId}
                      item={item}
                      onRemove={handleRemoveItem}
                      removing={removingId === item.orderItemId}
                      selected={selectedItemIds.has(item.orderItemId)}
                      onToggleSelect={handleToggleSelect}
                      onUpdateQuantity={handleUpdateQuantity}
                      updatingQuantity={updatingQuantityId === item.orderItemId}
                    />
                  ))}

                  {/* Shop Voucher Footer */}
                  <div className="p-4 border-t border-[#1e2126] bg-black">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        <Ticket className="w-4 h-4 text-[#f5d800]" />
                        <span>Shop Voucher</span>
                      </div>
                      {vouchers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenShopVoucherModal(shopId, shopName)
                          }
                          className="text-[11px] font-black text-[#f5d800] hover:text-[#ffe500] hover:underline uppercase tracking-widest transition-colors"
                        >
                          Select or enter code ({vouchers.length} available)
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                          Select or enter code
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <OrderSummary
            cart={cart}
            selectedItemIds={selectedItemIds}
            onCheckout={handleCheckout}
            onOpenSystemVoucher={handleOpenSystemVoucherModal}
            isUpdating={!!updatingQuantityId || !!removingId}
          />
        </div>
      </div>

      {/* Voucher Selector Modal */}
      <VoucherSelectorModal
        isOpen={voucherModal.isOpen}
        onClose={handleCloseVoucherModal}
        title={voucherModal.title}
        vouchers={voucherModal.vouchers}
        currentSubtotal={voucherModal.subtotal}
        brandLabel={voucherModal.brandLabel}
        selectedIds={voucherModal.selectedIds}
        onConfirm={handleVoucherConfirm}
        orderId={cart?.orderId}
      />
    </div>
  );
}
