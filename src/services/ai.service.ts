import api from "@/src/utils/api";
import { AIRecommendRequest, AIRecommendResponse } from "@/src/types/ai.types";

export const aiService = {
  getRecommendation: async (
    payload: AIRecommendRequest,
  ): Promise<AIRecommendResponse> => {
    // Sanitize payload: force undefined or empty strings to null
    const cleanPayload = {
      userPrompt: payload.userPrompt,
      shopId: payload.shopId || null,
      baseKitId: payload.baseKitId || null,
      assembledProductId: payload.assembledProductId || null,
    };

    return api.post<unknown, AIRecommendResponse>(
      "/AI/recommend",
      cleanPayload,
    );
  },
};
