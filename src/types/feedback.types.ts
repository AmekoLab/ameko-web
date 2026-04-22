export interface ProductEligibilityItem {
  orderId: string;
  orderItemId: string;
  orderCreatedAt: string;
  hasFeedback: boolean;
  canReview: boolean;
  feedbackId: string | null;
}

export interface ProductFeedbackEligibilityData {
  productId: string;
  items: ProductEligibilityItem[];
}

export interface FeedbackEligibilityData {
  orderId: string;
  isOrderCompleted: boolean;
  canReviewShop: boolean;
  hasShopFeedback: boolean;
  assembledItems?: ProductEligibilityItem[];
}

export interface FeedbackEligibilityResponse {
  success: boolean;
  message: string;
  data: FeedbackEligibilityData;
}

export interface ShopFeedbackItem {
  feedbackId: string;
  orderId: string;
  shopId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string | null;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdDate: string;
  shopReply: string | null;
  shopRepliedAt: string | null;
}

export interface PaginatedShopFeedbacks {
  items: ShopFeedbackItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AssembledProductFeedbackItem {
  feedbackId: string;
  orderItemId: string;
  assembledProductId: string;
  shopId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string | null;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdDate: string;
  shopReply: string | null;
  shopRepliedAt: string | null;
}

export interface PaginatedAssembledProductFeedbacks {
  items: AssembledProductFeedbackItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
