import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  AdminDashboardOverview,
  PaymentHealthData,
  RiskOverviewData,
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
};
