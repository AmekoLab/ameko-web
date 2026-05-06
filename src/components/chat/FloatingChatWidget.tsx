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

  const isDragging = useRef(false);

  const toggle = useCallback(() => {
    if (isDragging.current) return;
    dispatch(toggleWidget());
  }, [dispatch]);
  const handleBack = useCallback(() => dispatch(setActiveConversation(null)), [dispatch]);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // Don't render on the /chat page or when not authenticated
  if (!isAuthenticated || isOnChatPage) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      style={{ touchAction: "none" }}
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[200] flex flex-col items-end gap-3"
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={() => { requestAnimationFrame(() => { isDragging.current = false; }); }}
    >

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
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="
              w-[320px] sm:w-[360px] flex flex-col
              bg-white border border-amazon-border
              rounded-lg shadow-2xl
              overflow-hidden
            "
            style={{ height: "min(500px, calc(100vh - 100px))", transformOrigin: "bottom right" }}
          >
            {/* Popover header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-amazon-border bg-white shadow-sm shrink-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-amazon-btnSecondary flex items-center justify-center border border-amazon-border">
                  <MessageSquare className="w-3.5 h-3.5 text-amazon-text" />
                </div>
                <Link
                  href="/chat"
                  className="text-sm font-black text-amazon-text  hover:text-amazon-link transition-colors"
                  onClick={() => dispatch(setWidgetOpen(false))}
                >
                  Messages
                </Link>
                {totalUnread > 0 && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-sm bg-amazon-btnPrimary text-amazon-text text-[10px] font-black px-1">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch(setWidgetOpen(false))}
                className="p-1.5 rounded-sm border border-transparent text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 transition-colors"
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
          bg-amazon-btnPrimary text-amazon-text shadow-xl shadow-black/20
          flex items-center justify-center border border-amazon-border
          ring-2 ring-white cursor-grab active:cursor-grabbing
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
                rounded-sm bg-red-500 text-white text-[10px] font-bold px-1
                ring-2 ring-white
              "
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
