import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  RetryContext,
} from "@microsoft/signalr";
import { AppDispatch } from "@/src/store";
import {
  setConnectionStatus,
  updateMessageReaction,
  markMessagesAsRead,
} from "@/src/store/slices/chatSlice";
import { Message } from "@/src/types/chat.types";

interface ReactionChangedPayload {
  conversationId: number;
  messageId: number;
  reactions: Message["reactions"];
}

interface ReadReceiptPayload {
  conversationId: number;
  messageIds: number[];
}

function buildHubUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1";
  const baseUrl = apiUrl.replace(/\/api\/v\d+\/?$/, "");
  return `${baseUrl}/hub`;
}

class SocketService {
  private connection: HubConnection | null = null;
  private dispatch: AppDispatch | null = null;
  private messageHandlers = new Set<(msg: Message) => void>();

  async connect(token: string, dispatch: AppDispatch): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;

    this.dispatch = dispatch;

    this.connection = new HubConnectionBuilder()
      .withUrl(buildHubUrl(), { accessTokenFactory: () => token })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext: RetryContext) => {
          const delays = [0, 2_000, 10_000, 30_000];
          return delays[retryContext.previousRetryCount] ?? null;
        },
      })
      .configureLogging(process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Error)
      .build();

    this.connection.onreconnecting(() => dispatch(setConnectionStatus("connecting")));
    this.connection.onreconnected(() => dispatch(setConnectionStatus("connected")));
    this.connection.onclose(() => dispatch(setConnectionStatus("disconnected")));

    this.registerEventListeners();

    try {
      dispatch(setConnectionStatus("connecting"));
      await this.connection.start();
      dispatch(setConnectionStatus("connected"));
    } catch (err) {
      console.error("[SocketService] Failed to connect:", err);
      dispatch(setConnectionStatus("disconnected"));
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    try {
      await this.connection.stop();
    } catch (err) {
      console.error("[SocketService] Error while disconnecting:", err);
    } finally {
      this.connection = null;
      this.dispatch?.(setConnectionStatus("disconnected"));
      this.dispatch = null;
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    this.assertConnected();
    try {
      await this.connection!.invoke("JoinConversation", conversationId);
    } catch (err) {
      console.error(`[SocketService] Failed to join conversation.`, err);
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    this.assertConnected();
    try {
      await this.connection!.invoke("LeaveConversation", conversationId);
    } catch (err) {
      console.error(`[SocketService] Failed to leave conversation.`, err);
    }
  }

  get state(): HubConnectionState | null {
    return this.connection?.state ?? null;
  }

  onMessageReceived(handler: (msg: Message) => void) {
    this.messageHandlers.add(handler);
  }

  offMessageReceived(handler: (msg: Message) => void) {
    this.messageHandlers.delete(handler);
  }

  private registerEventListeners(): void {
    if (!this.connection) return;

    // Listen to both camelCase and PascalCase to ensure the broadcast is caught
    const handleIncomingMessage = (message: Message) => {
      this.messageHandlers.forEach(handler => handler(message));
    };
    
    this.connection.on("messageReceived", handleIncomingMessage);
    this.connection.on("ReceiveMessage", handleIncomingMessage);

    this.connection.on("reactionChanged", (data: ReactionChangedPayload) => {
      this.dispatch?.(updateMessageReaction(data));
    });

    this.connection.on("readReceipt", (data: ReadReceiptPayload) => {
      this.dispatch?.(markMessagesAsRead(data));
    });
  }

  private assertConnected(): void {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error("[SocketService] Hub is not connected. Call connect() first.");
    }
  }
}

export const socketService = new SocketService();
