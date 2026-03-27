"use client";

import { useCallback, useRef, useEffect } from "react";
import { MessageSquare, X, ChevronDown } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import {
  setActiveConversation,
  toggleWidget,
  setWidgetOpen,
} from "@/src/store/slices/chatSlice";
import ConversationList from "@/src/components/chat/ConversationList";
import ChatArea from "@/src/components/chat/ChatArea";
import Link from "next/link";

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
  // ── Bind open/close to Redux so startConversationThunk can open this widget
  const isOpen = useAppSelector((state) => state.chat.isWidgetOpen);
  const activeConversationId = useAppSelector(
    (state) => state.chat.activeConversationId,
  );
  const totalUnread = useUnreadTotal();
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handleBack = useCallback(() => {
    dispatch(setActiveConversation(null));
  }, [dispatch]);

  // ── Only render widget if the user is authenticated ──
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    // Fixed-position container — sits in front of all page content
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">

      {/* ── Popover ──────────────────────────────────────── */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="
            w-80 h-[520px] flex flex-col
            bg-[#111111] border border-[#1e2126]
            rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]
            overflow-hidden
            animate-in slide-in-from-bottom-4 fade-in duration-200
          "
        >
          {/* Popover header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2126] bg-[#151515] shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#f5d800]" />
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
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Popover body — switches between list and chat */}
          <div className="flex-1 min-h-0">
            {activeConversationId ? (
              <ChatArea onBack={handleBack} />
            ) : (
              <ConversationList />
            )}
          </div>
        </div>
      )}

      {/* ── FAB trigger button ───────────────────────────── */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close messages" : "Open messages"}
        className="
          relative w-14 h-14 rounded-full
          bg-[#f5d800] text-black shadow-lg
          flex items-center justify-center
          hover:bg-[#e6cc00] active:scale-95
          transition-all duration-150
          ring-2 ring-[#f5d800]/20
        "
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}

        {/* Unread total badge on the FAB */}
        {!isOpen && totalUnread > 0 && (
          <span className="
            absolute -top-1 -right-1
            min-w-[20px] h-5 flex items-center justify-center
            rounded-full bg-red-500 text-white text-[10px] font-bold px-1
            ring-2 ring-[#0a0a0a]
          ">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
