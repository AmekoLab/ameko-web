"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import { aiService } from "@/src/services/ai.service";
import type { AIRecommendedItem } from "@/src/types/ai.types";

interface AIRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId?: string;
  baseKitId?: string;
  assembledProductId?: string;
}

type ChatRole = "user" | "ai";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  items?: AIRecommendedItem[];
  totalEstimatedPrice?: number;
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
  const hasDetailPath = Boolean(item.detailPath);

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

          {hasDetailPath ? (
            <Link
              href={item.detailPath}
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

export default function AIRecommendModal({
  isOpen,
  onClose,
  shopId,
  baseKitId,
  assembledProductId,
}: AIRecommendModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setIsLoading(false);
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

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
      const response = await aiService.getRecommendation({
        userPrompt: nextPrompt,
        shopId,
        baseKitId,
        assembledProductId,
      });

      const content =
        response.reasoning?.trim() ||
        (response as { content?: string }).content?.trim() ||
        "Mình đã nhận yêu cầu của bạn nhưng chưa có đủ dữ liệu để tư vấn rõ hơn.";

      pushMessage({
        id: createMessageId(),
        role: "ai",
        content,
        items: response.items,
        totalEstimatedPrice: response.totalEstimatedPrice,
      });
    } catch (_error) {
      pushMessage({
        id: createMessageId(),
        role: "ai",
        content:
          "Xin lỗi, mình chưa thể tư vấn lúc này. Bạn thử lại trong ít phút nhé.",
      });
      toast.error("AI tư vấn thất bại. Vui lòng thử lại!");
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
        className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2
              id="ai-recommend-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              Trợ lý AI Build Phím
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm sm:max-w-[75%]">
                  <p className="font-semibold text-slate-900">
                    Xin chào, mình là trợ lý AI của bạn.
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Bạn có thể hỏi về build phím, switch, keycap hoặc ngân sách
                    để mình gợi ý cấu hình phù hợp.
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

                        {message.items && message.items.length > 0 && (
                          <div className="mt-3 space-y-2.5">
                            {message.items.map((item) => (
                              <ProductCard key={item.id} item={item} />
                            ))}

                            {typeof message.totalEstimatedPrice ===
                              "number" && (
                              <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                  Tổng ước tính
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
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Nhập câu hỏi về build phím của bạn..."
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
                Gửi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
