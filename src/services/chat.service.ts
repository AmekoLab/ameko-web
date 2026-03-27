import api from "@/src/utils/api";
import {
  Conversation,
  CursorPaginatedResponse,
  Message,
  SendMessagePayload,
  MarkReadPayload,
  ReactionPayload,
} from "@/src/types/chat.types";
import { ApiResponse } from "@/src/types/auth.types";

export const chatService = {
  getConversations: async (
    pageIndex = 1,
    pageSize = 20,
  ): Promise<ApiResponse<CursorPaginatedResponse<Conversation>>> => {
    return api.get("/chat/conversations", { params: { pageIndex, pageSize } });
  },

  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 50,
  ): Promise<ApiResponse<CursorPaginatedResponse<Message>>> => {
    return api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { cursor, limit },
    });
  },

  sendMessage: async (
    payload: SendMessagePayload,
  ): Promise<ApiResponse<Message>> => {
    return api.post("/chat/messages", payload);
  },

  getOrCreateDirectRoom: async (
    targetUserId: string,
  ): Promise<ApiResponse<Conversation>> => {
    return api.post(`/chat/conversations/direct/${targetUserId}`);
  },

  markAsRead: async (
    conversationId: string,
    payload: MarkReadPayload,
  ): Promise<ApiResponse<void>> => {
    return api.post(`/chat/conversations/${conversationId}/read`, payload);
  },

  reactToMessage: async (
    conversationId: number,
    messageId: number,
    payload: ReactionPayload,
  ): Promise<ApiResponse<Message>> => {
    return api.put(
      `/chat/conversations/${conversationId}/messages/${messageId}/reaction`,
      payload,
    );
  },
};
