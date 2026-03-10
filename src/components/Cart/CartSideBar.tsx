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
  setSelectedSystemVouchers,
  setSelectedShopVouchers,
  selectSelectedSystemVoucherIds,
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
    <div className="relative w-8 h-8 bg-gray-50 shrink-0 rounded overflow-hidden border border-gray-100">
      {component.partImageUrl ? (
        <Image
          src={component.partImageUrl}
          alt={component.partName}
          fill
          sizes="32px"
          className="object-contain p-0.5"
        />
      ) : (
        <div className="w-full h-full bg-gray-100" />
      )}
    </div>
    <span className="text-xs text-gray-600 capitalize truncate flex-1">
      {component.partName}
    </span>
    <span className="text-[10px] text-gray-400 shrink-0">
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

    const displayImage =
      item.productImage ||
      (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

    return (
      <div
        className={`flex flex-col gap-1 p-3 rounded-lg transition-colors ${selected ? "bg-red-50/40" : ""}`}
      >
        <div className="flex gap-3">
          {/* Checkbox */}
          <div className="flex items-start pt-1 shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.orderItemId)}
              className="w-4 h-4 accent-[#ce2a32] cursor-pointer"
              aria-label={`Select ${item.productName}`}
            />
          </div>

          {/* Image */}
          <div className="relative w-20 h-20 shrink-0 border border-gray-100 rounded-sm bg-[#f9f9f9]">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={item.productName}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-200" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-black line-clamp-2 pr-4 leading-tight capitalize">
                {item.productName}
              </span>
              <span className="text-sm font-bold text-gray-900 shrink-0">
                {item.totalPrice.toLocaleString()}₫
              </span>
            </div>

            {/* Quantity & Remove */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-0 border border-gray-200 rounded">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.orderItemId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1 || updatingQuantity}
                  className="w-6 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 border-x border-gray-200 tabular-nums">
                  {updatingQuantity ? (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  ) : (
                    item.quantity
                  )}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(item.orderItemId, item.quantity + 1)
                  }
                  disabled={item.quantity >= 99 || updatingQuantity}
                  className="w-6 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.orderItemId)}
                disabled={removing}
                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
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
                className="flex items-center gap-1 text-[11px] text-[#ce2a32] hover:underline w-fit mt-auto"
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
          <div className="ml-6 pl-3 border-l-2 border-gray-100 mt-1 space-y-0">
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
  const selectedSystemVoucherIds = useAppSelector(
    selectSelectedSystemVoucherIds,
  );
  const selectedShopVoucherIdsMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherIds,
  );
  const applicableVouchers = useAppSelector(
    (state) => state.voucher.applicableVouchers,
  );
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Global selection from Redux (single source of truth)
  const selectedItemIdsArray = useAppSelector(
    (state) => state.cart.selectedItemIds,
  );
  const selectedItemIds = useMemo(
    () => new Set(selectedItemIdsArray),
    [selectedItemIdsArray],
  );

  const hasSelection = selectedItemIds.size > 0;

  // Preview via custom hook
  const { cartPreview, isCalculatingPreview } = useCartPreviewLogic(
    items,
    selectedItemIds,
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

  const handleOpenSystemVoucherModal = useCallback(() => {
    setVoucherModal({
      isOpen: true,
      title: "Chọn Ameko Voucher",
      vouchers: systemVouchers,
      subtotal: cartPreview?.totalCartSubTotal ?? 0,
      brandLabel: "Ameko",
      selectedIds: selectedSystemVoucherIds,
      scope: { type: "system" },
    });
  }, [systemVouchers, cartPreview, selectedSystemVoucherIds]);

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
        selectedIds: [],
        scope: { type: "shop", shopId },
      });
    },
    [items, selectedItemIds, shopVoucherGroups],
  );

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

  // Update item quantity with optimistic UI
  const handleUpdateQuantity = useCallback(
    async (orderItemId: string, newQuantity: number) => {
      if (!Number.isInteger(newQuantity) || newQuantity < 1 || newQuantity > 99)
        return;

      setUpdatingQuantityId(orderItemId);
      try {
        const res = await orderService.updateCartItemQuantity(
          orderItemId,
          newQuantity,
        );
        if (res.success) {
          dispatch(fetchServerCart());
        } else {
          toast.error(res.message || "Failed to update quantity");
        }
      } catch {
        toast.error("Failed to update quantity");
      } finally {
        setUpdatingQuantityId(null);
      }
    },
    [dispatch],
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
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-baseline gap-3">
            <h2
              id="cart-title"
              className="text-xl font-bold font-oswald uppercase tracking-wide"
            >
              Your Cart
            </h2>
            <Link
              href="/cart"
              onClick={handleClose}
              className="text-xs text-gray-500 underline hover:text-black transition-colors"
            >
              View cart
            </Link>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {serverCartLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is currently empty.</p>
              <Link
                href="/shop/all-products"
                onClick={handleClose}
                className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:bg-gray-900 transition-colors inline-block text-center"
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
                  <div className="flex items-center gap-2 px-1 py-2 border-b border-gray-100">
                    <Store className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 truncate">
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
                  <div className="px-1 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Ticket className="w-3.5 h-3.5 text-[#ce2a32]" />
                        <span>Voucher của Shop</span>
                      </div>
                      {shopVouchers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenShopVoucherModal(shopId, shopName)
                          }
                          className="text-xs font-medium text-[#ce2a32] hover:underline"
                        >
                          Chọn mã ({shopVouchers.length})
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Nhập mã</span>
                      )}
                    </div>
                    {/* Shop voucher error */}
                    {shopPreview?.shopVoucherError && (
                      <p className="text-red-500 text-[11px] mt-1 font-medium">
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
          <div className="border-t border-gray-100 p-6 space-y-4 bg-white">
            {/* Ameko Platform Voucher button */}
            {systemVouchers.length > 0 && (
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleOpenSystemVoucherModal}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenSystemVoucherModal()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 border border-dashed border-[#ce2a32]/40 rounded-sm text-sm text-[#ce2a32] hover:bg-red-50/40 transition-colors cursor-pointer"
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span className="font-medium">
                    {selectedSystemVoucherIds.length > 0
                      ? `Đã chọn ${selectedSystemVoucherIds.length} mã toàn sàn`
                      : `Chọn mã giảm giá toàn sàn (${systemVouchers.length} mã khả dụng)`}
                  </span>
                  {selectedSystemVoucherIds.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedSystemVouchers([]));
                      }}
                      className="ml-auto p-0.5 text-gray-400 hover:text-[#ce2a32]"
                      aria-label="Remove system voucher"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {/* System voucher error */}
                {cartPreview?.systemVoucherError && (
                  <p className="text-red-500 text-[11px] mt-1 font-medium px-1">
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
                  className="w-4 h-4 accent-[#ce2a32] cursor-pointer"
                  aria-label="Select all items"
                />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Select All ({items.length})
                </span>
              </label>
              <span className="text-xs text-gray-400">
                {selectedItemIds.size} selected
              </span>
            </div>

            <p className="text-gray-400 text-xs">
              Shipping & taxes calculated at checkout
            </p>

            {/* Applied Vouchers Summary */}
            {(selectedSystemVoucherIds.length > 0 ||
              Object.values(selectedShopVoucherIdsMap).some(
                (v) => v && v.length > 0,
              )) && (
              <div className="space-y-1.5 py-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Voucher đã chọn
                </span>

                {/* System voucher */}
                {selectedSystemVoucherIds.length > 0 &&
                  applicableVouchers?.systemVouchers && (() => {
                    const sv = applicableVouchers.systemVouchers.find(
                      (v) => v.id === selectedSystemVoucherIds[0],
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
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3 h-3 text-green-500" />
                          <span className="text-gray-600 font-medium">{sv.code}</span>
                          <span className="text-gray-400">(System)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {systemDiscountAmount > 0 && (
                            <span className="text-green-600 font-medium">
                              -{formatCurrency(systemDiscountAmount)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => dispatch(setSelectedSystemVouchers([]))}
                            className="p-0.5 text-gray-400 hover:text-[#ce2a32]"
                            aria-label="Remove system voucher"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                {/* Shop vouchers */}
                {applicableVouchers?.shopVoucherGroups &&
                  Object.entries(selectedShopVoucherIdsMap).map(
                    ([shopId, vIds]) => {
                      if (!vIds || vIds.length === 0) return null;
                      const group = applicableVouchers.shopVoucherGroups.find(
                        (g) => g.shopId === shopId,
                      );
                      const voucher = group?.vouchers.find(
                        (v) => v.id === vIds[0],
                      );
                      if (!voucher) return null;
                      const shopPreview = cartPreview?.shopPreviews.find(
                        (s) => s.shopId === shopId,
                      );
                      return (
                        <div
                          key={shopId}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <Ticket className="w-3 h-3 text-green-500" />
                            <span className="text-gray-600 font-medium">
                              {voucher.code}
                            </span>
                            <span className="text-gray-400">
                              ({shopPreview?.shopName ?? shopId})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {(shopPreview?.shopDiscountAmount ?? 0) > 0 && (
                              <span className="text-green-600 font-medium">
                                -{formatCurrency(shopPreview!.shopDiscountAmount)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  setSelectedShopVouchers({
                                    shopId,
                                    voucherIds: [],
                                  }),
                                )
                              }
                              className="p-0.5 text-gray-400 hover:text-[#ce2a32]"
                              aria-label={`Remove voucher ${voucher.code}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}

                {/* Total discount */}
                {(cartPreview?.totalDiscountAmount ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-gray-100">
                    <span className="text-gray-500 font-medium">Tổng giảm</span>
                    <span className="text-green-600 font-bold">
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
                className={`w-full py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${
                  hasSelection && !isCalculatingPreview
                    ? "bg-[#1a1a1a] hover:bg-black text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isCalculatingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Calculating...
                  </>
                ) : hasSelection ? (
                  `Checkout • ${formatCurrency(cartPreview?.finalTotalAmount || 0)}`
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
        selectedIds={voucherModal.selectedIds}
        onConfirm={handleVoucherConfirm}
        orderId={serverCart?.orderId}
      />
    </>
  );
});

CartSidebar.displayName = "CartSidebar";
