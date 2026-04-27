export interface AIRecommendedItem {
  productId?: string;
  id?: string;
  recommendationKind?: string;
  name: string;
  price: number;
  imageUrl: string;
  shopUrl?: string;
  detailPath?: string;
  shopId?: string | null;
  shopName?: string | null;
  shopAvatarUrl?: string | null;
}

export interface AISourceLink {
  title: string;
  url: string;
  imageUrl?: string | null;
  snippet?: string | null;
}

export interface AIChatRequest {
  conversationId: number | null;
  message: string;
}

export interface AIChatResponse {
  conversationId: number;
  reply: string;
  estimatedPrice: number | null;
  items: AIRecommendedItem[];
  usedWebSearch: boolean;
  sourceLinks: AISourceLink[];
}

export interface AIConversation {
  id: number;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  items: AIRecommendedItem[] | null;
  sourceLinks: AISourceLink[] | null;
  usedWebSearch: boolean;
  estimatedPrice: number | null;
  createdAt: string;
}
