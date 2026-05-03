import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import { PaginatedResult } from "@/src/types/order.types";

export interface ReputationGate {
  score: number;
  tier: "High" | "Mid" | "Normal" | "Low";
  isLocked: boolean;
  monthlyOrderLimit: number;
  canUseAdminVoucher: boolean;
}

export interface CustomerReputationData {
  userId: string;
  currentScore: number;
  monthlyAutoCancels: number;
  totalAutoCancels: number;
  slowResponseViolationCount: number;
  consecutiveSuccesses: number;
  gate: ReputationGate;
}

export interface ReputationLog {
  id: string; 
  delta: number;
  scoreAfter: number;
  reason: string;
  createdAt: string;
}

export const reputationService = {
  /**
   * Fetch current customer's reputation stats and gate info
   * GET /api/v1/Reputation/me
   */
  getMyReputation: async (): Promise<ApiResponse<CustomerReputationData>> => {
    return api.get("/Reputation/me");
  },

  /**
   * Fetch paginated reputation logs (history of score changes)
   * GET /api/v1/Reputation/me/logs?page={page}&size={size}
   */
  getMyReputationLogs: async (page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResult<ReputationLog>>> => {
    return api.get(`/Reputation/me/logs?page=${page}&size=${size}`);
  },
};
