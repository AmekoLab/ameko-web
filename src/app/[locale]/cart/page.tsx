"use client";

import { FC, useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { orderService } from "@/src/services/order.service";
import { toast } from "react-toastify";
import {
  CartData,
  OrderItem,
  OrderItemComponent,
  CartPreviewData,
  ShopPreview,
  AppliedVoucherBreakdown,
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

const formatCurrency = (amount: number) => `${amount.toLocaleString()}₫`;

const ROUTES = {
  SHOP: "/shop/all-products",
  CHECKOUT: "/checkout",
} as const;

const CartSkeleton: FC = () => (
  <div className="min-h-screen bg-neutral-50">
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 lg:py-14 animate-pulse">
      <div className="h-8 w-48 bg-neutral-200 rounded-lg mb-10" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-neutral-200/80 p-5 space-y-4"
            >
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-neutral-200 rounded" />
                <div className="w-5 h-5 bg-neutral-200 rounded" />
                <div className="h-5 w-32 bg-neutral-200 rounded" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-5 h-5 bg-neutral-200 rounded" />
                <div className="w-20 h-20 bg-neutral-100 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                </div>
                <div className="h-4 w-20 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white border border-neutral-200/80 rounded-xl p-6 space-y-4">
            <div className="h-6 w-40 bg-neutral-200 rounded" />
            <div className="h-10 w-full bg-neutral-200 rounded-lg" />
            <div className="h-12 w-full bg-neutral-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EmptyCart: FC = () => {
  const t = useTranslations("CartPage");
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
        <ShoppingBag className="w-9 h-9 text-neutral-400" />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-800 mb-3">
        {t("emptyCartTitle")}
      </h1>
      <p className="text-neutral-500 mb-8 max-w-md text-sm leading-relaxed">
        {t("emptyCartDescription")}
      </p>
      <Link
        href={ROUTES.SHOP}
        className="bg-neutral-900 text-white px-8 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors duration-200 rounded-lg"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
};

const ComponentRow: FC<{ component: OrderItemComponent }> = ({ component }) => {
  const t = useTranslations("CartPage");
  return (
    <div className="flex items-center gap-3 py-2.5 px-3">
      <div className="relative w-10 h-10 bg-white shrink-0 border border-neutral-200 rounded-lg overflow-hidden">
        {component.partImageUrl ? (
          <Image
            src={component.partImageUrl}
            alt={component.partName}
            fill
            sizes="40px"
            className="object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[9px] font-medium">
            N/A
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 truncate">
          {component.partName}
        </p>
        <p className="text-xs text-neutral-400">
          {t("qtyLabel", { quantity: component.quantity })}
        </p>
      </div>

      <span className="text-sm text-neutral-500 tabular-nums shrink-0">
        {component.partPriceSnapshot > 0
          ? `${component.partPriceSnapshot.toLocaleString()}₫`
          : t("included")}
      </span>
    </div>
  );
};

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
  const t = useTranslations("CartPage");
  const [expanded, setExpanded] = useState(false);
  const isCustom = item.isCustom && item.orderItemComponents.length > 0;
  const isStrictCustomRequest = item.productName?.includes("Custom Request");

  const displayImage =
    item.productImage ||
    (isCustom ? item.orderItemComponents[0]?.partImageUrl : null);

  const productLink = (item as any).productId || (item as any).assembledProductId 
    ? `/shop/assembled-product/${(item as any).productId || (item as any).assembledProductId}` 
    : '#';

  return (
    <div
      className={`border-t border-neutral-100 last:border-b-0 transition-colors ${
        selected ? "bg-amber-50/40" : "hover:bg-neutral-50/60"
      }`}
    >
      <div className="flex items-center p-4 gap-4">
        <div className="shrink-0 self-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(item.orderItemId)}
            className="w-[18px] h-[18px] accent-neutral-900 cursor-pointer rounded"
            aria-label={t("selectAriaLabel", { name: item.productName })}
          />
        </div>

        <Link 
          href={productLink}
          className="relative w-20 h-20 shrink-0 overflow-hidden bg-neutral-50 rounded-lg border border-neutral-100 block hover:opacity-85 transition-opacity"
        >
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
              <ShoppingBag className="w-6 h-6 text-neutral-300" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0 pr-2">
          <Link href={productLink} className="group/prodlink outline-none block">
            <p className="text-sm font-medium text-neutral-800 group-hover/prodlink:text-blue-600 line-clamp-2 leading-snug transition-colors">
              {item.productName}
            </p>
          </Link>
          {isCustom && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors mt-1.5 w-fit"
            >
              {expanded ? (
                <>
                  {t("hideComponents")} <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  {t("viewComponents", {
                    count: item.orderItemComponents.length,
                  })}{" "}
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
          <div className="md:hidden flex items-center gap-3 mt-2.5">
            <span className="text-sm font-semibold text-neutral-900">
              {item.totalPrice.toLocaleString()}₫
            </span>
            <div className="flex items-center border border-neutral-200 bg-white rounded-lg ml-auto">
              <button
                onClick={() =>
                  onUpdateQuantity(item.orderItemId, item.quantity - 1)
                }
                disabled={
                  isStrictCustomRequest ||
                  item.quantity <= 1 ||
                  updatingQuantity
                }
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={t("decreaseQuantity")}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 h-8 flex items-center justify-center text-sm text-neutral-800 border-x border-neutral-200 tabular-nums">
                {updatingQuantity ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(item.orderItemId, item.quantity + 1)
                }
                disabled={
                  isStrictCustomRequest ||
                  item.quantity >= 99 ||
                  updatingQuantity
                }
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label={t("increaseQuantity")}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.orderItemId)}
              disabled={removing}
              className="text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-40"
              aria-label={t("removeAriaLabel", { name: item.productName })}
            >
              {removing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="hidden md:flex w-28 justify-center shrink-0">
          <span className="text-sm text-neutral-500 tabular-nums">
            {item.unitPrice.toLocaleString()}₫
          </span>
        </div>

        <div className="hidden md:flex w-32 justify-center shrink-0">
          <div className="flex items-center border border-neutral-200 bg-white rounded-lg">
            <button
              onClick={() =>
                onUpdateQuantity(item.orderItemId, item.quantity - 1)
              }
              disabled={
                isStrictCustomRequest || item.quantity <= 1 || updatingQuantity
              }
              className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={t("decreaseQuantity")}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 h-9 flex items-center justify-center text-sm text-neutral-800 border-x border-neutral-200 tabular-nums">
              {updatingQuantity ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.orderItemId, item.quantity + 1)
              }
              disabled={
                isStrictCustomRequest || item.quantity >= 99 || updatingQuantity
              }
              className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={t("increaseQuantity")}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex w-28 justify-end shrink-0">
          <span className="text-sm font-semibold text-neutral-900 tabular-nums">
            {item.totalPrice.toLocaleString()}₫
          </span>
        </div>

        <div className="hidden md:flex w-10 justify-center shrink-0">
          <button
            onClick={() => onRemove(item.orderItemId)}
            disabled={removing}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
            aria-label={t("removeAriaLabel", { name: item.productName })}
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isCustom && expanded && (
        <div className="mx-4 mb-4 ml-[7.5rem] bg-neutral-50 border border-neutral-200/80 rounded-lg overflow-hidden">
          <p className="text-xs font-medium text-neutral-500 px-3 pt-3 pb-1">
            {t("buildComponents")}
          </p>
          <div className="divide-y divide-neutral-100">
            {/* Base Kit Row */}
            {item.baseKitPriceSnapshot != null && (
              <div className="flex items-center gap-3 py-2.5 px-3 bg-white/40">
                <div className="relative w-10 h-10 bg-neutral-50 shrink-0 border border-neutral-200 rounded-lg overflow-hidden flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-neutral-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {t("baseKit")}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {t("qtyLabel", { quantity: 1 })}
                  </p>
                </div>
                <span className="text-sm text-neutral-500 tabular-nums shrink-0">
                  {item.baseKitPriceSnapshot > 0
                    ? `${item.baseKitPriceSnapshot.toLocaleString()}₫`
                    : t("included") || "Kèm theo"}
                </span>
              </div>
            )}
            
            {item.orderItemComponents.map((comp, index) => (
              <ComponentRow key={`${comp.partId}-${index}`} component={comp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderSummaryProps {
  selectedItemIds: Set<string>;
  onCheckout: () => void;
  onOpenSystemVoucher: () => void;
  cartPreview: CartPreviewData | null | undefined;
  isCalculatingPreview: boolean;
}

const OrderSummary: FC<OrderSummaryProps> = ({
  selectedItemIds,
  onCheckout,
  onOpenSystemVoucher,
  cartPreview,
  isCalculatingPreview,
}) => {
  const t = useTranslations("CartPage");
  const dispatch = useAppDispatch();
  const systemVouchers = useAppSelector(selectSystemVouchers);
  const selectedSystemCode = useAppSelector(selectSelectedSystemVoucherCode);
  const applicableVouchers = useAppSelector(
    (state) => state.voucher.applicableVouchers,
  );
  const availableSystemVouchersCount = systemVouchers.length;
  const hasSelection = selectedItemIds.size > 0;

  const selectedSystemVoucher = useMemo(() => {
    if (!selectedSystemCode || !applicableVouchers?.systemVouchers) return null;
    return (
      applicableVouchers.systemVouchers.find(
        (v) => v.code === selectedSystemCode,
      ) ?? null
    );
  }, [selectedSystemCode, applicableVouchers]);

  const totalShopDiscount =
    cartPreview?.shopPreviews?.reduce(
      (sum: number, shop: ShopPreview) => sum + (shop.shopDiscountAmount || 0),
      0,
    ) || 0;
  const systemDiscountAmount =
    (cartPreview?.totalDiscountAmount || 0) - totalShopDiscount;

  return (
    <div className="w-full lg:w-[380px] shrink-0">
      <div className="bg-white border border-neutral-200/80 rounded-xl p-6 sticky top-28">
        <h3 className="text-lg font-semibold text-neutral-900 mb-5">
          {t("orderSummaryTitle")}
        </h3>

        <div className="mb-4 p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/80 transition-all hover:border-neutral-300 hover:shadow-sm">
          <button
            type="button"
            onClick={onOpenSystemVoucher}
            className="w-full flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-medium text-sm text-neutral-800">
                {t("ameloVoucher")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {selectedSystemCode ? (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {t("oneSelected")}
                </span>
              ) : availableSystemVouchersCount > 0 ? (
                <span className="text-xs text-neutral-500">
                  {t("availableVouchers", {
                    count: availableSystemVouchersCount,
                  })}
                </span>
              ) : (
                <span className="text-xs text-neutral-400">
                  {t("selectLabel")}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
            </div>
          </button>
          {cartPreview?.systemVoucherError && (
            <p className="text-red-500 text-xs mt-2 px-1">
              {cartPreview.systemVoucherError}
            </p>
          )}
        </div>

        {selectedSystemVoucher && (
          <div className="mb-4 py-3 border-t border-neutral-100">
            <p className="text-xs font-medium text-neutral-500 mb-2">
              {t("platformVoucher")}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Ticket className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-neutral-700 font-mono text-xs">
                  {selectedSystemVoucher.code}
                </span>
                <span className="text-xs text-neutral-400">
                  {t("systemLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {systemDiscountAmount > 0 && (
                  <span className="text-green-600 text-sm font-medium">
                    -{formatCurrency(systemDiscountAmount)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(setSelectedSystemVoucher(null))}
                  className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  aria-label={t("removeSystemVoucherAriaLabel")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">{t("selectedItemsLabel")}</span>
            <span className="text-neutral-800">
              {t("itemCount", { count: selectedItemIds.size })}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">{t("subtotal")}</span>
            <span className="text-neutral-800">
              {isCalculatingPreview ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                formatCurrency(cartPreview?.totalCartSubTotal || 0)
              )}
            </span>
          </div>

          {totalShopDiscount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500">{t("shopDiscount")}</span>
              <span className="text-green-600 font-medium">
                -{formatCurrency(totalShopDiscount)}
              </span>
            </div>
          )}

          {systemDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-500">{t("platformDiscount")}</span>
              <span className="text-green-600 font-medium">
                -{formatCurrency(systemDiscountAmount)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mt-5 pt-4 border-t border-neutral-200">
          <span className="text-sm font-medium text-neutral-600">
            {t("estimatedTotal")}
          </span>
          <span className="text-xl font-bold text-neutral-900 tabular-nums">
            {isCalculatingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin inline" />
            ) : (
              formatCurrency(
                (cartPreview?.totalCartSubTotal || 0) -
                  (cartPreview?.totalDiscountAmount || 0),
              )
            )}
          </span>
        </div>

        <p className="text-xs text-neutral-400 mt-1.5 mb-6 text-right">
          {t("taxesAndShippingCalculatedAtCheckout")}
        </p>

        <div className="space-y-3">
          <button
            onClick={onCheckout}
            disabled={!hasSelection || isCalculatingPreview}
            className={`w-full py-3.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              hasSelection && !isCalculatingPreview
                ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm active:scale-[0.98]"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
            }`}
          >
            {isCalculatingPreview ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {t("processing")}
              </span>
            ) : hasSelection ? (
              t("checkoutButton", { count: selectedItemIds.size })
            ) : (
              t("selectItemsToCheckout")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const t = useTranslations("CartPage");
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
  const selectedItemIdsArray = useAppSelector(
    (state) => state.cart.selectedItemIds,
  );
  const selectedItemIds = useMemo(
    () => new Set(selectedItemIdsArray),
    [selectedItemIdsArray],
  );
  const isUpdating = !!updatingQuantityId || !!removingId;
  const { cartPreview, isCalculatingPreview } = useCartPreviewLogic(
    cart?.orderItems || [],
    selectedItemIds,
    isUpdating,
  );

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

  const handleToggleSelect = useCallback(
    (id: string) => {
      dispatch(toggleItemSelection(id));
    },
    [dispatch],
  );

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

  const handleToggleShopSelect = useCallback(
    (shopId: string) => {
      const shopItems =
        cart?.orderItems.filter((item) => item.shopId === shopId) ?? [];
      const shopItemIds = shopItems.map((item) => item.orderItemId);
      const allSelected = shopItemIds.every((id) => selectedItemIds.has(id));
      if (allSelected) {
        const next = selectedItemIdsArray.filter(
          (id) => !shopItemIds.includes(id),
        );
        dispatch(setAllSelectedItems(next));
      } else {
        const next = Array.from(
          new Set([...selectedItemIdsArray, ...shopItemIds]),
        );
        dispatch(setAllSelectedItems(next));
      }
    },
    [cart, selectedItemIds, selectedItemIdsArray, dispatch],
  );

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderService.getCart();
        if (res.success) {
          setCart(res.data);
          dispatch(
            setAllSelectedItems(
              res.data?.orderItems?.map((item) => item.orderItemId) || [],
            ),
          );
        } else {
          setError(res.message || t("failedToLoadCart"));
        }
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message || t("failedToLoadCart"));
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [dispatch, t]);

  useEffect(() => {
    dispatch(fetchApplicableVouchersThunk());
  }, [dispatch]);

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
          shopName: item.shopName || t("shopFallbackName"),
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [cart, t]);

  const handleOpenSystemVoucherModal = useCallback(() => {
    const selectedTotal = cart
      ? cart.orderItems
          .filter((i) => selectedItemIds.has(i.orderItemId))
          .reduce((s, i) => s + i.totalPrice, 0)
      : 0;
    setVoucherModal({
      isOpen: true,
      title: t("chooseAmekoVoucher"),
      vouchers: systemVouchersMain,
      subtotal: selectedTotal,
      brandLabel: "Ameko",
      selectedCodes: selectedSystemCode ? [selectedSystemCode] : [],
      scope: { type: "system" },
    });
  }, [cart, selectedItemIds, systemVouchersMain, selectedSystemCode, t]);

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
        title: t("selectVoucherFrom", { shopName }),
        vouchers: group?.vouchers ?? [],
        subtotal: shopSubtotal,
        brandLabel: shopName,
        selectedCodes: selectedShopVoucherCodesMap[shopId] ?? [],
        scope: { type: "shop", shopId },
      });
    },
    [cart, selectedItemIds, shopVoucherGroups, selectedShopVoucherCodesMap, t],
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

  const handleCheckout = useCallback(() => {
    if (selectedItemIds.size === 0) return;
    const params = new URLSearchParams();
    selectedItemIds.forEach((id) => params.append("items", id));
    router.push(`${ROUTES.CHECKOUT}?${params.toString()}`);
  }, [router, selectedItemIds]);

  const handleRemoveItem = useCallback(
    async (orderItemId: string) => {
      setRemovingId(orderItemId);
      try {
        const res = await orderService.deleteCartItem(orderItemId);
        if (res.success) {
          toast.success(t("itemRemoved"));
          dispatch(
            setAllSelectedItems(
              selectedItemIdsArray.filter((id) => id !== orderItemId),
            ),
          );
          const cartRes = await orderService.getCart();
          if (cartRes.success) {
            setCart(cartRes.data);
          }
        } else {
          toast.error(res.message || t("failedToRemoveItem"));
        }
      } catch {
        toast.error(t("failedToRemoveItem"));
      } finally {
        setRemovingId(null);
      }
    },
    [dispatch, selectedItemIdsArray, t],
  );

  const handleUpdateQuantity = useCallback(
    async (orderItemId: string, newQuantity: number) => {
      if (!Number.isInteger(newQuantity) || newQuantity < 1 || newQuantity > 99)
        return;
      if (!cart) return;

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

      setUpdatingQuantityId(orderItemId);

      if (quantityTimerRef.current) clearTimeout(quantityTimerRef.current);
      quantityTimerRef.current = setTimeout(async () => {
        try {
          const res = await orderService.updateCartItemQuantity(
            orderItemId,
            newQuantity,
          );
          if (res.success) {
            setUpdatingQuantityId(null);
          } else {
            const cartRes = await orderService.getCart();
            if (cartRes.success) setCart(cartRes.data);
            toast.error(res.message || t("failedToUpdateQuantity"));
            setUpdatingQuantityId(null);
          }
        } catch {
          const cartRes = await orderService.getCart();
          if (cartRes.success) setCart(cartRes.data);
          toast.error(t("failedToUpdateQuantity"));
          setUpdatingQuantityId(null);
        }
      }, 600);
    },
    [cart, t],
  );

  if (loading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  if (!cart || !cart?.orderItems || cart?.orderItems?.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 lg:py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {t("shoppingCartTitle")}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              {t("itemsInCart", { count: cart.orderItems.length })}
            </p>
          </div>
          <Link
            href={ROUTES.SHOP}
            className="hidden md:flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t("continueShopping")}
          </Link>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-5">
            <div className="hidden md:flex items-center bg-white border border-neutral-200/80 rounded-xl px-4 py-3 text-xs font-medium text-neutral-500">
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="checkbox"
                  checked={
                    selectedItemIds.size === cart.orderItems.length &&
                    cart.orderItems.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="w-[18px] h-[18px] accent-neutral-900 cursor-pointer rounded"
                  aria-label={t("selectAllItemsAriaLabel")}
                />
              </div>
              <span className="flex-1 ml-3">{t("product")}</span>
              <span className="w-28 text-center">{t("price")}</span>
              <span className="w-32 text-center">{t("quantity")}</span>
              <span className="w-28 text-right">{t("total")}</span>
              <span className="w-10 text-center" />
            </div>

            <div className="md:hidden flex items-center gap-3 bg-white border border-neutral-200/80 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                checked={
                  selectedItemIds.size === cart.orderItems.length &&
                  cart.orderItems.length > 0
                }
                onChange={handleToggleSelectAll}
                className="w-[18px] h-[18px] accent-neutral-900 cursor-pointer rounded"
                aria-label={t("selectAllItemsAriaLabel")}
              />
              <span className="text-sm text-neutral-700">
                {t("selectAllMobile", { count: cart.orderItems.length })}
              </span>
            </div>

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
                  className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden"
                >
                  <div className="flex items-center px-4 py-3.5 border-b border-neutral-100">
                    <input
                      type="checkbox"
                      checked={allShopSelected}
                      onChange={() => handleToggleShopSelect(shopId)}
                      className="w-[18px] h-[18px] accent-neutral-900 cursor-pointer shrink-0 rounded"
                      aria-label={t("selectAllFromShop", { shopName })}
                    />
                    <Store className="w-4 h-4 text-neutral-400 ml-3" />
                    <Link 
                      href={`/profile/shop/${shopId}`} 
                      className="flex items-center group/shoplink outline-none"
                    >
                      <span className="text-sm font-medium text-neutral-800 group-hover/shoplink:text-blue-600 ml-2 truncate transition-colors">
                        {shopName}
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 ml-1 shrink-0 group-hover/shoplink:text-blue-600 transition-colors" />
                    </Link>
                  </div>

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

                  <div className="px-4 py-3.5 flex flex-col gap-3 border-t border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Ticket className="w-4 h-4 text-amber-500" />
                        <span>{t("shopVoucher")}</span>
                      </div>
                      {vouchers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenShopVoucherModal(shopId, shopName)
                          }
                          className="text-sm text-amber-600 hover:text-amber-700 hover:underline transition-colors"
                        >
                          {t("shopVoucherAvailable", {
                            count: vouchers.length,
                          })}
                        </button>
                      ) : (
                        <span className="text-sm text-neutral-400">
                          {t("shopVoucherPlain")}
                        </span>
                      )}
                    </div>

                    {(() => {
                      const shopPreview = cartPreview?.shopPreviews?.find(
                        (s: ShopPreview) => s.shopId === shopId,
                      );
                      const appliedVouchers =
                        shopPreview?.appliedVoucherBreakdowns || [];

                      if (appliedVouchers.length === 0) return null;

                      return (
                        <div className="p-3.5 bg-white border border-neutral-200 border-dashed rounded-lg">
                          <div className="flex items-center gap-2 mb-2.5">
                            <Tag className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-medium text-neutral-700">
                              {t("appliedShopDiscounts")}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {appliedVouchers.map(
                              (
                                voucher: AppliedVoucherBreakdown,
                                idx: number,
                              ) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span className="text-neutral-500 flex items-center gap-1.5">
                                    <span className="font-mono text-xs text-neutral-700">
                                      {voucher.voucherCode}
                                    </span>
                                    {voucher.discountType === "FixedAmount" && (
                                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                        {t("fixed")}
                                      </span>
                                    )}
                                    {voucher.discountType === "Percentage" && (
                                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">
                                        {t("percentOff")}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-medium text-green-600">
                                    -{voucher.discountAmount.toLocaleString()}₫
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                          {appliedVouchers.length > 1 && (
                            <div className="flex justify-between items-center text-sm mt-2.5 pt-2.5 border-t border-neutral-100">
                              <span className="text-neutral-600">
                                {t("totalShopDiscount")}
                              </span>
                              <span className="font-semibold text-green-600">
                                -
                                {(
                                  shopPreview?.shopDiscountAmount || 0
                                ).toLocaleString()}
                                ₫
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

          <OrderSummary
            selectedItemIds={selectedItemIds}
            onCheckout={handleCheckout}
            onOpenSystemVoucher={handleOpenSystemVoucherModal}
            cartPreview={cartPreview}
            isCalculatingPreview={isCalculatingPreview}
          />
        </div>
      </div>

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
