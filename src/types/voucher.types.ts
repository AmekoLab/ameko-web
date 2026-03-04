import { Voucher } from "@/src/services/voucher.service";

// ─── Applicable Vouchers (Cart / Checkout) ───────────────

export interface ShopVoucherGroup {
  shopId: string;
  vouchers: Voucher[];
}

export interface ApplicableVouchersData {
  systemVouchers: Voucher[];
  shopVoucherGroups: ShopVoucherGroup[];
}

// ─── Apply Voucher (POST /Voucher/apply) ─────────────────

export interface ApplyVoucherPayload {
  orderId: string;
  code: string;
}

export interface AppliedVoucherDetail {
  code: string;
  voucherType: string;
  discountApplied: number;
  applyOrder: number;
}

export interface ApplyVoucherResponseData {
  newDiscountAmount: number;
  totalDiscountAmount: number;
  finalTotal: number;
  appliedVouchersCount: number;
  appliedVouchers: AppliedVoucherDetail[];
}
