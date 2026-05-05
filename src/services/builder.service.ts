import api from "@/src/utils/api";
import {
  BuilderPayload,
  BuilderProduct,
  StartBuilderPayload,
  SelectComponentPayload,
  AddBuilderAddonPayload,
} from "@/src/types/builder";
import { PartListData } from "@/src/types/part.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string | null;
}

// Mock Data for Lazy Loading Addons
const MOCK_ADDONS: BuilderProduct[] = [
  {
    optionId: "addon-opt-1",
    partId: "98c3bfbb-ade0-47f1-a428-2179d579b277",
    name: "Artisan Cherry Blossom",
    price: 150000,
    thumbnailUrl: "https://res.cloudinary.com/dfgczhlyg/image/upload/v1770546673/amk-collective/builder-layers/keycap-cherry_gh90n4_f23845ec-2338-4574-b5ad-db54caa325ec.png",
    layerImageUrl: "",
    isDefault: false,
    status: 1,
    tags: "artisan",
    nextStepFilterRule: null,
  },
  {
    optionId: "addon-opt-2",
    partId: "switch-holy-panda-001",
    name: "Holy Panda Switch (1 pc)",
    price: 15000,
    thumbnailUrl: "https://res.cloudinary.com/dfgczhlyg/image/upload/v1770544670/amk-collective/products/thumnail-switch2_qeqofc_a31edf50-c07b-4f6b-85af-2fc2326a260a.png",
    layerImageUrl: "",
    isDefault: false,
    status: 1,
    tags: "switch",
    nextStepFilterRule: null,
  },
];

export const builderService = {
  /**
   * Fetch Base Kits for a shop.
   * GET /parts?ShopId={shopId}&PartType=kit
   */
  getBaseKits: async (shopId: string) => {
    return api.get<unknown, ApiResponse<PartListData>>(
      `/parts?ShopId=${shopId}&PartType=kit&RequireBuilderConfig=true`,
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

  /**
   * Get available addons from API.
   */
  getAvailableAddons: async (
    sessionId: string,
    params?: { addonType?: string; searchTerm?: string; page?: number; pageSize?: number }
  ): Promise<BuilderProduct[]> => {
    try {
      // Assuming 'api' is the configured Axios instance
      const response: any = await api.get(`/Builder/session/${sessionId}/addon-options`, { params });
      
      // Safely extract the items array based on the provided JSON structure. 
      // Account for Axios wrapping (response.data) and backend wrapping (.data.items)
      const items = response.data?.items || response.data?.data?.items || [];

      return items.map((part: any) => ({
        optionId: `addon-${part.partId}`, // Generate unique optionId
        partId: part.partId,
        name: part.name,
        price: part.price || 0,
        thumbnailUrl: part.thumbnailUrl || "",
        layerImageUrl: "", // Addons typically don't render as a full keyboard layer
        isDefault: false,
        status: part.stockQuantity > 0 ? 1 : 0, // Map stock > 0 to active status
        tags: part.partType || "addon",
        nextStepFilterRule: null,
      }));
    } catch (error) {
      console.error("Failed to fetch available addons:", error);
      return []; // Return empty array on failure to prevent UI crashes
    }
  },

  /**
   * Add addon(s) to a builder session.
   * POST /Builder/session/{id}/add-addon
   */
  addAddon: async (payload: AddBuilderAddonPayload): Promise<BuilderPayload> => {
    const response: any = await api.post(`/Builder/session/${payload.sessionId}/add-addon`, {
      items: payload.items,
    });
    return response.data.data;
  },

  /**
   * Remove an addon from a builder session.
   * DELETE /Builder/session/{sessionId}/remove-addon/{componentId}
   */
  removeAddon: async (sessionId: string, componentId: string): Promise<BuilderPayload> => {
    const response: any = await api.delete(`/Builder/session/${sessionId}/remove-addon/${componentId}`);
    return response.data.data;
  },
};
