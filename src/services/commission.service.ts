import api from "@/src/utils/api";
import {
  CreateCommissionPayload,
  CreateCommissionResponse,
  CommissionRequest,
  CommissionQuote,
  ApiResponse,
  SubmitQuotePayload,
  UpdateCommissionPayload,
} from "@/src/types/commission.types";

export const commissionService = {
  createCommission: (
    payload: CreateCommissionPayload,
  ): Promise<CreateCommissionResponse> => {
    return api.post("../Commissions", payload);
  },

  getMyRequests: (): Promise<ApiResponse<CommissionRequest[]>> => {
    return api.get("../Commissions/my-requests");
  },

  getCommissionById: (id: string): Promise<ApiResponse<CommissionRequest>> => {
    return api.get(`../Commissions/${id}`);
  },

  getShopTargetedRequests: (): Promise<ApiResponse<CommissionRequest[]>> => {
    return api.get("../Commissions/shop/targeted");
  },

  getPool: (): Promise<ApiResponse<CommissionRequest[]>> => {
    return api.get("../Commissions/pool");
  },

  getShopQuotes: (): Promise<ApiResponse<CommissionQuote[]>> => {
    return api.get("../Commissions/shop/quotes");
  },

  submitQuote: (
    requestId: string,
    payload: SubmitQuotePayload,
  ): Promise<ApiResponse<unknown>> => {
    return api.post(`../Commissions/${requestId}/quotes`, payload);
  },

  acceptQuote: (
    quoteId: string,
  ): Promise<{ success: boolean; message: string; orderId: string }> => {
    return api.post(`../Commissions/quotes/${quoteId}/accept`);
  },

  rejectCommissionRequest: (
    requestId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return api.post(`../Commissions/${requestId}/reject-target`);
  },

  cancelCommissionRequest: (
    requestId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return api.post(`../Commissions/${requestId}/cancel`);
  },

  publishToPool: (
    requestId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return api.post(`../Commissions/${requestId}/publish`);
  },

  updateCommission: (
    id: string,
    payload: UpdateCommissionPayload,
  ): Promise<{ success: boolean; message: string }> => {
    return api.put(`../Commissions/${id}`, payload);
  },

  revokeQuote: (
    quoteId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return api.post(`../Commissions/quotes/${quoteId}/revoke`);
  },
};
