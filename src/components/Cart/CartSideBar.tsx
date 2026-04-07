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
  Loader2,
  Trash2,
  Minus,
  Plus,
  Ticket,
  Store,
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
  <div className="flex items-center gap-2 py-1.5">
    <div className="relative w-8 h-8 bg-neutral-100 shrink-0 rounded-sm overflow-hidden border border-amazon-border">
      {component.partImageUrl ? (
        <Image
          src={component.partImageUrl}
          alt={component.partName}
          fill
          sizes="32px"
          className="object-contain p-0.5"
        />
      ) : (
        <div className="w-full h-full bg-white" />
      )}
    </div>
    <span className="text-xs text-amazon-text capitalize truncate flex-1">
      {component.partName}
    </span>
    <span className="text-[10px] font-bold text-amazon-textMuted shrink-0">
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
        className={`flex flex-col gap-1 p-3 transition-colors ${
          selected ? "bg-neutral-50" : "hover:bg-neutral-50"
        }`}
      >
        <div className="flex gap-3">
          {/* Checkbox */}
          <div className="flex items-start pt-1 shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.orderItemId)}
              className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer"
              aria-label={`Select ${item.productName}`}
            />
          </div>

          {/* Image */}
          <div className="relative w-20 h-20 shrink-0 bg-bgSecondary">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={item.productName}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-amazon-textMuted" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[13px] font-bold text-amazon-text line-clamp-2 pr-4 leading-snug uppercase tracking-wide">
                {item.productName}
              </span>
              <span className="text-[13px] font-bold text-amazon-price shrink-0 mt-0.5">
                {item.totalPrice.toLocaleString()}₫
              </span>
            </div>

            {/* Quantity & Remove */}
            <div className="flex items-center gap-2 mb-1 mt-1">
              <div className="flex items-center gap-0 border border-amazon-border rounded-sm bg-white">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.orderItemId, item.quantity - 1)
                  }
                  disabled={isStrictCustomRequest || item.quantity <= 1 || updatingQuantity}
                  className="w-6 h-7 flex items-center justify-center text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-7 h-7 flex items-center justify-center text-xs font-bold text-amazon-text border-x border-amazon-border tabular-nums">
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
                  className="w-6 h-7 flex items-center justify-center text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.orderItemId)}
                disabled={removing}
                className="text-amazon-textMuted hover:text-red-600 transition-colors disabled:opacity-40 ml-auto"
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
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amazon-textMuted hover:text-amazon-link transition-colors w-fit mt-auto"
              >
                {expanded ? (
                  <>
                    Hide components <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    {item.orderItemComponents.length} components{" "}
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expanded component list */}
        {isCustom && expanded && (
          <div className="ml-6 pl-3 border-l-2 border-amazon-border mt-2 space-y-0.5">
            {item.orderItemComponents.map((comp) => (
              <SidebarComponentRow key={comp.partId} component={comp} />
            ))}
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
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden={!isCartOpen}
      />

      {/* SIDEBAR CONTENT */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white border-l border-amazon-border z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-amazon-border items-center">
          <div className="flex items-baseline gap-3">
            <h2
              id="cart-title"
              className="text-xl font-black font-oswald uppercase tracking-wider text-amazon-text"
            >
              Shopping Cart
            </h2>
            <Link
              href="/cart"
              onClick={handleClose}
              className="text-xs font-bold tracking-widest uppercase text-amazon-textMuted hover:text-amazon-text transition-colors"
            >
              View cart
            </Link>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors text-amazon-textMuted hover:text-amazon-text"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 " />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {serverCartLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-amazon-textMuted space-y-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest text-amazon-btnSecondary mt-4">Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-amazon-textMuted space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p className="font-medium text-amazon-text">Your cart is currently empty.</p>
              <Link
                href="/shop/all-products"
                onClick={handleClose}
                className="bg-amazon-btnPrimary text-amazon-text px-6 py-3 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-colors inline-block text-center rounded-sm mt-2 shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            shopGroups.map(({ shopId, shopName, items: shopItems }) => {
              const shopVouchers =
                shopVoucherGroups.find((g) => g.shopId === shopId)?.vouchers ??
                [];
              const shopPreview = cartPreview?.shopPreviews.find(
                (s) => s.shopId === shopId,
              );
              return (
                <div key={shopId} className="space-y-0">
                  {/* Shop Header */}
                  <div className="flex items-center gap-2 px-1 ">
                    <Store className="w-4 h-4 text-amazon-textMuted shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-amazon-text truncate">
                      {shopName}
                    </span>
                  </div>

                  {/* Shop Items */}
                  <div className="space-y-3 pt-2">
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
                  <div className="px-1 py-2 border-t border-amazon-border mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amazon-textMuted">
                        <Ticket className="w-3.5 h-3.5 text-amazon-btnSecondary" />
                        <span className="font-bold uppercase tracking-wider text-[10px]">Shop Voucher</span>
                      </div>
                      {shopVouchers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenShopVoucherModal(shopId, shopName)
                          }
                          className="text-[10px] font-black uppercase tracking-widest text-amazon-btnSecondary hover:brightness-95 hover:underline transition-colors"
                        >
                          Select code ({shopVouchers.length})
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">Enter Code</span>
                      )}
                    </div>
                    {/* Shop voucher error */}
                    {shopPreview?.shopVoucherError && (
                      <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-wide">
                        {shopPreview.shopVoucherError}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-amazon-border p-6 space-y-4 bg-neutral-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {/* Ameko Platform Voucher button */}
            {systemVouchers.length > 0 && (
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleOpenSystemVoucherModal}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenSystemVoucherModal()}
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 border border-amazon-border rounded-sm text-sm text-amazon-text hover:border-amazon-focus transition-colors cursor-pointer bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 shrink-0 text-amazon-btnSecondary" />
                    <span className="font-bold text-[11px] tracking-wider">
                      {selectedSystemVoucherCode
                        ? `Selected 1 system voucher`
                        : `Platform Voucher (${systemVouchers.length} available)`}
                    </span>
                  </div>
                  {!!selectedSystemVoucherCode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedSystemVoucher(null));
                      }}
                      className="p-1 text-amazon-textMuted hover:text-red-600 transition-colors"
                      aria-label="Remove system voucher"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {/* System voucher error */}
                {cartPreview?.systemVoucherError && (
                  <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1 px-1">
                    {cartPreview.systemVoucherError}
                  </p>
                )}
              </div>
            )}

            {/* Select All */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedItemIds.size === items.length && items.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 accent-amazon-btnPrimary cursor-pointer"
                  aria-label="Select all items"
                />
                <span className="text-[11px] font-black text-amazon-text uppercase tracking-widest">
                  Select All ({items.length})
                </span>
              </label>
              <span className="text-[11px] font-bold text-amazon-textMuted uppercase tracking-widest">
                {selectedItemIds.size} selected
              </span>
            </div>

            <p className="text-amazon-textMuted text-[10px]">
              Shipping & taxes calculated at checkout
            </p>

            {/* Applied Vouchers Summary */}
            {(!!selectedSystemVoucherCode ||
              Object.values(selectedShopVoucherCodesMap).some(
                (v) => v && v.length > 0,
              )) && (
              <div className="space-y-1.5 py-2 border-t border-amazon-border">
                <span className="text-[10px] font-black text-amazon-textMuted uppercase tracking-widest">
                  Applied Vouchers
                </span>

                {/* System voucher */}
                {selectedSystemVoucherCode &&
                  applicableVouchers?.systemVouchers && (() => {
                    const sv = applicableVouchers.systemVouchers.find(
                      (v) => v.code === selectedSystemVoucherCode,
                    );
                    if (!sv) return null;
                    const totalShopDiscount =
                      cartPreview?.shopPreviews?.reduce(
                        (sum, shop) => sum + (shop.shopDiscountAmount || 0),
                        0,
                      ) || 0;
                    const systemDiscountAmount =
                      (cartPreview?.totalDiscountAmount || 0) - totalShopDiscount;
                    return (
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-1.5 pt-1">
                          <Ticket className="w-3 h-3 text-amazon-btnSecondary" />
                          <span className="text-amazon-text uppercase tracking-wider">{sv.code}</span>
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
                    );
                  })()}

                {/* Shop vouchers — iterate through ALL applied codes per shop */}
                {applicableVouchers?.shopVoucherGroups &&
                  Object.entries(selectedShopVoucherCodesMap).map(
                    ([shopId, vCodes]) => {
                      if (!vCodes || vCodes.length === 0) return null;
                      const group = applicableVouchers.shopVoucherGroups.find(
                        (g) => g.shopId === shopId,
                      );
                      if (!group) return null;
                      const shopPreview = cartPreview?.shopPreviews.find(
                        (s) => s.shopId === shopId,
                      );

                      return vCodes.map((code) => {
                        const voucher = group.vouchers.find((v) => v.code === code);
                        if (!voucher) return null;

                        return (
                          <div
                            key={`${shopId}-${code}`}
                            className="flex items-center justify-between text-[11px] font-bold mt-1"
                          >
                            <div className="flex items-center gap-1.5 pt-1">
                              <Ticket className="w-3 h-3 text-amazon-btnSecondary" />
                              <span className="text-amazon-text uppercase tracking-wider">
                                {voucher.code}
                              </span>
                              <span className="text-amazon-textMuted uppercase tracking-wider">
                                ({shopPreview?.shopName ?? shopId})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const newCodes = vCodes.filter((c) => c !== code);
                                  dispatch(
                                    setSelectedShopVouchers({
                                      shopId,
                                      voucherCodes: newCodes,
                                    }),
                                  );
                                }}
                                className="p-1 text-amazon-textMuted hover:text-red-600 transition-colors"
                                aria-label={`Remove voucher ${voucher.code}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    },
                  )}

                {/* Total discount */}
                {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-[11px] font-bold pt-2 border-t border-amazon-border mt-2">
                    <span className="text-amazon-textMuted uppercase tracking-widest">Total Discount</span>
                    <span className="text-green-600">
                      -{formatCurrency(cartPreview!.totalDiscountAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!hasSelection || isCalculatingPreview}
                className={`w-full py-4 px-4 flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-[0.15em] rounded-sm transition-colors duration-200 shadow-sm ${
                  hasSelection && !isCalculatingPreview
                    ? "bg-amazon-btnPrimary text-amazon-text hover:brightness-95"
                    : "bg-neutral-200 text-amazon-textMuted cursor-not-allowed border border-amazon-border"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isCalculatingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : hasSelection ? (
                  `Checkout • ${formatCurrency((cartPreview?.totalCartSubTotal || 0) - (cartPreview?.totalDiscountAmount || 0))}`
                ) : (
                  "Select Items"
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
