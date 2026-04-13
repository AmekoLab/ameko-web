"use client";

import {
  FC,
  useEffect,
  useRef,
  useCallback,
  useState,
  memo,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
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
  Tag,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  setCartOpen,
  fetchServerCart,
  removeServerCartItem,
  toggleItemSelection,
  setAllSelectedItems,
} from "@/src/store/slices/cartSlice";
import {
  selectSystemVouchers,
  selectShopVoucherGroups,
  fetchApplicableVouchersThunk,
  setSelectedSystemVoucher,
  setSelectedShopVouchers,
  selectSelectedSystemVoucherCode,
} from "@/src/store/slices/voucherSlice";
import { OrderItem, OrderItemComponent } from "@/src/types/order.types";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { orderService } from "@/src/services/order.service";
import { Voucher } from "@/src/services/voucher.service";
import VoucherSelectorModal from "@/src/components/Cart/VoucherSelectorModal";
import { useCartPreviewLogic } from "@/src/hooks/useCartPreviewLogic";

const formatCurrency = (amount: number) => `${amount.toLocaleString()}₫`;

// ─── Component Row (part inside a custom build) ────────────
const SidebarComponentRow: FC<{ component: OrderItemComponent }> = ({
  component,
}) => (
  <div className="flex items-center gap-2.5 py-2">
    <div className="relative w-8 h-8 bg-white shrink-0 rounded-md overflow-hidden border border-neutral-100">
      {component.partImageUrl ? (
        <Image
          src={component.partImageUrl}
          alt={component.partName}
          fill
          sizes="32px"
          className="object-contain p-0.5"
        />
      ) : (
        <div className="w-full h-full bg-neutral-50" />
      )}
    </div>
    <span className="text-xs text-neutral-600 truncate flex-1">
      {component.partName}
    </span>
    <span className="text-[11px] text-neutral-400 shrink-0">
      ×{component.quantity}
    </span>
  </div>
);

// ─── Cart Item in Sidebar ──────────────────────────────────
interface SidebarItemProps {
  item: OrderItem;
  onRemove: (id: string) => void;
  removing: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  updatingQuantity: boolean;
}

const SidebarCartItem: FC<SidebarItemProps> = memo(
  ({
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

    const displayImage =
      item.productImage ||
      (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

    return (
      <div
        className={`flex flex-col gap-1 px-4 py-3 transition-colors ${
          selected ? "bg-amber-50/30" : "hover:bg-neutral-50/60"
        }`}
      >
        <div className="flex gap-3">
          {/* Checkbox */}
          <div className="flex items-start pt-1 shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.orderItemId)}
              className="w-[16px] h-[16px] accent-neutral-900 cursor-pointer rounded"
              aria-label={`Select ${item.productName}`}
            />
          </div>

          {/* Image */}
          <div className="relative w-[72px] h-[72px] shrink-0 bg-neutral-50 rounded-lg border border-neutral-100 overflow-hidden">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={item.productName}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-sm text-neutral-800 line-clamp-2 pr-3 leading-snug">
                {item.productName}
              </span>
              <span className="text-sm font-semibold text-neutral-900 shrink-0 mt-0.5 tabular-nums">
                {item.totalPrice.toLocaleString()}₫
              </span>
            </div>

            {/* Quantity & Remove */}
            <div className="flex items-center gap-2 mt-auto">
              <div className="flex items-center border border-neutral-200 rounded-lg bg-white">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.orderItemId, item.quantity - 1)
                  }
                  disabled={isStrictCustomRequest || item.quantity <= 1 || updatingQuantity}
                  className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-l-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 h-7 flex items-center justify-center text-xs text-neutral-800 border-x border-neutral-200 tabular-nums">
                  {updatingQuantity ? (
                    <Loader2 className="w-3 h-3 animate-spin text-neutral-400" />
                  ) : (
                    item.quantity
                  )}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(item.orderItemId, item.quantity + 1)
                  }
                  disabled={isStrictCustomRequest || item.quantity >= 99 || updatingQuantity}
                  className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-r-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.orderItemId)}
                disabled={removing}
                className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all disabled:opacity-40 ml-auto"
                aria-label={`Remove ${item.productName}`}
              >
                {removing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Custom build toggle */}
            {isCustom && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors w-fit mt-2"
              >
                {expanded ? (
                  <>
                    Hide components <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    {item.orderItemComponents.length} components{" "}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expanded component list */}
        {isCustom && expanded && (
          <div className="ml-7 pl-3 border-l-2 border-neutral-100 mt-2">
            <div className="divide-y divide-neutral-50">
              {item.orderItemComponents.map((comp) => (
                <SidebarComponentRow key={comp.partId} component={comp} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

SidebarCartItem.displayName = "SidebarCartItem";

// ═════════════════════════════════════════════════════════════
// Main CartSidebar component
// ═════════════════════════════════════════════════════════════
export const CartSidebar: FC = memo(() => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isCartOpen, serverCart, serverCartLoading } = useAppSelector(
    (state) => state.cart,
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const systemVouchers = useAppSelector(selectSystemVouchers);
  const shopVoucherGroups = useAppSelector(selectShopVoucherGroups);
  const selectedSystemVoucherCode = useAppSelector(
    selectSelectedSystemVoucherCode,
  );
  const selectedShopVoucherCodesMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherCodes,
  );
  const applicableVouchers = useAppSelector(
    (state) => state.voucher.applicableVouchers,
  );
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Optimistic local items — updated immediately on quantity change so
  // useCartPreviewLogic receives fresh quantities without waiting for a
  // full server fetch to complete.
  const [localItems, setLocalItems] = useState(() => serverCart?.orderItems ?? []);

  // Keep localItems in sync whenever the server cart updates
  useEffect(() => {
    setLocalItems(serverCart?.orderItems ?? []);
  }, [serverCart]);

  const items = useMemo(() => serverCart?.orderItems ?? [], [serverCart]);

  // Group items by shopId
  const shopGroups = useMemo(() => {
    const map = new Map<
      string,
      { shopId: string; shopName: string; items: OrderItem[] }
    >();
    items.forEach((item) => {
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
  }, [items]);

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

  const hasSelection = selectedItemIds.size > 0;

  // Preview via custom hook — uses localItems so optimistic quantity
  // changes immediately change the quantity signature and fire the API.
  const { cartPreview, isCalculatingPreview } = useCartPreviewLogic(
    localItems,
    selectedItemIds,
    !!updatingQuantityId || !!removingId,
  );

  // ── Voucher modal state ──
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

  const handleOpenSystemVoucherModal = useCallback(() => {
    setVoucherModal({
      isOpen: true,
      title: "Chọn Ameko Voucher",
      vouchers: systemVouchers,
      subtotal: cartPreview?.totalCartSubTotal ?? 0,
      brandLabel: "Ameko",
      selectedCodes: selectedSystemVoucherCode ? [selectedSystemVoucherCode] : [],
      scope: { type: "system" },
    });
  }, [systemVouchers, cartPreview, selectedSystemVoucherCode]);

  const handleOpenShopVoucherModal = useCallback(
    (shopId: string, shopName: string) => {
      const group = shopVoucherGroups.find((g) => g.shopId === shopId);
      const shopSubtotal = items
        .filter(
          (i) => i.shopId === shopId && selectedItemIds.has(i.orderItemId),
        )
        .reduce((s, i) => s + i.totalPrice, 0);
      setVoucherModal({
        isOpen: true,
        title: `Chọn Voucher từ ${shopName}`,
        vouchers: group?.vouchers ?? [],
        subtotal: shopSubtotal,
        brandLabel: shopName,
        selectedCodes: selectedShopVoucherCodesMap[shopId] ?? [],
        scope: { type: "shop", shopId },
      });
    },
    [items, selectedItemIds, shopVoucherGroups, selectedShopVoucherCodesMap],
  );

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

  const handleToggleSelect = useCallback((id: string) => {
    if (!id) return;
    dispatch(toggleItemSelection(id));
  }, [dispatch]);

  const handleToggleSelectAll = useCallback(() => {
    const allIds = (serverCart?.orderItems ?? [])
      .map((item) => item.orderItemId)
      .filter(Boolean);
    if (selectedItemIds.size === allIds.length) {
      dispatch(setAllSelectedItems([]));
    } else {
      dispatch(setAllSelectedItems(allIds));
    }
  }, [serverCart, selectedItemIds.size, dispatch]);

  const handleRemoveItem = useCallback(
    async (orderItemId: string) => {
      setRemovingId(orderItemId);
      await dispatch(removeServerCartItem(orderItemId));
      // Remove from selection
      dispatch(setAllSelectedItems(
        selectedItemIdsArray.filter((id) => id !== orderItemId),
      ));
      setRemovingId(null);
    },
    [dispatch, selectedItemIdsArray],
  );

  // Update item quantity with debounced DB write + instant optimistic UI
  const handleUpdateQuantity = useCallback(
    async (orderItemId: string, newQuantity: number) => {
      if (!Number.isInteger(newQuantity) || newQuantity < 1 || newQuantity > 99)
        return;

      // Snapshot for rollback
      const previousItems = localItems;

      // 1. Instant optimistic UI update
      setLocalItems((prev) =>
        prev.map((item) =>
          item.orderItemId === orderItemId
            ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
            : item,
        ),
      );

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
            // DB confirmed — sync authoritative state, unblock preview
            dispatch(fetchServerCart());
            setUpdatingQuantityId(null);
          } else {
            // Rollback optimistic update
            setLocalItems(previousItems);
            toast.error(res.message || "Failed to update quantity");
            setUpdatingQuantityId(null);
          }
        } catch {
          setLocalItems(previousItems);
          toast.error("Failed to update quantity");
          setUpdatingQuantityId(null);
        }
      }, 600);
    },
    [dispatch, localItems],
  );

  // Fetch cart & applicable vouchers when sidebar opens
  useEffect(() => {
    if (isCartOpen && isAuthenticated) {
      dispatch(fetchApplicableVouchersThunk());
      dispatch(fetchServerCart()).then((action) => {
        if (fetchServerCart.fulfilled.match(action)) {
          const cartData = action.payload;
          if (cartData?.orderItems) {
            dispatch(setAllSelectedItems(
              cartData.orderItems
                .map((item: { orderItemId: string }) => item.orderItemId)
                .filter(Boolean),
            ));
          }
        }
      });
    }
  }, [isCartOpen, isAuthenticated, dispatch]);

  const handleCheckout = useCallback(() => {
    dispatch(setCartOpen(false));
    const validIds = Array.from(selectedItemIds).filter(Boolean);
    if (validIds.length === 0) {
      router.push("/cart");
      return;
    }
    const params = new URLSearchParams();
    validIds.forEach((id) => params.append("items", id));
    router.push(`/checkout?${params.toString()}`);
  }, [dispatch, router, selectedItemIds]);

  const handleClose = useCallback(() => {
    dispatch(setCartOpen(false));
  }, [dispatch]);

  // Lock body scroll WITHOUT layout shift
  useEffect(() => {
    if (isCartOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      const header = document.querySelector("header");
      if (header) {
        (header as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      const header = document.querySelector("header");
      if (header) {
        (header as HTMLElement).style.paddingRight = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      const header = document.querySelector("header");
      if (header) {
        (header as HTMLElement).style.paddingRight = "";
      }
    };
  }, [isCartOpen]);

  // Close on click outside (skip when voucher modal is open)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        voucherModal.isOpen ||
        !sidebarRef.current ||
        sidebarRef.current.contains(event.target as Node)
      ) {
        return;
      }
      handleClose();
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen, handleClose, voucherModal.isOpen]);

  // Close on ESC key (skip when voucher modal is open — let the modal handle its own ESC)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCartOpen && !voucherModal.isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isCartOpen, handleClose, voucherModal.isOpen]);

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden={!isCartOpen}
      />

      {/* SIDEBAR CONTENT */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-baseline gap-3">
            <h2
              id="cart-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Shopping Cart
            </h2>
            <Link
              href="/cart"
              onClick={handleClose}
              className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              View full cart
            </Link>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-700"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {serverCartLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3">
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-sm text-neutral-500">Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-600">Your cart is empty</p>
              <Link
                href="/shop/all-products"
                onClick={handleClose}
                className="bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {shopGroups.map(({ shopId, shopName, items: shopItems }) => {
                const shopVouchers =
                  shopVoucherGroups.find((g) => g.shopId === shopId)?.vouchers ??
                  [];
                const shopPreview = cartPreview?.shopPreviews.find(
                  (s) => s.shopId === shopId,
                );
                return (
                  <div key={shopId}>
                    {/* Shop Header */}
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-neutral-50/80 border-b border-neutral-100">
                      <Store className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-xs font-medium text-neutral-700 truncate">
                        {shopName}
                      </span>
                    </div>

                    {/* Shop Items */}
                    <div className="divide-y divide-neutral-50">
                      {shopItems.map((item) => (
                        <SidebarCartItem
                          key={item.orderItemId}
                          item={item}
                          onRemove={handleRemoveItem}
                          removing={removingId === item.orderItemId}
                          selected={selectedItemIds.has(item.orderItemId)}
                          onToggleSelect={handleToggleSelect}
                          onUpdateQuantity={handleUpdateQuantity}
                          updatingQuantity={
                            updatingQuantityId === item.orderItemId
                          }
                        />
                      ))}
                    </div>

                    {/* Shop Voucher Footer */}
                    <div className="px-5 py-3 border-t border-neutral-100 flex flex-col gap-2 bg-neutral-50/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Ticket className="w-3.5 h-3.5 text-amber-500" />
                          <span>Shop Voucher</span>
                        </div>
                        {shopVouchers.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenShopVoucherModal(shopId, shopName)
                            }
                            className="text-xs text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                          >
                            Select ({shopVouchers.length})
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">Enter code</span>
                        )}
                      </div>

                      {/* Shop voucher error */}
                      {shopPreview?.shopVoucherError && (
                        <p className="text-red-500 text-xs">
                          {shopPreview.shopVoucherError}
                        </p>
                      )}

                      {/* Applied Vouchers Breakdown UI (Sidebar Optimized) */}
                      {(() => {
                        const appliedVouchers = shopPreview?.appliedVoucherBreakdowns || [];
                        if (appliedVouchers.length === 0) return null;

                        return (
                          <div className="p-3 bg-white border border-neutral-200 border-dashed rounded-lg">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Tag className="w-3 h-3 text-green-600" />
                              <span className="text-[11px] font-medium text-neutral-600">
                                Applied Discounts
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {appliedVouchers.map((voucher: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="text-neutral-500 flex items-center gap-1.5">
                                    <span className="font-mono text-[11px] text-neutral-700">{voucher.voucherCode}</span>
                                    {voucher.discountType === "FixedAmount" && (
                                      <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-medium">Fixed</span>
                                    )}
                                    {voucher.discountType === "Percentage" && (
                                      <span className="text-[9px] bg-green-50 text-green-600 px-1 py-0.5 rounded font-medium">% Off</span>
                                    )}
                                  </span>
                                  <span className="font-medium text-green-600">
                                    -{voucher.discountAmount.toLocaleString()}₫
                                  </span>
                                </div>
                              ))}
                            </div>
                            {appliedVouchers.length > 1 && (
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100 text-xs">
                                <span className="text-neutral-600">Total shop discount</span>
                                <span className="font-semibold text-green-600">
                                  -{(shopPreview?.shopDiscountAmount || 0).toLocaleString()}₫
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 p-5 space-y-4 bg-white shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.06)]">
            {/* COMPACT Ameko Platform Voucher */}
            {systemVouchers.length > 0 && (
              <div className="pb-3 border-b border-neutral-100 mb-1">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleOpenSystemVoucherModal}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenSystemVoucherModal()}
                  className="flex items-center justify-between text-sm text-neutral-600 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center">
                      <Ticket className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="text-sm">Ameko Voucher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSystemVoucherCode ? (
                      <div className="flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                        <span className="text-xs font-mono text-neutral-700">{selectedSystemVoucherCode}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedSystemVoucher(null));
                          }}
                          className="text-neutral-400 hover:text-red-500 transition-colors ml-0.5"
                          aria-label="Remove system voucher"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 flex items-center gap-0.5">
                        {systemVouchers.length} available <ChevronRight className="w-3 h-3 inline" />
                      </span>
                    )}
                  </div>
                </div>
                {/* System voucher error */}
                {cartPreview?.systemVoucherError && (
                  <p className="text-red-500 text-xs mt-2 text-right">
                    {cartPreview.systemVoucherError}
                  </p>
                )}
              </div>
            )}

            {/* Select All & Selection Count */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedItemIds.size === items.length && items.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-[16px] h-[16px] accent-neutral-900 cursor-pointer rounded"
                  aria-label="Select all items"
                />
                <span className="text-sm text-neutral-700">
                  Select All ({items.length})
                </span>
              </label>
              <span className="text-xs text-neutral-400">
                {selectedItemIds.size} selected
              </span>
            </div>

            <p className="text-xs text-neutral-400">
              Shipping & taxes calculated at checkout
            </p>

            {/* Note: The old redundant 'Applied System Voucher' block was completely removed here to save space! */}

            {/* Split Discounts for transparency */}
            {(() => {
              const totalShopDiscount =
                cartPreview?.shopPreviews?.reduce(
                  (sum, shop) => sum + (shop.shopDiscountAmount || 0),
                  0,
                ) || 0;
              const systemDiscountAmount =
                (cartPreview?.totalDiscountAmount || 0) - totalShopDiscount;
              if (totalShopDiscount <= 0 && systemDiscountAmount <= 0) return null;
              return (
                <div className="space-y-2 pt-3 border-t border-neutral-100">
                  {totalShopDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Shop discount</span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(totalShopDiscount)}
                      </span>
                    </div>
                  )}
                  {systemDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Platform discount</span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(systemDiscountAmount)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div>
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!hasSelection || isCalculatingPreview}
                className={`w-full py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  hasSelection && !isCalculatingPreview
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] shadow-sm"
                    : "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                }`}
              >
                {isCalculatingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : hasSelection ? (
                  `Checkout · ${formatCurrency((cartPreview?.totalCartSubTotal || 0) - (cartPreview?.totalDiscountAmount || 0))}`
                ) : (
                  "Select items to checkout"
                )}
              </button>
            </div>
          </div>
        )}
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
        orderId={serverCart?.orderId}
      />
    </>
  );
});

CartSidebar.displayName = "CartSidebar";
