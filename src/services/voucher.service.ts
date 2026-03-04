import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  ApplicableVouchersData,
  ApplyVoucherPayload,
  ApplyVoucherResponseData,
} from "@/src/types/voucher.types";

// ─── Enums (must match C# backend) ──────────────────────

export enum DiscountType {
  Percentage = 0,
  FixedAmount = 1,
}

export enum VoucherStatus {
  Active = 0,
  Expired = 1,
  Depleted = 2,
  Disabled = 3,
}

export enum VoucherType {
  Promotion = 0,
  Compensation = 1,
  Negotiation = 2,
}

export enum StackingPolicy {
  None = 0,
  AllowStacking = 2,
}

// ─── Interfaces ──────────────────────────────────────────

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string; // "Promotion" | "Negotiation" | "Compensation"
  discountType: string; // "Percentage" | "FixedAmount"
  value: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: string; // "Active" | "Disabled"
  creatorId: string;
  creatorName: string;
  targetUserId: string | null;
  isStackable: boolean;
  stackingPolicy: string; // "All" | "WithCompensationOnly" | "None"
}

export interface CreatePromotionVoucherPayload {
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  discountType: DiscountType;
  value: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  startDate: string; // ISO String
  endDate: string; // ISO String
  usageLimit: number;
  isStackable: boolean;
  stackingPolicy: number;
}

export interface UpdateVoucherPayload {
  name: string;
  description: string;
  endDate: string; // ISO String
  usageLimit: number;
  status: VoucherStatus;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface VoucherUsageItem {
  orderId: string;
  voucherCode: string;
  customerName: string;
  orderTotalAmount: number;
  discountApplied: number;
  appliedAt: string;
}

export type VoucherUsageResponse = PaginatedResponse<VoucherUsageItem>;

// ─── Service ─────────────────────────────────────────────

export const voucherService = {
  /**
   * Lấy danh sách voucher của shop hiện tại
   */
  getShopVouchers: async (
    page = 1,
    size = 10,
  ): Promise<ApiResponse<PaginatedResponse<Voucher>>> => {
    return api.get<any, ApiResponse<PaginatedResponse<Voucher>>>(
      `/Voucher/shop?PageNumber=${page}&PageSize=${size}`,
    );
  },

  /**
   * Tạo voucher khuyến mãi (Promotion)
   */
  createPromotionVoucher: async (
    payload: CreatePromotionVoucherPayload,
  ): Promise<ApiResponse<Voucher>> => {
    return api.post<any, ApiResponse<Voucher>>(`/Voucher/promotion`, payload);
  },

  /**
   * Cập nhật voucher
   */
  updateVoucher: async (
    id: string,
    payload: UpdateVoucherPayload,
  ): Promise<ApiResponse<Voucher>> => {
    return api.put<any, ApiResponse<Voucher>>(`/Voucher/${id}`, payload);
  },

  /**
   * Xoá voucher
   */
  deleteVoucher: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete<any, ApiResponse<null>>(`/Voucher/${id}`);
  },

  /**
   * Lấy danh sách voucher áp dụng được cho giỏ hàng hiện tại
   */
  getApplicableVouchers: async (): Promise<
    ApiResponse<ApplicableVouchersData>
  > => {
    return api.get<any, ApiResponse<ApplicableVouchersData>>(
      `/Voucher/applicable`,
    );
  },

  /**
   * Áp dụng voucher cho đơn hàng
   */
  applyVoucher: async (
    payload: ApplyVoucherPayload,
  ): Promise<ApiResponse<ApplyVoucherResponseData>> => {
    return api.post<any, ApiResponse<ApplyVoucherResponseData>>(
      `/Voucher/apply`,
      payload,
    );
  },

  /**
   * Xoá tất cả voucher đã áp dụng cho đơn hàng
   */
  removeAllVouchers: async (orderId: string): Promise<ApiResponse<null>> => {
    return api.delete<any, ApiResponse<null>>(`/Voucher/remove-all/${orderId}`);
  },

  /**
   * Xoá một voucher cụ thể khỏi đơn hàng
   */
  removeVoucher: async (
    orderId: string,
    code: string,
  ): Promise<ApiResponse<ApplyVoucherResponseData>> => {
    return api.delete<any, ApiResponse<ApplyVoucherResponseData>>(
      `/Voucher/remove/${orderId}/${code}`,
    );
  },

  /**
   * Bật/Tắt trạng thái voucher
   */
  toggleVoucherStatus: async (id: string): Promise<ApiResponse<null>> => {
    return api.patch<any, ApiResponse<null>>(`/Voucher/${id}/status`);
  },

  /**
   * Lấy chi tiết một voucher theo ID
   */
  getVoucherById: async (id: string): Promise<ApiResponse<Voucher>> => {
    return api.get<any, ApiResponse<Voucher>>(`/Voucher/${id}`);
  },

  /**
   * Lấy lịch sử sử dụng voucher
   */
  getVoucherUsageHistory: async (
    id: string,
    pageNumber = 1,
    pageSize = 5,
  ): Promise<ApiResponse<VoucherUsageResponse>> => {
    return api.get<any, ApiResponse<VoucherUsageResponse>>(
      `/Voucher/${id}/usage?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  },
};
