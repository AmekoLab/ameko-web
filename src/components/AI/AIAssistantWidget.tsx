"use client";

import { useState, useRef } from "react";
import { Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import AIRecommendModal from "./AIRecommendModal";
import type { AIRecommendedItem, AISourceLink } from "@/src/types/ai.types";

interface AIAssistantWidgetProps {
  shopId?: string;
  baseKitId?: string;
  assembledProductId?: string;
}

type ChatRole = "user" | "ai";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  items?: AIRecommendedItem[];
  totalEstimatedPrice?: number | null;
  usedWebSearch?: boolean;
  sourceLinks?: AISourceLink[];
}

export default function AIAssistantWidget({
  shopId,
  baseKitId,
  assembledProductId,
}: AIAssistantWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDragging = useRef(false);

  // ── Persistent chat state (survives modal close/reopen) ──────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        style={{ touchAction: "none" }}
        className="group fixed bottom-28 right-6 z-[99]"
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={() => { requestAnimationFrame(() => { isDragging.current = false; }); }}
      >
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
          AI Tư Vấn
        </span>

        <button
          type="button"
          onClick={() => {
            if (isDragging.current) return;
            setIsModalOpen((prev) => !prev);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 cursor-grab active:cursor-grabbing"
          aria-label={isModalOpen ? "Đóng AI Tư Vấn" : "Mở AI Tư Vấn"}
        >
          {isModalOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Sparkles className="h-6 w-6 animate-pulse" />
          )}
        </button>
      </motion.div>

      <AIRecommendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shopId={shopId}
        baseKitId={baseKitId}
        assembledProductId={assembledProductId}
        messages={messages}
        setMessages={setMessages}
        conversationId={conversationId}
        setConversationId={setConversationId}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onNewChat={handleNewChat}
      />
    </>
  );
}
