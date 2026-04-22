export interface AIRecommendRequest {
  userPrompt: string;
  shopId?: string | null;
  baseKitId?: string | null;
  assembledProductId?: string | null;
}

export interface AIRecommendedItem {
  id: string;
  recommendationKind: string; // e.g., "assembled", "kit", "switch", "keycap"
  name: string;
  price: number;
  imageUrl: string;
  detailPath: string;
  shopId: string | null;
  shopName: string | null;
  shopAvatarUrl: string | null;
}

export interface AIRecommendResponse {
  kitId: string | null;
  switchId: string | null;
  keycapId: string | null;
  assembledProductId: string | null;
  reasoning: string;
  totalEstimatedPrice: number;
  items: AIRecommendedItem[];
}
