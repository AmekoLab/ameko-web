import api from "@/src/utils/api";
import {
  BuilderPayload,
  StartBuilderPayload,
  SelectComponentPayload,
} from "@/src/types/builder";
import { PartListData } from "@/src/types/part.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string | null;
}

export const builderService = {
  /**
   * Fetch Base Kits for a shop.
   * GET /parts?ShopId={shopId}&PartType=kit
   */
  getBaseKits: async (shopId: string) => {
    return api.get<unknown, ApiResponse<PartListData>>(
      `/parts?ShopId=${shopId}&PartType=kit`,
    );
  },

  /**
   * Start a builder session with a selected base kit.
   * POST /Builder/start
   * Returns: { success, message, data: { message, data: BuilderPayload } }
   */
  startSession: async (payload: StartBuilderPayload) => {
    const res = await api.post<
      unknown,
      ApiResponse<{ message: string; data: BuilderPayload }>
    >(`/Builder/start`, payload);
    // Unwrap double-nested: res is already response.data (via interceptor)
    return res.data.data;
  },

  /**
   * Select a component for a step.
   * POST /Builder/select
   * Returns: { success, message, data: { message, data: BuilderPayload } }
   */
  selectComponent: async (payload: SelectComponentPayload) => {
    const res = await api.post<
      unknown,
      ApiResponse<{ message: string; data: BuilderPayload }>
    >(`/Builder/select`, payload);
    // Unwrap double-nested
    return res.data.data;
  },

  /**
   * Remove a selected component from a step.
   * DELETE /Builder/session/{sessionId}/part/{stepName}
   * Returns: { success, message, data: { message, data: BuilderPayload } }
   */
  removeComponent: async (sessionId: string, stepName: string) => {
    const res = await api.delete<
      unknown,
      ApiResponse<{ message: string; data: BuilderPayload }>
    >(`/Builder/session/${sessionId}/part/${stepName}`);
    // Unwrap double-nested
    return res.data.data;
  },
};
