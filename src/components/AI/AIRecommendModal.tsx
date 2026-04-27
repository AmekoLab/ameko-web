"use client";

import Link from "next/link";
import {
  Dispatch,
  FormEvent,
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Globe,
  History,
  Loader2,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { aiService } from "@/src/services/ai.service";
import type {
  AIConversation,
  AIRecommendedItem,
} from "@/src/types/ai.types";
import type { ChatMessage } from "./AIAssistantWidget";
import { useTranslations } from "next-intl";

interface AIRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId?: string;
  baseKitId?: string;
  assembledProductId?: string;
  // ── Lifted state from AIAssistantWidget ──────────────────────────
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  conversationId: number | null;
  setConversationId: Dispatch<SetStateAction<number | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  onNewChat: () => void;
}

const SUGGESTED_PROMPTS = [
  "Tư vấn bàn phím dưới 2 triệu",
  "Linear switch là gì?",
  "Cách lube switch đúng cách",
  "Build phím cho dân văn phòng",
];

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ── Sub-components ─────────────────────────────────────────────────

function TypingIndicator() {
  const delays = ["0ms", "150ms", "300ms"];

  return (
    <div className="flex items-center gap-1.5 py-1">
      {delays.map((delay, index) => (
        <span
          key={`${delay}-${index}`}
          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  );
}

function ProductCard({ item }: { item: AIRecommendedItem }) {
  const linkHref = item.detailPath || item.shopUrl;
  const hasLink = Boolean(linkHref);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
              Ảnh
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold text-slate-900">
            {item.name}
          </p>
          <p className="mt-1 text-sm font-semibold text-rose-600">
            {VND_FORMATTER.format(item.price)}
          </p>

          {hasLink ? (
            <Link
              href={linkHref!}
              className="mt-2 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              Xem chi tiết
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-2 inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────

function ConversationSidebar({
  conversations,
  activeId,
  isLoadingHistory,
  onSelect,
  onNewChat,
  isOpen,
  onToggle,
}: {
  conversations: AIConversation[];
  activeId: number | null;
  isLoadingHistory: boolean;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {isOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200 bg-slate-100/80 backdrop-blur-sm transition-transform duration-300 ease-in-out
          md:relative md:z-auto md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <History className="h-4 w-4" />
            Lịch sử
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 md:hidden"
            aria-label="Đóng sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* New chat button */}
        <div className="border-b border-slate-200 px-3 py-2.5">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Trò chuyện mới
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-slate-400">
              Chưa có cuộc trò chuyện nào.
            </p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(conv.id)}
                      className={`group w-full rounded-lg px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? "border border-blue-200 bg-blue-50 shadow-sm"
                          : "border border-transparent hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <p
                        className={`truncate text-xs font-semibold ${
                          isActive ? "text-blue-700" : "text-slate-800"
                        }`}
                      >
                        {conv.title || "Cuộc trò chuyện"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {conv.lastMessage || "…"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────

export default function AIRecommendModal({
  isOpen,
  onClose,
  messages,
  setMessages,
  conversationId,
  setConversationId,
  isLoading,
  setIsLoading,
  onNewChat,
}: AIRecommendModalProps) {
  const [prompt, setPrompt] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("AiAssistant");
  

  // ── Fetch conversation list when modal opens ─────────────────────
  const fetchConversations = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const list = await aiService.getConversations();
      setConversations(list ?? []);
    } catch {
      // Silently fail – sidebar just shows empty state
      setConversations([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // Reset only transient input state on close
  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setSidebarOpen(false);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // ── Load a conversation from history ─────────────────────────────
  const handleSelectConversation = async (id: number) => {
    if (id === conversationId || isLoadingMessages) return;

    setIsLoadingMessages(true);
    try {
      const history = await aiService.getMessages(id);

      // Map AIMessage[] → ChatMessage[]
      const mapped: ChatMessage[] = (history ?? []).map((m) => ({
        id: String(m.id),
        role: m.role === "assistant" ? "ai" : "user",
        content: m.content,
        items: m.items ?? undefined,
        totalEstimatedPrice: m.estimatedPrice,
        usedWebSearch: m.usedWebSearch,
        sourceLinks: m.sourceLinks ?? undefined,
      }));

      setConversationId(id);
      setMessages(mapped);

      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch {
      toast.error(t("errorLoadHistory") || "Không thể tải lịch sử. Vui lòng thử lại!");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    void fetchConversations();
  };

  // ── Send message ─────────────────────────────────────────────────
  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendPrompt = async (forcedPrompt?: string) => {
    const nextPrompt = (forcedPrompt ?? prompt).trim();
    if (!nextPrompt || isLoading) return;

    pushMessage({
      id: createMessageId(),
      role: "user",
      content: nextPrompt,
    });
    setPrompt("");

    setIsLoading(true);
    try {
      const responseData = await aiService.sendMessage({
        conversationId,
        message: nextPrompt,
      });

      // Persist conversationId for multi-turn context
      if (responseData.conversationId && conversationId === null) {
        setConversationId(responseData.conversationId);
        // Refresh sidebar to include the new conversation
        void fetchConversations();
      }

      pushMessage({
        id: createMessageId(),
        role: "ai",
        content:
          responseData.reply?.trim() ||
          (t("noData") || "Mình đã nhận yêu cầu của bạn nhưng chưa có đủ dữ liệu để tư vấn rõ hơn."),
        items: responseData.items,
        totalEstimatedPrice: responseData.estimatedPrice,
        usedWebSearch: responseData.usedWebSearch,
        sourceLinks: responseData.sourceLinks,
      });
    } catch (_error) {
      pushMessage({
        id: createMessageId(),
        role: "ai",
        content:
          (t("errorSupport") || "Xin lỗi, mình chưa thể tư vấn lúc này. Bạn thử lại trong ít phút nhé."),
      });
      toast.error(t("errorSupport") || "AI tư vấn thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendPrompt();
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    setPrompt(suggestion);
    void sendPrompt(suggestion);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendPrompt();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-recommend-modal-title"
    >
      <div
        className="relative flex h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <ConversationSidebar
          conversations={conversations}
          activeId={conversationId}
          isLoadingHistory={isLoadingHistory}
          onSelect={(id) => void handleSelectConversation(id)}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* ── Chat column ─────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center gap-2.5">
              {/* Sidebar toggle (always visible on mobile, subtle on desktop) */}
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Mở lịch sử"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2
                id="ai-recommend-modal-title"
                className="text-lg font-semibold text-slate-900"
              >
                {t('aiAssistant')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleNewChat}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Cuộc trò chuyện mới"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('newConversation')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Messages area ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {/* Loading overlay when switching conversations */}
            {isLoadingMessages && (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-400">
                    {t('loadingHistory')}
                  </span>
                </div>
              </div>
            )}

            {!isLoadingMessages && messages.length === 0 ? (
              <div className="mx-auto max-w-3xl space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm sm:max-w-[75%]">
                    <p className="font-semibold text-slate-900">
                      {t('welcome')}
                    </p>
                    <p className="mt-1 leading-relaxed">
                      {t('suggest')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              !isLoadingMessages && (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "user" ? (
                        <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm text-white shadow-sm sm:max-w-[75%]">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <div className="flex max-w-[90%] items-start gap-3 sm:max-w-[75%]">
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <Sparkles className="h-4 w-4" />
                          </div>

                          <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>

                            {/* Web search sources */}
                            {message.usedWebSearch &&
                              message.sourceLinks &&
                              message.sourceLinks.length > 0 && (
                                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <Globe className="h-3.5 w-3.5" />
                                    <span>{t('source')}</span>
                                  </div>
                                  <ul className="list-disc space-y-1 pl-4">
                                    {message.sourceLinks.map((link, idx) => (
                                      <li key={idx}>
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="break-all text-xs text-blue-600 underline decoration-blue-300 transition-colors hover:text-blue-800"
                                        >
                                          {link.title || link.url}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {message.items && message.items.length > 0 && (
                              <div className="mt-3 space-y-2.5">
                                {message.items.map((item, idx) => (
                                  <ProductCard
                                    key={item.id || item.productId || idx}
                                    item={item}
                                  />
                                ))}

                                {typeof message.totalEstimatedPrice ===
                                  "number" && (
                                  <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                      {t('totalEstimatedPrice')}
                                    </span>
                                    <span className="text-sm font-black text-blue-700">
                                      {VND_FORMATTER.format(
                                        message.totalEstimatedPrice,
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[90%] items-start gap-3 sm:max-w-[75%]">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <Sparkles className="h-4 w-4" />
                        </div>

                        <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                          <TypingIndicator />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )
            )}
          </div>

          {/* ── Input area ────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={t('placeholder')}
                rows={2}
                className="w-full resize-none rounded-lg border-0 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                  {t('send')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
