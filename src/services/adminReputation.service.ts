import api from "@/src/utils/api";

import { ApiResponse } from "@/src/types/auth.types";

export interface AdjustReputationRequest {
  targetType: number; // 0 = Customer, 1 = Shop
  targetId: string;
  delta: number; // -100 to +100 [cite: 11]
  reason: string; // Max 500 characters [cite: 11]
}

export const adminReputationService = {

  adjustReputation: async (data: AdjustReputationRequest): Promise<ApiResponse<{ newScore: number }>> => {
    return api.post("/reputation/adjust", data);
  },
};
