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

export enum ReactionType {
  Like = 0,
  Love = 1,
  Haha = 2,
  Wow = 3,
  Sad = 4,
  Angry = 5,
}

export const REACTION_EMOJIS: Record<number, string> = {
  [ReactionType.Like]: "👍",
  [ReactionType.Love]: "❤️",
  [ReactionType.Haha]: "😂",
  [ReactionType.Wow]: "😮",
  [ReactionType.Sad]: "😢",
  [ReactionType.Angry]: "😡",
};

export const REACTION_LABELS: Record<number, string> = {
  [ReactionType.Like]: "Like",
  [ReactionType.Love]: "Love",
  [ReactionType.Haha]: "Haha",
  [ReactionType.Wow]: "Wow",
  [ReactionType.Sad]: "Sad",
  [ReactionType.Angry]: "Angry",
};

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
  reaction?: number | null;
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