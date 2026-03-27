export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Conversation {
  conversationId: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  messageType: number;
  parentMessageId: number | null;
  createdAt: string;
  tempId?: string;
  status?: "sending" | "sent" | "error";
  reactions?: Record<string, number> | { userId: string; reaction: number }[]; 
  isRead?: boolean;
}

export interface SendMessagePayload {
  conversationId?: number;
  targetUserId?: string;   
  content: string;
  messageType: number;
  parentMessageId?: number | null;
}

export interface MarkReadPayload {
  upToMessageId: number;
}

export interface ReactionPayload {
  reaction: number | null; 
}