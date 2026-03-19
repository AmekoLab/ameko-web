import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import { AssemblyTemplate, AssemblyTemplatePayload, AssemblyLog } from "@/src/types/assembly.types";

export const assemblyService = {
  /**
   * Get all assembly templates for the current shop.
   * GET /assembly-tracking/templates/shop
   */
  getShopTemplates: async (): Promise<ApiResponse<AssemblyTemplate[]>> => {
    return api.get("/assembly-tracking/templates/shop");
  },

  createTemplate: async (
    payload: AssemblyTemplatePayload,
  ): Promise<ApiResponse<AssemblyTemplate>> =>
    api.post("/assembly-tracking/templates/shop", payload),

  updateTemplate: async (
    templateId: string,
    payload: AssemblyTemplatePayload,
  ): Promise<ApiResponse<AssemblyTemplate>> =>
    api.put(`/assembly-tracking/templates/${templateId}`, payload),

  deleteTemplate: async (templateId: string): Promise<ApiResponse<null>> =>
    api.delete(`/assembly-tracking/templates/${templateId}`),

  initializeTracking: async (orderItemId: string): Promise<ApiResponse<null>> =>
    api.post(`/assembly-tracking/logs/order-item/${orderItemId}/initialize`),

  getTrackingLogs: async (orderItemId: string): Promise<ApiResponse<AssemblyLog[]>> =>
    api.get(`/assembly-tracking/logs/order-item/${orderItemId}`),

  updateTrackingLog: async (progressLogId: string, formData: FormData): Promise<ApiResponse<AssemblyLog>> => {
    return api.put(`/assembly-tracking/logs/${progressLogId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  addAdhocStep: async (orderItemId: string, formData: FormData): Promise<ApiResponse<AssemblyLog>> => {
    return api.post(`/assembly-tracking/logs/order-item/${orderItemId}/adhoc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
