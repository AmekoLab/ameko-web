import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { chatService } from "@/src/services/chat.service";
import { Conversation, Message } from "@/src/types/chat.types";
import { RootState } from "@/src/store";

// ─── Async Thunks ────────────────────────────────────────

export const fetchInitialConversations = createAsyncThunk(
  "chat/fetchInitialConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations(1, 20);
      if (!response.success) return rejectWithValue(response.message || "Failed to load conversations");
      return response.data.items;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load conversations");
    }
  },
);

export const fetchMessagesThunk = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId: number, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(conversationId.toString());
      if (!response.success) return rejectWithValue(response.message || "Failed to fetch messages");
      return { conversationId, items: response.data.items };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  },
);

export const markMessagesReadThunk = createAsyncThunk(
  "chat/markRead",
  async (
    { conversationId, upToMessageId }: { conversationId: number; upToMessageId: number },
    { rejectWithValue, dispatch },
  ) => {
    // Optimistically update
    dispatch(chatSlice.actions.optimisticMarkAsRead({ conversationId }));
    try {
      const response = await chatService.markAsRead(conversationId.toString(), { upToMessageId });
      if (!response.success) throw new Error(response.message || "Failed to mark as read");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark as read");
    }
  },
);

export const reactToMessageThunk = createAsyncThunk(
  "chat/reactToMessage",
  async (
    { conversationId, messageId, reaction }: { conversationId: number; messageId: number; reaction: number | null },
    { rejectWithValue },
  ) => {
    try {
      const response = await chatService.reactToMessage(conversationId, messageId, { reaction });
      if (!response.success) return rejectWithValue(response.message || "Failed to react to message");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to react to message");
    }
  },
);

export const sendMessageThunk = createAsyncThunk(
  "chat/sendMessage",
  async (
    payload: { conversationId: number; content: string; messageType?: number; tempId: string; senderId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await chatService.sendMessage({
        conversationId: payload.conversationId,
        content: payload.content,
        messageType: payload.messageType ?? 0,
      });
      if (!response.success) return rejectWithValue(response.message || "Failed to send message");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  },
);

export const startConversationThunk = createAsyncThunk(
  "chat/startConversation",
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await chatService.getOrCreateDirectRoom(targetUserId);
      if (!response.success) return rejectWithValue(response.message || "Failed to open conversation");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to open conversation");
    }
  },
);

// ─── State ───────────────────────────────────────────────

type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Record<number, Message[]>;
  connectionStatus: ConnectionStatus;
  isWidgetOpen: boolean;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  connectionStatus: "disconnected",
  isWidgetOpen: false,
};

// ─── Helpers ─────────────────────────────────────────────

function bubbleToTop(conversations: Conversation[], id: number) {
  const idx = conversations.findIndex((c) => c.conversationId === id);
  if (idx > 0) {
    const [conv] = conversations.splice(idx, 1);
    conversations.unshift(conv);
  }
}

// ─── Slice ───────────────────────────────────────────────

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    toggleWidget(state) {
      state.isWidgetOpen = !state.isWidgetOpen;
    },
    setWidgetOpen(state, action: PayloadAction<boolean>) {
      state.isWidgetOpen = action.payload;
    },
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
      action.payload.forEach((c) => {
        if (!state.messages[c.conversationId]) state.messages[c.conversationId] = [];
      });
    },
    setActiveConversation(state, action: PayloadAction<number | null>) {
      state.activeConversationId = action.payload;
    },
    receiveMessage(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const { conversationId } = message;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      const bucket = state.messages[conversationId];
      
      // Prevent duplicates from SignalR and REST API sync overlaps
      const alreadyExists = bucket.some(
        (m) => m.id === message.id || (message.tempId && m.tempId === message.tempId)
      );

      if (!alreadyExists) {
        // Find if there is a temp message that we're catching up to
        const tempIdx = message.tempId ? bucket.findIndex(m => m.tempId === message.tempId) : -1;
        if (tempIdx !== -1) {
          bucket[tempIdx] = { ...message, status: "sent" };
        } else {
          bucket.push({ ...message, status: "sent" });
        }
      }

      // Update Sidebar Preview
      const conversation = state.conversations.find((c) => c.conversationId === conversationId);
      if (conversation) {
        conversation.lastMessage = message.content;
        // Only increment badge if this is NOT the active conversation
        if (state.activeConversationId !== conversationId) {
          conversation.unreadCount = (conversation.unreadCount ?? 0) + 1;
        }
      }
      
      bubbleToTop(state.conversations, conversationId);
    },
    setMessages(state, action: PayloadAction<{ conversationId: number; messages: Message[] }>) {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    updateMessageReaction(state, action: PayloadAction<{ conversationId: number; messageId: number; reactions: any }>) {
      const { conversationId, messageId, reactions } = action.payload;
      const bucket = state.messages[conversationId];
      if (!bucket) return;
      const message = bucket.find((m) => m.id === messageId);
      if (message) message.reactions = reactions;
    },
    optimisticMarkAsRead(state, action: PayloadAction<{ conversationId: number }>) {
      const conversation = state.conversations.find((c) => c.conversationId === action.payload.conversationId);
      if (conversation) conversation.unreadCount = 0;
    },
    markMessagesAsRead(state, action: PayloadAction<{ conversationId: number; messageIds: number[] }>) {
      const { conversationId, messageIds } = action.payload;
      const idSet = new Set(messageIds);
      const bucket = state.messages[conversationId];
      if (bucket) {
        bucket.forEach((m) => {
          if (idSet.has(m.id)) m.isRead = true;
        });
      }
      const conversation = state.conversations.find((c) => c.conversationId === conversationId);
      if (conversation) conversation.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        action.payload.forEach((c: Conversation) => {
          if (!state.messages[c.conversationId]) state.messages[c.conversationId] = [];
        });
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { conversationId, items } = action.payload;
        state.messages[conversationId] = items;
      })
      .addCase(reactToMessageThunk.fulfilled, (state, action) => {
        const { conversationId, messageId, reaction } = action.meta.arg;
        const bucket = state.messages[conversationId];
        if (!bucket) return;
        const message = bucket.find((m) => m.id === messageId);
        if (!message) return;
        
        const responseData = action.payload as any;
        const userId = responseData?.userId;
        if (!userId) return;

        let currentReactions = message.reactions || [];
        if (!Array.isArray(currentReactions)) {
          currentReactions = Object.entries(currentReactions).map(([uId, r]) => ({ userId: uId, reaction: r as number }));
        }

        const existingIdx = currentReactions.findIndex((r) => r.userId === userId);
        if (reaction === null) {
          if (existingIdx !== -1) currentReactions.splice(existingIdx, 1);
        } else {
          if (existingIdx !== -1) currentReactions[existingIdx].reaction = reaction;
          else currentReactions.push({ userId, reaction });
        }
        message.reactions = currentReactions;
      })
      .addCase(sendMessageThunk.pending, (state, action) => {
        const { conversationId, content, messageType, tempId, senderId } = action.meta.arg;
        if (!state.messages[conversationId]) state.messages[conversationId] = [];

        // Optimistically generate the message
        state.messages[conversationId].push({
          id: -Date.now(),
          tempId,
          status: "sending",
          conversationId,
          content,
          messageType: messageType ?? 0,
          senderId,
          createdAt: new Date().toISOString(),
          parentMessageId: null,
        });

        const conversation = state.conversations.find((c) => c.conversationId === conversationId);
        if (conversation) conversation.lastMessage = content;
        bubbleToTop(state.conversations, conversationId);
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const sentMessage = action.payload;
        if (!sentMessage) return;
        const { tempId } = action.meta.arg;
        const { conversationId } = sentMessage;
        
        if (!state.messages[conversationId]) state.messages[conversationId] = [];
        
        const bucket = state.messages[conversationId];
        const tempIdx = bucket.findIndex((m) => m.tempId === tempId);
        const exists = bucket.some((m) => m.id === sentMessage.id);

        if (tempIdx !== -1) {
          if (exists) bucket.splice(tempIdx, 1);
          else bucket[tempIdx] = { ...sentMessage, status: "sent", tempId };
        } else if (!exists) {
          bucket.push({ ...sentMessage, status: "sent", tempId });
        }
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        const { conversationId, tempId } = action.meta.arg;
        const bucket = state.messages[conversationId];
        if (bucket) {
          const tempMsg = bucket.find((m) => m.tempId === tempId);
          if (tempMsg) tempMsg.status = "error";
        }
      })
      .addCase(startConversationThunk.fulfilled, (state, action) => {
        const room = action.payload;
        if (!room) return;
        const exists = state.conversations.some((c) => c.conversationId === room.conversationId);
        if (!exists) {
          state.conversations.unshift(room);
          state.messages[room.conversationId] = [];
        } else {
          bubbleToTop(state.conversations, room.conversationId);
        }
        state.activeConversationId = room.conversationId;
        state.isWidgetOpen = true;
      });
  },
});

export const {
  toggleWidget,
  setWidgetOpen,
  setConnectionStatus,
  setConversations,
  setActiveConversation,
  receiveMessage,
  setMessages,
  updateMessageReaction,
  markMessagesAsRead,
  optimisticMarkAsRead
} = chatSlice.actions;

// Stable reselct selector for messages to avoid unnecessary array creations
export const selectMessagesForConversation = createSelector(
  [(state: RootState) => state.chat.messages, (state: RootState, conversationId: number | null) => conversationId],
  (messagesMap, conversationId) => {
    if (!conversationId) return [];
    return messagesMap[conversationId] || [];
  }
);

export default chatSlice.reducer;
