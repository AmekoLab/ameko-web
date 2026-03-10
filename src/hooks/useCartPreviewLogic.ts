import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  calculateCartPreviewThunk,
  clearCartPreview,
} from "@/src/store/slices/cartSlice";
import {
  clearAllSelectedVouchers,
  setSelectedShopVouchers,
  setSelectedSystemVouchers,
} from "@/src/store/slices/voucherSlice";
import { OrderItem } from "@/src/types/order.types";

// Module-level timer — shared across ALL hook instances so every
// component that calls useCartPreviewLogic shares one debounce slot.
let globalPreviewTimer: NodeJS.Timeout | null = null;


export const useCartPreviewLogic = (
  cartItems: OrderItem[],
  selectedItemIds: Set<string>,
) => {
  const dispatch = useAppDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const cartPreview = useAppSelector((state) => state.cart.cartPreview);
  const isCalculatingPreview = useAppSelector((state) => state.cart.isCalculatingPreview);
  const applicableVouchers = useAppSelector(
    (state) => state.voucher.applicableVouchers,
  );
  const selectedSystemIds = useAppSelector(
    (state) => state.voucher.selectedSystemVoucherIds,
  );
  const selectedShopVoucherIdsMap = useAppSelector(
    (state) => state.voucher.selectedShopVoucherIds,
  );

  // 1. Map selected voucher IDs → voucher codes
  const payloadCodes = useMemo(() => {
    const systemCode =
      selectedSystemIds?.length && applicableVouchers?.systemVouchers
        ? applicableVouchers.systemVouchers.find(
            (v) => v.id === selectedSystemIds[0],
          )?.code
        : undefined;

    const shopCodes: Record<string, string> = {};
    if (selectedShopVoucherIdsMap && applicableVouchers?.shopVoucherGroups) {
      Object.entries(selectedShopVoucherIdsMap).forEach(([shopId, vIds]) => {
        if (vIds && vIds.length > 0) {
          const group = applicableVouchers.shopVoucherGroups.find(
            (g) => g.shopId === shopId,
          );
          const code = group?.vouchers.find((v) => v.id === vIds[0])?.code;
          if (code) shopCodes[shopId] = code;
        }
      });
    }
    return { systemCode, shopCodes };
  }, [applicableVouchers, selectedSystemIds, selectedShopVoucherIdsMap]);

  // 1a. Hydrate Redux from localStorage on mount (runs once)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSystem = localStorage.getItem('ameko_system_vouchers');
        const savedShop = localStorage.getItem('ameko_shop_vouchers');

        if (savedSystem) {
          dispatch(setSelectedSystemVouchers(JSON.parse(savedSystem)));
        }
        if (savedShop) {
          const parsedShop = JSON.parse(savedShop);
          Object.entries(parsedShop).forEach(([shopId, voucherIds]) => {
            dispatch(setSelectedShopVouchers({ shopId, voucherIds: voucherIds as string[] }));
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
    localStorage.setItem('ameko_system_vouchers', JSON.stringify(selectedSystemIds || []));
    localStorage.setItem('ameko_shop_vouchers', JSON.stringify(selectedShopVoucherIdsMap || {}));
  }, [isHydrated, selectedSystemIds, selectedShopVoucherIdsMap]);

  // 2. Safe auto-cleanup guard (prevent infinite loops)
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    if (selectedItemIds.size === 0) {
      const hasVouchers =
        Object.values(selectedShopVoucherIdsMap).some(
          (v) => v && v.length > 0,
        ) ||
        (selectedSystemIds && selectedSystemIds.length > 0);
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
    Object.entries(selectedShopVoucherIdsMap).forEach(([sId, vIds]) => {
      if (!activeShopIds.has(sId) && vIds && vIds.length > 0) {
        dispatch(setSelectedShopVouchers({ shopId: sId, voucherIds: [] }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    selectedItemIds.size,
    cartItems.length,
    selectedShopVoucherIdsMap,
    selectedSystemIds,
  ]); // Intentional: .size and .length used to avoid Set/array reference loops

  // 3. Global debounced API call — deduplicates across all mounted instances
  const payloadToFetch = {
    selectedOrderItemIds: Array.from(selectedItemIds),
    appliedSystemVoucherCode: payloadCodes.systemCode,
    appliedShopVoucherCodes:
      Object.keys(payloadCodes.shopCodes).length > 0
        ? payloadCodes.shopCodes
        : undefined,
  };
  // Stringify guarantees a stable primitive dependency — object reference
  // changes (new Set(), new array) won't spuriously re-trigger the effect.
  const payloadString = JSON.stringify(payloadToFetch);

  useEffect(() => {
    if (!isHydrated || selectedItemIds.size === 0) return;

    // Clear the shared global timer — any instance re-rendering resets it
    if (globalPreviewTimer) clearTimeout(globalPreviewTimer);

    // Set the shared global timer — only the last render within 500 ms wins
    globalPreviewTimer = setTimeout(() => {
      dispatch(calculateCartPreviewThunk(JSON.parse(payloadString)));
    }, 500);

    // Deliberately no cleanup return: if Component A unmounts we must NOT
    // cancel the timer that Component B is still expecting to fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, payloadString, isHydrated]);

  return { cartPreview, isCalculatingPreview };
};
