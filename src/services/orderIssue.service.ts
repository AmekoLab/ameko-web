import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import { OrderIssue, PaginatedOrderIssues } from "../types/orderIssue.types";

export const orderIssueService = {
  getMyIssues: async (params?: { Type?: number, status?: number, page?: number, pageSize?: number }): Promise<ApiResponse<PaginatedOrderIssues>> => {
    return api.get('/order-issues/me', { params });
  },
  
  getShopIssues: async (params?: { Type?: number, Status?: number, page?: number, pageSize?: number }): Promise<ApiResponse<PaginatedOrderIssues>> => {
    return api.get('/order-issues/shop', { params });
  },

  getIssueDetail: async (id: string): Promise<ApiResponse<OrderIssue>> => {
    return api.get(`/order-issues/${id}`);
  },

  submitCancelRequest: async (payload: import("../types/orderIssue.types").CancelRequestPayload): Promise<ApiResponse<OrderIssue>> => {
    return api.post('/orders/cancel-request', payload);
  },

  processIssue: async (payload: import("../types/orderIssue.types").ProcessIssuePayload): Promise<ApiResponse<boolean>> => {
    return api.post('/orders/process-issue', payload);
  }
};
