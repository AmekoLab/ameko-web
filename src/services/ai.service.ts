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
  sendStreamMessage: async (
    payload: AIChatRequest,
    callbacks: {
      onStart?: () => void;
      onHeartbeat?: () => void;
      onResult?: (data: any) => void;
      onError?: (error: string) => void;
      onDone?: () => void;
    }
  ) => {
    // Retrieve token to pass in fetch
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const baseURL = api.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1";

    const response = await fetch(`${baseURL}/AI/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Stream request failed");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Split by double newline as per SSE standard
      const lines = buffer.split('\n\n');
      // The last element might be an incomplete chunk, keep it in the buffer
      buffer = lines.pop() || ""; 

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const chunk = JSON.parse(line.slice(6));
          if (chunk.type === "start" && callbacks.onStart) callbacks.onStart();
          if (chunk.type === "heartbeat" && callbacks.onHeartbeat) callbacks.onHeartbeat();
          if (chunk.type === "result" && callbacks.onResult) callbacks.onResult(chunk);
          if (chunk.type === "error" && callbacks.onError) callbacks.onError(chunk.errorMessage);
          if (chunk.type === "done" && callbacks.onDone) callbacks.onDone();
        } catch (e) {
          console.error("Error parsing stream chunk:", e);
        }
      }
    }
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
