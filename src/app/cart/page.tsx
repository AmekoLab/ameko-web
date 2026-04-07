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
  setSelectedSystemVoucher,
  setSelectedShopVouchers,
  selectSelectedSystemVoucherCode,
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
  <div className="min-h-screen bg-amazon-bgSecondary">
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 lg:py-12 animate-pulse">
      <div className="h-8 w-48 bg-neutral-200 rounded-sm mb-8" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-sm border border-amazon-border p-4 space-y-4 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-neutral-200 rounded-sm" />
                <div className="w-5 h-5 bg-neutral-200 rounded-sm" />
                <div className="h-5 w-32 bg-neutral-200 rounded-sm" />
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-5 h-5 bg-neutral-200 rounded-sm" />
                <div className="w-20 h-20 bg-neutral-200 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded-sm" />
                  <div className="h-4 w-1/2 bg-neutral-200 rounded-sm" />
                </div>
                <div className="h-4 w-20 bg-neutral-200 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white border border-amazon-border rounded-sm p-6 space-y-4 shadow-sm">
            <div className="h-6 w-40 bg-neutral-200 rounded-sm" />
            <div className="h-10 w-full bg-neutral-200 rounded-sm" />
            <div className="h-12 w-full bg-neutral-200 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Empty Cart ────────────────────────────────────────────
const EmptyCart: FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
    <ShoppingBag className="w-16 h-16 text-neutral-300 mb-6" />
    <h1 className="text-3xl font-black text-amazon-text mb-4 uppercase tracking-widest">
      Shopping Cart is Empty
    </h1>
    <p className="text-amazon-textMuted mb-8 max-w-md font-medium text-sm">
      Looks like you haven&apos;t added anything yet. Browse our collection to
      find your perfect custom build.
    </p>
    <Link
      href={ROUTES.SHOP}
      className="bg-amazon-btnPrimary text-amazon-text px-8 py-3 text-sm font-black uppercase tracking-widest hover:brightness-95 transition-colors duration-200 rounded-sm shadow-md"
    >
      Continue Shopping
    </Link>
  </div>
);

// ─── Component Row (inside accordion) ──────────────────────
const ComponentRow: FC<{ component: OrderItemComponent }> = ({ component }) => (
  <div className="flex items-center gap-3 py-3 pl-4 border-l border-amazon-border">
    {/* Part image */}
    <div className="relative w-12 h-12 bg-neutral-100 shrink-0 border border-amazon-border rounded-sm overflow-hidden">
      {component.partImageUrl ? (
        <Image
          src={component.partImageUrl}
          alt={component.partName}
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          N/A
        </div>
      )}
    </div>

    {/* Part info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-amazon-text truncate uppercase tracking-wide">
        {component.partName}
      </p>
      <p className="text-[11px] font-bold text-amazon-textMuted uppercase tracking-widest">Qty: {component.quantity}</p>
    </div>

    {/* Part price */}
    <span className="text-[13px] font-bold text-amazon-textMuted tabular-nums shrink-0">
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
      className={` last:border-b-0 transition-colors ${
        selected ? "bg-bgSecondary" : "hover:bg-bgSecondary"
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
            className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer"
            aria-label={`Select ${item.productName}`}
          />
        </div>

        {/* Image */}
        <div className="relative w-20 h-20 shrink-0 overflow-hidden bg-bgSecondary">
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
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[13px] font-black text-amazon-text line-clamp-2 uppercase tracking-wider leading-snug">
            {item.productName}
          </p>
          {isCustom && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted hover:text-amazon-link transition-colors mt-1.5 w-fit"
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
            <span className="text-sm font-bold text-amazon-price">
              {item.totalPrice.toLocaleString()}₫
            </span>
            <div className="flex items-center border border-amazon-border bg-white rounded-sm ml-auto">
              <button
                onClick={() =>
                  onUpdateQuantity(item.orderItemId, item.quantity - 1)
                }
                disabled={isStrictCustomRequest || item.quantity <= 1 || updatingQuantity}
                className="w-7 h-7 flex items-center justify-center text-amazon-textMuted hover:text-amazon-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 h-7 flex items-center justify-center text-xs font-bold text-amazon-text border-x border-amazon-border tabular-nums">
                {updatingQuantity ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amazon-textMuted" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(item.orderItemId, item.quantity + 1)
                }
                disabled={isStrictCustomRequest || item.quantity >= 99 || updatingQuantity}
                className="w-7 h-7 flex items-center justify-center text-amazon-textMuted hover:text-amazon-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.orderItemId)}
              disabled={removing}
              className="text-amazon-textMuted hover:text-red-600 transition-colors disabled:opacity-40"
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
          <span className="text-[13px] font-bold text-amazon-textMuted uppercase tracking-widest">
            {item.unitPrice.toLocaleString()}₫
          </span>
        </div>

        {/* Desktop: Quantity */}
        <div className="hidden md:flex w-32 justify-center shrink-0">
          <div className="flex items-center border border-amazon-border bg-white rounded-sm">
            <button
              onClick={() =>
                onUpdateQuantity(item.orderItemId, item.quantity - 1)
              }
              disabled={isStrictCustomRequest || item.quantity <= 1 || updatingQuantity}
              className="w-8 h-8 flex items-center justify-center text-amazon-textMuted hover:text-amazon-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 h-8 flex items-center justify-center text-[13px] font-bold text-amazon-text border-x border-amazon-border tabular-nums">
              {updatingQuantity ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amazon-textMuted" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.orderItemId, item.quantity + 1)
              }
              disabled={isStrictCustomRequest || item.quantity >= 99 || updatingQuantity}
              className="w-8 h-8 flex items-center justify-center text-amazon-textMuted hover:text-amazon-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop: Total Price */}
        <div className="hidden md:flex w-28 justify-center shrink-0">
          <span className="text-[14px] font-black text-amazon-price uppercase tracking-widest">
            {item.totalPrice.toLocaleString()}₫
          </span>
        </div>

        {/* Desktop: Remove */}
        <div className="hidden md:flex w-10 justify-center shrink-0">
          <button
            onClick={() => onRemove(item.orderItemId)}
            disabled={removing}
            className="p-1.5 text-amazon-textMuted hover:text-red-600 transition-colors disabled:opacity-40"
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
        <div className="mx-4 mb-4 ml-[7.5rem] bg-neutral-50 border border-amazon-border rounded-sm p-3">
          <p className="text-[10px] font-black text-amazon-textMuted uppercase tracking-widest mb-2 px-4">
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
  const selectedSystemCode = useAppSelector(selectSelectedSystemVoucherCode);
  const selectedShopVoucherCodesMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherCodes,
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

  // Derive the selected system voucher object (for display)
  const selectedSystemVoucher = useMemo(() => {
    if (!selectedSystemCode || !applicableVouchers?.systemVouchers)
      return null;
    return (
      applicableVouchers.systemVouchers.find(
        (v) => v.code === selectedSystemCode,
      ) ?? null
    );
  }, [selectedSystemCode, applicableVouchers]);

  // Derive selected shop vouchers (for display)
  const selectedShopVouchers = useMemo(() => {
    if (!applicableVouchers?.shopVoucherGroups) return [];
    const result: {
      shopId: string;
      shopName: string;
      codes: string[];
      discountAmount: number;
    }[] = [];
    Object.entries(selectedShopVoucherCodesMap).forEach(([shopId, codes]) => {
      if (!codes || codes.length === 0) return;
      const shopPreview = cartPreview?.shopPreviews.find(
        (s) => s.shopId === shopId,
      );
      result.push({
        shopId,
        shopName: shopPreview?.shopName ?? shopId,
        codes,
        discountAmount: shopPreview?.shopDiscountAmount ?? 0,
      });
    });
    return result;
  }, [selectedShopVoucherCodesMap, applicableVouchers, cartPreview]);

  const hasAppliedVouchers =
    !!selectedSystemVoucher || selectedShopVouchers.length > 0;

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
      <div className="bg-white shadow-sm border border-amazon-border rounded-sm p-6 sticky top-28">
        <h3 className=" font-black text-amazon-text text-lg uppercase tracking-widest mb-4 border-b border-amazon-border pb-2">
          Order Summary
        </h3>

        {/* Ameko Platform Voucher */}
        <div className="mb-3 p-3 rounded-sm border border-amazon-border bg-neutral-50 transition-colors hover:border-amazon-focus/50">
          <button
            type="button"
            onClick={onOpenSystemVoucher}
            className="w-full flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amazon-btnSecondary" />
              <span className="font-bold text-[13px] text-amazon-text uppercase tracking-wider">Ameko Voucher</span>
            </div>
            <div className="flex items-center gap-1">
              {selectedSystemCode ? (
                <span className="text-[11px] font-bold text-amazon-btnSecondary uppercase tracking-widest">
                  Selected 1
                </span>
              ) : availableSystemVouchersCount > 0 ? (
                <span className="text-[11px] font-bold text-amazon-btnSecondary uppercase tracking-widest">
                  Available ({availableSystemVouchersCount})
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amazon-textMuted uppercase tracking-widest">Select</span>
              )}
              <ChevronRight className="w-4 h-4 text-amazon-textMuted group-hover:text-amazon-text transition-colors" />
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
          <div className="mb-4 space-y-1.5 py-2 border-t border-amazon-border">
            <p className="text-[10px] font-black text-amazon-textMuted uppercase tracking-widest mb-1 px-1">
              Applied Vouchers
            </p>

            {/* System voucher row */}
            {selectedSystemVoucher && (
              <div className="flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-1.5 pt-1">
                  <Ticket className="w-3 h-3 text-amazon-btnSecondary" />
                  <span className="text-amazon-text uppercase tracking-wider">
                    {selectedSystemVoucher.code}
                  </span>
                  <span className="text-amazon-textMuted uppercase tracking-wider">(System)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {systemDiscountAmount > 0 && (
                    <span className="text-green-600">
                      -{formatCurrency(systemDiscountAmount)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => dispatch(setSelectedSystemVoucher(null))}
                    className="p-1 text-amazon-textMuted hover:text-red-600 transition-colors"
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
                  <Ticket className="w-3 h-3 text-amazon-btnSecondary" />
                  <span className="text-amazon-text uppercase tracking-wider">{sv.codes.join(", ")}</span>
                  <span className="text-amazon-textMuted uppercase tracking-wider">({sv.shopName})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {sv.discountAmount > 0 && (
                    <span className="text-green-600">
                      -{formatCurrency(sv.discountAmount)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        setSelectedShopVouchers({
                          shopId: sv.shopId,
                          voucherCodes: [],
                        }),
                      )
                    }
                    className="p-1 text-amazon-textMuted hover:text-red-600 transition-colors"
                    aria-label={`Remove vouchers for ${sv.shopName}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected items info */}
        <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
          <span>Selected items</span>
          <span className="text-amazon-text">
            {selectedItemIds.size} item{selectedItemIds.size !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
          <span>Subtotal</span>
          <span className="text-amazon-text">
            {isCalculatingPreview ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : (
              formatCurrency(cartPreview?.totalCartSubTotal || 0)
            )}
          </span>
        </div>

        {/* Shipping — Pay on Delivery (excluded from Stripe total) */}
        <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
          <span>Shipping</span>
          <span className="italic text-amazon-textMuted normal-case text-xs">Pay on delivery</span>
        </div>

        {/* Discount */}
        {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
          <div className="flex justify-between items-center mb-2 text-[11px] font-bold uppercase tracking-widest text-amazon-textMuted">
            <span>Discount</span>
            <span className="text-green-600">
              -{formatCurrency(cartPreview!.totalDiscountAmount)}
            </span>
          </div>
        )}

        {/* Total = Subtotal - Discount (shipping is COD, excluded from Stripe) */}
        <div className="flex justify-between items-end mb-2 mt-4 pt-3 border-t border-amazon-border">
          <span className="text-[13px] font-black text-amazon-text uppercase tracking-widest">
            Estimated Total
          </span>
          <span className="text-xl font-black text-amazon-price">
            {isCalculatingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin inline" />
            ) : (
              formatCurrency(
                (cartPreview?.totalCartSubTotal || 0) - (cartPreview?.totalDiscountAmount || 0)
              )
            )}
          </span>
        </div>

        <p className="text-[10px] text-amazon-textMuted mb-6 text-right">
          Taxes and shipping calculated at checkout
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onCheckout}
            disabled={!hasSelection || isCalculatingPreview}
            className={`w-full py-4 text-[13px] font-black uppercase tracking-[0.15em] rounded-sm transition-colors duration-200 ${
              hasSelection && !isCalculatingPreview
                ? "bg-amazon-btnPrimary text-amazon-text hover:brightness-95 shadow-md"
                : "bg-neutral-200 text-amazon-textMuted cursor-not-allowed border border-amazon-border"
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
  const selectedSystemCode = useAppSelector(selectSelectedSystemVoucherCode);
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
  const selectedShopVoucherCodesMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherCodes,
  );
  const [voucherModal, setVoucherModal] = useState<{
    isOpen: boolean;
    title: string;
    vouchers: Voucher[];
    subtotal: number;
    brandLabel: string;
    selectedCodes: string[];
    scope: { type: "system" } | { type: "shop"; shopId: string };
  }>({
    isOpen: false,
    title: "",
    vouchers: [],
    subtotal: 0,
    brandLabel: "Ameko",
    selectedCodes: [],
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
      selectedCodes: selectedSystemCode ? [selectedSystemCode] : [],
      scope: { type: "system" },
    });
  }, [cart, selectedItemIds, systemVouchersMain, selectedSystemCode]);

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
        title: `Select voucher from ${shopName}`,
        vouchers: group?.vouchers ?? [],
        subtotal: shopSubtotal,
        brandLabel: shopName,
        selectedCodes: selectedShopVoucherCodesMap[shopId] ?? [],
        scope: { type: "shop", shopId },
      });
    },
    [cart, selectedItemIds, shopVoucherGroups, selectedShopVoucherCodesMap],
  );

  // ── Handle voucher confirm ──
  const handleVoucherConfirm = useCallback(
    (selectedVouchers: Voucher[]) => {
      const codes = selectedVouchers.map((v) => v.code);
      if (voucherModal.scope.type === "system") {
        dispatch(setSelectedSystemVoucher(codes.length > 0 ? codes[0] : null));
      } else {
        dispatch(
          setSelectedShopVouchers({
            shopId: voucherModal.scope.shopId,
            voucherCodes: codes,
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
          className="bg-amazon-btnPrimary text-amazon-text shadow-sm px-6 py-2 text-sm font-bold uppercase hover:brightness-95 transition-colors"
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
    <div className="min-h-screen bg-amazon-bgSecondary text-amazon-text">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 lg:py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl  font-black uppercase tracking-widest text-amazon-text">
            Shopping Cart
          </h1>
          {/* <Link
            href={ROUTES.SHOP}
            className="hidden md:flex items-center gap-2 text-sm  tracking-widest text-amazon-textMuted hover:text-amazon-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link> */}
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product List */}
          <div className="flex-1 space-y-4">
            {/* Column Header (Desktop) */}
            <div className="hidden md:flex items-center bg-white border border-amazon-border shadow-sm rounded-sm px-4 py-3 text-[11px] font-black text-amazon-textMuted uppercase tracking-widest">
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="checkbox"
                  checked={
                    selectedItemIds.size === cart.orderItems.length &&
                    cart.orderItems.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer"
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
            <div className="md:hidden flex items-center gap-2 bg-white border border-amazon-border shadow-sm rounded-sm px-4 py-3">
              <input
                type="checkbox"
                checked={
                  selectedItemIds.size === cart.orderItems.length &&
                  cart.orderItems.length > 0
                }
                onChange={handleToggleSelectAll}
                className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer"
                aria-label="Select all items"
              />
              <span className="text-[11px] font-black text-amazon-text uppercase tracking-widest">
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
                  className="bg-white  rounded-sm overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="flex items-center p-4 ">
                    <input
                      type="checkbox"
                      checked={allShopSelected}
                      onChange={() => handleToggleShopSelect(shopId)}
                      className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer shrink-0"
                      aria-label={`Select all from ${shopName}`}
                    />
                    <Store className="w-[18px] h-[18px] text-amazon-textMuted ml-3" />
                    <span className="text-[13px] font-black text-amazon-text ml-2 truncate uppercase tracking-widest">
                      {shopName}
                    </span>
                    <ChevronRight className="w-4 h-4 text-amazon-textMuted ml-1 shrink-0" />
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
                  <div className="p-4 ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-amazon-textMuted uppercase tracking-widest">
                        <Ticket className="w-4 h-4 text-amazon-btnSecondary" />
                        <span>Shop Voucher</span>
                      </div>
                      {vouchers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenShopVoucherModal(shopId, shopName)
                          }
                          className="text-[12px] text-amazon-btnSecondary hover:brightness-95 hover:underline tracking-widest transition-colors"
                        >
                          Select or enter code ({vouchers.length} available)
                        </button>
                      ) : (
                        <span className="text-[12px] text-amazon-textMuted tracking-widest">
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
        selectedCodes={voucherModal.selectedCodes}
        onConfirm={handleVoucherConfirm}
        scope={voucherModal.scope}
        orderId={cart?.orderId}
      />
    </div>
  );
}
