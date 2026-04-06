import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  calculateCartPreviewThunk,
  clearCartPreview,
} from "@/src/store/slices/cartSlice";
import {
  clearAllSelectedVouchers,
  setSelectedShopVouchers,
  setSelectedSystemVoucher,
} from "@/src/store/slices/voucherSlice";
import { OrderItem } from "@/src/types/order.types";

// Module-level timer — shared across ALL hook instances so every
// component that calls useCartPreviewLogic shares one debounce slot.
let globalPreviewTimer: NodeJS.Timeout | null = null;


export const useCartPreviewLogic = (
  cartItems: OrderItem[],
  selectedItemIds: Set<string>,
  isUpdating: boolean = false,
) => {
  const dispatch = useAppDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const cartPreview = useAppSelector((state) => state.cart.cartPreview);
  const isCalculatingPreview = useAppSelector((state) => state.cart.isCalculatingPreview);
  const applicableVouchers = useAppSelector(
    (state) => state.voucher.applicableVouchers,
  );
  const selectedSystemCode = useAppSelector(
    (state) => state.voucher.selectedSystemVoucherCode,
  );
  const selectedShopVoucherCodesMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherCodes,
  );

  // 1. Build payload codes directly from state (already stores codes)
  const payloadCodes = useMemo(() => {
    const shopCodeGroups: Record<string, string[]> = {};
    if (selectedShopVoucherCodesMap) {
      Object.entries(selectedShopVoucherCodesMap).forEach(([shopId, codes]) => {
        if (codes && codes.length > 0) {
          shopCodeGroups[shopId] = codes;
        }
      });
    }
    return {
      systemCode: selectedSystemCode ?? undefined,
      shopCodeGroups,
    };
  }, [selectedSystemCode, selectedShopVoucherCodesMap]);

  // 1a. Hydrate Redux from localStorage on mount (runs once)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSystem = localStorage.getItem('ameko_system_voucher_code');
        const savedShop = localStorage.getItem('ameko_shop_voucher_codes');

        if (savedSystem) {
          dispatch(setSelectedSystemVoucher(JSON.parse(savedSystem)));
        }
        if (savedShop) {
          const parsedShop = JSON.parse(savedShop);
          Object.entries(parsedShop).forEach(([shopId, voucherCodes]) => {
            dispatch(setSelectedShopVouchers({ shopId, voucherCodes: voucherCodes as string[] }));
          });
        }
      } catch (error) {
        console.error('Failed to parse vouchers from localStorage', error);
      }
    }
    setIsHydrated(true);
  }, [dispatch]);

  // 1b. Sync Redux state → localStorage (only after hydration)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    localStorage.setItem('ameko_system_voucher_code', JSON.stringify(selectedSystemCode ?? null));
    localStorage.setItem('ameko_shop_voucher_codes', JSON.stringify(selectedShopVoucherCodesMap || {}));
  }, [isHydrated, selectedSystemCode, selectedShopVoucherCodesMap]);

  // 2. Safe auto-cleanup guard (prevent infinite loops)
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    if (selectedItemIds.size === 0) {
      const hasVouchers =
        Object.values(selectedShopVoucherCodesMap).some(
          (v) => v && v.length > 0,
        ) || !!selectedSystemCode;
      if (hasVouchers) dispatch(clearAllSelectedVouchers());
      if (cartPreview) dispatch(clearCartPreview());
      return;
    }

    // Clear shop vouchers for shops with no selected items
    const activeShopIds = new Set(
      cartItems
        .filter((item) => selectedItemIds.has(item.orderItemId))
        .map((item) => item.shopId),
    );
    Object.entries(selectedShopVoucherCodesMap).forEach(([sId, codes]) => {
      if (!activeShopIds.has(sId) && codes && codes.length > 0) {
        dispatch(setSelectedShopVouchers({ shopId: sId, voucherCodes: [] }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    selectedItemIds.size,
    cartItems.length,
    selectedShopVoucherCodesMap,
    selectedSystemCode,
  ]); // Intentional: .size and .length used to avoid Set/array reference loops

  // Create a signature that tracks the exact quantities of selected items
  const selectedItemsQuantitySignature = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return "";
    return cartItems
      .filter(item => selectedItemIds.has(item.orderItemId))
      .map(item => `${item.orderItemId}:${item.quantity}`)
      .join('|');
  }, [cartItems, selectedItemIds]);

  // 3. Global debounced API call — deduplicates across all mounted instances
  const payloadToFetch = {
    selectedOrderItemIds: Array.from(selectedItemIds),
    appliedSystemVoucherCode: payloadCodes.systemCode,
    appliedShopVoucherCodeGroups:
      Object.keys(payloadCodes.shopCodeGroups).length > 0
        ? payloadCodes.shopCodeGroups
        : undefined,
  };
  // Stringify guarantees a stable primitive dependency — object reference
  // changes (new Set(), new array) won't spuriously re-trigger the effect.
  const payloadString = JSON.stringify(payloadToFetch);

  useEffect(() => {
    // Block execution if hydrating, nothing selected, OR a DB update is pending
    if (!isHydrated || selectedItemIds.size === 0 || isUpdating) {
      if (globalPreviewTimer) clearTimeout(globalPreviewTimer);
      return;
    }

    // Clear the shared global timer — any instance re-rendering resets it
    if (globalPreviewTimer) clearTimeout(globalPreviewTimer);

    // 300ms — snappier UX since the DB write is already debounced at 600ms
    globalPreviewTimer = setTimeout(() => {
      dispatch(calculateCartPreviewThunk(JSON.parse(payloadString)));
    }, 300);

    // Deliberately no cleanup return: if Component A unmounts we must NOT
    // cancel the timer that Component B is still expecting to fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, payloadString, isHydrated, selectedItemsQuantitySignature, isUpdating]);

  return { cartPreview, isCalculatingPreview };
};
