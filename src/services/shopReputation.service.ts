import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import { PaginatedResult } from "@/src/types/order.types";

export type ShopBadge = "Basic" | "Verified" | "Premium" | string;

export interface ShopReputationCurrent {
  shopId: string;
  shopName: string;
  currentQualityScore: number;
  badge: ShopBadge;
}

export interface ShopReputationBreakdown {
  shopId: string;
  capturedAt: string;
  issueRate: number;
  avgResponseHours: number;
  refundRate: number;
  repurchaseRate: number;
  positiveFeedbackRate: number;
  totalScore: number;
  badge: ShopBadge;
}

// Interfaces based on docs for future endpoints
export interface ShopReputationTrend {
  date: string;
  score: number;
  badge: ShopBadge;
}

export interface ShopReputationLog {
  id: string;
  delta: number;
  scoreAfter: number;
  reason: string;
  createdAt: string;
}

export interface ShopBadgeHistory {
  date: string;
  newBadge: string;
  reason: string;
}

export const shopReputationService = {
  /**
   * Fetch current shop's overall reputation score and badge
   * GET /api/v1/Reputation/my-current
   */
  getMyCurrent: async (): Promise<ApiResponse<ShopReputationCurrent>> => {
    return api.get("/Reputation/my-current");
  },

  /**
   * Fetch detailed breakdown of shop's performance metrics
   * GET /api/v1/Reputation/my-breakdown
   */
  getMyBreakdown: async (): Promise<ApiResponse<ShopReputationBreakdown>> => {
    return api.get("/Reputation/my-breakdown");
  },

  /**
   * Fetch trend data for charts
   * GET /api/v1/Reputation/my-trend
   */
  getMyTrend: async (): Promise<ApiResponse<ShopReputationTrend[]>> => {
    return api.get("/Reputation/my-trend");
  },

  /**
   * Fetch paginated shop reputation logs
   * GET /api/v1/Reputation/my-shop/logs?page={page}&size={size}
   */
  getMyLogs: async (page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResult<ShopReputationLog>>> => {
    return api.get(`/Reputation/my-shop/logs?page=${page}&size=${size}`);
  },

  /**
   * Fetch shop's overall reputation score and badge
   * GET /api/v1/Reputation/{shopId}/current
   */
  getPublicShopReputation: async (shopId: string): Promise<ApiResponse<ShopReputationCurrent>> => {
    return api.get(`/Reputation/${shopId}/current`);
  },

  /**
   * Fetch shop's badge change history
   * GET /api/v1/Reputation/my-badge-history
   */
  getMyBadgeHistory: async (): Promise<ApiResponse<ShopBadgeHistory[]>> => {
    return api.get("/Reputation/my-badge-history");
  },
};
