"use client";

import { useCallback, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import {
  setActiveConversation,
  toggleWidget,
  setWidgetOpen,
} from "@/src/store/slices/chatSlice";
import ConversationList from "@/src/components/chat/ConversationList";
import ChatArea from "@/src/components/chat/ChatArea";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Total unread badge ───────────────────────────────────

function useUnreadTotal(): number {
  return useAppSelector((state) =>
    state.chat.conversations.reduce(
      (sum, c) => sum + (c.unreadCount ?? 0),
      0,
    ),
  );
}

// ─── Widget ───────────────────────────────────────────────

export default function FloatingChatWidget() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.chat.isWidgetOpen);
  const activeConversationId = useAppSelector(
    (state) => state.chat.activeConversationId,
  );
  const totalUnread = useUnreadTotal();
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Hide entirely on /chat page — the full page IS the chat
  const isOnChatPage = pathname?.startsWith("/chat");

  // ── Close on outside click ────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        dispatch(setWidgetOpen(false));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, dispatch]);

  // ── Close on ESC ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(setWidgetOpen(false));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, dispatch]);

  const toggle = useCallback(() => dispatch(toggleWidget()), [dispatch]);
  const handleBack = useCallback(() => dispatch(setActiveConversation(null)), [dispatch]);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // Don't render on the /chat page or when not authenticated
  if (!isAuthenticated || isOnChatPage) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[200] flex flex-col items-end gap-3">

      {/* ── Popover ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-widget"
            ref={popoverRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.7 }}
            className="
              w-[320px] sm:w-[360px] flex flex-col
              bg-[#111111] border border-[#1e2126]
              rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.7)]
              overflow-hidden
            "
            style={{ height: "min(500px, calc(100vh - 100px))", transformOrigin: "bottom right" }}
          >
            {/* Popover header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1e2126] bg-[#151515] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#f5d800]/10 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-[#f5d800]" />
                </div>
                <Link
                  href="/chat"
                  className="text-sm font-bold text-white tracking-tight hover:text-[#f5d800] transition-colors"
                  onClick={() => dispatch(setWidgetOpen(false))}
                >
                  Messages
                </Link>
                {totalUnread > 0 && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#f5d800] text-black text-[10px] font-bold px-1">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch(setWidgetOpen(false))}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Minimize chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Popover body — must be min-h-0 so flex children can scroll */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeConversationId ? (
                <ChatArea onBack={handleBack} compact />
              ) : (
                <ConversationList compact />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB trigger button ─────────────────────────── */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close messages" : "Open messages"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="
          relative w-12 h-12 rounded-full
          bg-[#f5d800] text-black shadow-lg shadow-[#f5d800]/25
          flex items-center justify-center
          ring-4 ring-[#f5d800]/15
        "
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <MessageSquare className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {!isOpen && totalUnread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="
                absolute -top-1 -right-1
                min-w-[18px] h-[18px] flex items-center justify-center
                rounded-full bg-red-500 text-white text-[10px] font-bold px-1
                ring-2 ring-[#0a0a0a]
              "
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
