import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";

// ─── Types ───────────────────────────────────────────────
export interface CreateWarrantyPayload {
  orderItemIds: string[];
  type: number;
  reason: string;
  description: string;
  evidenceUrl: string;
}

export interface WarrantyRequest {
  id: string;
  orderId: string;
  type: number;
  typeName: string;
  status: number;
  statusName: string;
  reason: string;
  description: string;
  evidenceUrl: string | null;
  customerName: string | null;
  customerAvatar: string | null;
  requiresReturn: boolean;
  expectedAction: string;
  refundAmount: number;
  orderItemIds: string[] | null;
  shopResponse: string | null;
  adminNote: string | null;
  isSystemValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedWarrantyResponse {
  items: WarrantyRequest[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerShipPayload {
  issueId: string;
  evidenceUrl: string;
  comment: string;
}

export interface ShopReviewPayload {
  issueId: string;
  approve: boolean;
  shopResponse: string;
}

export interface AdminDecisionPayload {
  issueId: string;
  approve: boolean;
  adminNote: string;
}

export interface UpdateWarrantyPayload {
  type: number;
  reason: string;
  description: string;
  evidenceUrl: string;
}

export interface WarrantyHistoryItem {
  id: string;
  orderIssueId: string;
  actorId: string;
  actorRole: number;
  actorRoleName: string;
  actionType: number;
  actionName: string;
  comment: string;
  createdAt: string;
}

// ─── Service ─────────────────────────────────────────────
export const warrantyService = {
  /**
   * Create a warranty / return request for an order group.
   * POST /warranty/{orderGroupId}
   */
  createWarrantyRequest: async (
    orderGroupId: string,
    payload: CreateWarrantyPayload,
  ): Promise<ApiResponse<unknown[]>> => {
    return api.post(`/warranty/${orderGroupId}`, payload);
  },

  /**
   * Fetch the current user's warranty/return requests (paginated).
   * GET /warranty/my-requests?currentPage=&pageSize=
   */
  getMyWarrantyRequests: async (
    page: number,
    pageSize: number,
  ): Promise<ApiResponse<PaginatedWarrantyResponse>> => {
    return api.get("/warranty/my-requests", {
      params: { currentPage: page, pageSize },
    });
  },

  /**
   * Submit return shipment evidence for a warranty/return request.
   * POST /warranty/customer-ship
   */
  submitReturnShipment: async (
    payload: CustomerShipPayload,
  ): Promise<ApiResponse<unknown>> => {
    return api.post("/warranty/customer-ship", payload);
  },

  /**
   * Fetch warranty/return requests for the current shop (paginated).
   * GET /warranty/shop-requests?currentPage=&pageSize=
   */
  getShopWarrantyRequests: async (
    page: number,
    pageSize: number,
  ): Promise<ApiResponse<PaginatedWarrantyResponse>> => {
    return api.get("/warranty/shop-requests", {
      params: { currentPage: page, pageSize },
    });
  },

  /**
   * Shop reviews (approve/reject) a warranty/return request.
   * POST /warranty/shop-review
   */
  reviewWarrantyRequest: async (
    payload: ShopReviewPayload,
  ): Promise<ApiResponse<null>> => {
    return api.post("/warranty/shop-review", payload);
  },

  /**
   * Shop confirms receipt of returned item.
   * POST /warranty/shop-confirm-receive/{issueId}
   */
  confirmReceiveReturnItem: async (
    issueId: string,
  ): Promise<ApiResponse<null>> => {
    return api.post(`/warranty/shop-confirm-receive/${issueId}`);
  },

  /**
   * Admin: Submit final decision on a warranty/return request.
   * POST /warranty/admin-decision
   */
  submitAdminDecision: async (
    payload: AdminDecisionPayload,
  ): Promise<ApiResponse<null>> => {
    return api.post("/warranty/admin-decision", payload);
  },

  /**
   * Update a warranty/return request.
   * PUT /warranty/{issueId}
   */
  updateWarrantyRequest: async (
    issueId: string,
    payload: UpdateWarrantyPayload,
  ): Promise<ApiResponse<WarrantyRequest>> => {
    return api.put(`/warranty/${issueId}`, payload);
  },

  /**
   * Customer withdraws a warranty/return request.
   * POST /warranty/withdraw/{issueId}
   */
  withdrawWarrantyRequest: async (
    issueId: string,
  ): Promise<ApiResponse<null>> => {
    return api.post(`/warranty/withdraw/${issueId}`);
  },

  /**
   * Admin: Fetch all warranty/return requests (paginated, filterable).
   * GET /warranty?currentPage=&pageSize=&status=
   */
  getAllWarrantyRequests: async (
    page: number,
    pageSize: number,
    status?: number,
  ): Promise<ApiResponse<PaginatedWarrantyResponse>> => {
    const params: Record<string, number> = { currentPage: page, pageSize };
    if (status !== undefined) params.status = status;
    return api.get("/warranty", { params });
  },

  /**
   * Fetch the audit history for a specific warranty/return request.
   * GET /warranty/{issueId}/history
   */
  getWarrantyHistory: async (
    issueId: string,
  ): Promise<ApiResponse<WarrantyHistoryItem[]>> => {
    return api.get(`/warranty/${issueId}/history`);
  },
};
