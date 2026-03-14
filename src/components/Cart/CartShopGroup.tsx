"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchApplicableVouchersThunk,
  selectShopVouchersByShopId,
  selectIsFetchingApplicable,
} from "@/src/store/slices/voucherSlice";
import { Ticket } from "lucide-react";

// ─── Component ───────────────────────────────────────────

interface CartShopGroupProps {
  shopId: string;
  shopName: string;
}

export default function CartShopGroup({
  shopId,
  shopName,
}: CartShopGroupProps) {
  const dispatch = useAppDispatch();

  // Memoized selector – only re-renders when this shop's vouchers change
  const shopVouchers = useAppSelector((state) =>
    selectShopVouchersByShopId(state, shopId),
  );
  const isFetching = useAppSelector(selectIsFetchingApplicable);

  useEffect(() => {
    dispatch(fetchApplicableVouchersThunk());
  }, [dispatch]);

  const voucherCount = shopVouchers.length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Shop header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">{shopName}</h3>

        {isFetching ? (
          <span className="text-xs text-gray-400">Loading...</span>
        ) : voucherCount > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ce2a32] hover:underline"
          >
            <Ticket className="h-3.5 w-3.5" />
            {voucherCount} available voucher{voucherCount > 1 ? "s" : ""}
          </button>
        ) : (
          <span className="text-xs text-gray-400">No voucher</span>
        )}
      </div>

      {/* Placeholder: shop cart items will go here */}
      <div className="text-xs text-gray-400 italic">
        {/* Cart items for shop {shopId} */}
      </div>
    </div>
  );
}
