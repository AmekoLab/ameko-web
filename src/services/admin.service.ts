import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  AdminDashboardOverview,
  PaymentHealthData,
  RiskOverviewData,
  TopShopsResponse,
} from "@/src/types/admin.types";

export const adminService = {
  /**
   * Fetch the admin dashboard overview metrics.
   * GET /admin-dashboard/overview
   */
  getDashboardOverview: async (): Promise<AdminDashboardOverview> => {
    try {
      const res: ApiResponse<AdminDashboardOverview> =
        await api.get("/admin-dashboard/overview");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch dashboard overview:", error);
      throw error;
    }
  },

  /**
   * Fetch the payment health metrics.
   * GET /admin-dashboard/payments/health
   */
  getPaymentHealth: async (): Promise<PaymentHealthData> => {
    try {
      const res: ApiResponse<PaymentHealthData> = await api.get(
        "/admin-dashboard/payments/health",
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch payment health:", error);
      throw error;
    }
  },

  /**
   * Fetch the risk overview metrics.
   * GET /admin-dashboard/risk/overview
   */
  getRiskOverview: async (): Promise<RiskOverviewData> => {
    try {
      const res: ApiResponse<RiskOverviewData> = await api.get(
        "/admin-dashboard/risk/overview",
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch risk overview:", error);
      throw error;
    }
  },

  getTopShopsByOrders: async (top: number = 3, startDate?: string, endDate?: string): Promise<TopShopsResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('top', top.toString());
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res: ApiResponse<TopShopsResponse> = await api.get(`/admin-dashboard/shops/top-orders?${params.toString()}`);
      
      return res.data;
    } catch (error) {
      console.error("Failed to fetch top shops by orders:", error);
      throw error;
    }
  },
};


