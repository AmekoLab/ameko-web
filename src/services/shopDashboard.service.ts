import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  CustomerOverviewData,
  CustomerOverviewParams,
  CustomerTrendItem,
  TopSpendersResponse,
  ChurnRiskResponse,
  PurchaseFrequencyData,
  ConversionSummaryData,
} from "@/src/types/shop-dashboard.types";

export const shopDashboardService = {
  /**
   * Fetch Customer Overview metrics for the shop dashboard.
   * GET /shop-dashboard/customers/overview
   */
  getCustomerOverview: async (
    params?: CustomerOverviewParams,
  ): Promise<CustomerOverviewData> => {
    try {
      const res: ApiResponse<CustomerOverviewData> = await api.get(
        "/shop-dashboard/customers/overview",
        { params },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch customer overview:", error);
      throw error;
    }
  },

  /**
   * Fetch Customer Trend data over time for charting.
   * GET /shop-dashboard/customers/trend
   */
  getCustomerTrend: async (
    params?: CustomerOverviewParams,
  ): Promise<CustomerTrendItem[]> => {
    try {
      const res: ApiResponse<CustomerTrendItem[]> = await api.get(
        "/shop-dashboard/customers/trend",
        { params },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch customer trend:", error);
      throw error;
    }
  },

  /**
   * Fetch Top Spenders (VIP customers) with pagination.
   * GET /shop-dashboard/customers/top-spenders
   */
  getTopSpenders: async (
    params?: CustomerOverviewParams,
  ): Promise<TopSpendersResponse> => {
    try {
      const res: ApiResponse<TopSpendersResponse> = await api.get(
        "/shop-dashboard/customers/top-spenders",
        { params },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch top spenders:", error);
      throw error;
    }
  },

  /**
   * Fetch Churn Risk customers with pagination.
   * GET /shop-dashboard/customers/churn-risk
   */
  getChurnRisk: async (
    params?: CustomerOverviewParams,
  ): Promise<ChurnRiskResponse> => {
    try {
      const res: ApiResponse<ChurnRiskResponse> = await api.get(
        "/shop-dashboard/customers/churn-risk",
        { params },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch churn risk:", error);
      throw error;
    }
  },

  /**
   * Fetch Purchase Frequency metrics.
   * GET /shop-dashboard/customers/purchase-frequency
   */
  getPurchaseFrequency: async (
    params?: CustomerOverviewParams,
  ): Promise<PurchaseFrequencyData> => {
    try {
      const res: ApiResponse<PurchaseFrequencyData> = await api.get(
        "/shop-dashboard/customers/purchase-frequency",
        { params },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch purchase frequency:", error);
      throw error;
    }
  },

  /**
   * Fetch Conversion Summary metrics.
   * GET /shop-dashboard/customers/conversion
   */
  getConversionSummary: async (
    params?: CustomerOverviewParams,
  ): Promise<ConversionSummaryData> => {
    try {
      const res: ApiResponse<ConversionSummaryData> = await api.get(
        "/shop-dashboard/customers/conversion",
        { params },
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch conversion summary:", error);
      throw error;
    }
  },
};
