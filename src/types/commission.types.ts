export interface CreateCommissionPayload {
  targetedShopId: string;
  title: string;
  description: string;
  referenceImages: string;
  minBudget: number;
  maxBudget: number;
  quantity: number;
}

export interface CreateCommissionResponse {
  success: boolean;
  message: string;
  data: string; // commission ID
}

export interface CommissionQuote {
  commissionQuoteId: string;
  commissionRequestId: string;
  shopId: string;
  shopName: string;
  shopAvatar: string | null;
  quotedPrice: number;
  estimatedDays: number;
  shopNotes: string;
  status: string;
  createdAt: string;
  expiredAt: string;
}

export interface CommissionRequest {
  commissionRequestId: string;
  userId: string;
  userName: string;
  targetedShopId: string | null;
  targetedShopName: string | null;
  title: string;
  description: string;
  referenceImages: string;
  minBudget: number;
  maxBudget: number;
  status: string;
  createdAt: string;
  quantity: number;
  quotes: CommissionQuote[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SubmitQuotePayload {
  quotedPrice: number;
  estimatedDays: number;
  shopNotes: string;
}
