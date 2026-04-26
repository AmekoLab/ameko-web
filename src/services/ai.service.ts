import api from "@/src/utils/api";
import {
  AIChatRequest,
  AIChatResponse,
  AIConversation,
  AIMessage,
} from "@/src/types/ai.types";

/**
 * The backend wraps every response in `{ success: boolean, data: T }`.
 * The Axios interceptor already strips the outer Axios `response.data`,
 * so callers receive `{ success, data }`. This generic unwraps `.data`.
 */
interface BaseResponse<T> {
  success: boolean;
  data: T;
}

export const aiService = {
  sendMessage: async (payload: AIChatRequest): Promise<AIChatResponse> => {
    const res = await api.post<unknown, BaseResponse<AIChatResponse>>(
      "/AI/chat",
      payload,
    );
    return res.data;
  },
  getConversations: async (
    limit: number = 20,
  ): Promise<AIConversation[]> => {
    const res = await api.get<unknown, BaseResponse<AIConversation[]>>(
      `/AI/chat/conversations?limit=${limit}`,
    );
    return res.data;
  },
  getMessages: async (conversationId: number): Promise<AIMessage[]> => {
    const res = await api.get<unknown, BaseResponse<AIMessage[]>>(
      `/AI/chat/conversations/${conversationId}/messages`,
    );
    return res.data;
  },
};
