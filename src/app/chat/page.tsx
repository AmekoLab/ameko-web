"use client";

import { useState } from "react";
import { MessageSquareDashed, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { setActiveConversation } from "@/src/store/slices/chatSlice";
import ConversationList from "@/src/components/chat/ConversationList";
import ChatArea from "@/src/components/chat/ChatArea";

// ─── Skeleton loader (while conversations fetch on reload) ────────────────────

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-white/8 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-32 rounded-full bg-white/8" />
            <div className="h-2 w-24 rounded-full bg-white/5" />
          </div>
          <div className="h-2 w-8 rounded-full bg-white/5 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Desktop empty state ──────────────────────────────────

function NoConversationSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#1e2126] flex items-center justify-center mb-5">
        <MessageSquareDashed className="w-8 h-8 text-gray-600" />
      </div>
      <h2 className="text-base font-bold text-gray-200 mb-2">Your Messages</h2>
      <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
        Select a conversation from the sidebar, or start a new chat from a product page.
      </p>
      <div className="mt-5 flex items-center gap-2 text-[10px] text-gray-700">
        <div className="w-8 h-px bg-[#1e2126]" />
        <span>Messages are end-to-end secured</span>
        <div className="w-8 h-px bg-[#1e2126]" />
      </div>
    </div>
  );
}

// ─── Sidebar header ───────────────────────────────────────

function SidebarHeader() {
  const totalUnread = useAppSelector((state) =>
    state.chat.conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0)
  );
  const count = useAppSelector((state) => state.chat.conversations.length);
  const isLoading = useAppSelector((state) => state.chat.isLoadingConversations);

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1e2126] shrink-0">
      <div className="flex items-center gap-2.5">
        <Users className="w-4 h-4 text-[#f5d800]" />
        <h1 className="text-sm font-bold text-white">Messages</h1>
        {totalUnread > 0 && (
          <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#f5d800] text-black text-[10px] font-bold px-1">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </div>
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 text-gray-600 animate-spin" />
      ) : (
        <span className="text-[10px] text-gray-600">{count} chat{count !== 1 ? "s" : ""}</span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);

  // Chat loading state — drives skeleton vs. real list
  const isLoadingConversations = useAppSelector((state) => state.chat.isLoadingConversations);
  const conversationsInitialized = useAppSelector((state) => state.chat.conversationsInitialized);

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const handleSelectConversation = (id: number) => {
    dispatch(setActiveConversation(id));
    setMobileView("chat");
  };

  const handleBack = () => {
    dispatch(setActiveConversation(null));
    setMobileView("list");
  };

  const showList = mobileView === "list";

  return (
    <div className="h-[100dvh] bg-[#0a0a0a] flex overflow-hidden">

      {/* ── Left sidebar ──────────────────────────────────── */}
      <aside
        className={`
          flex-col
          w-full md:w-72 lg:w-80 xl:w-96 shrink-0
          border-r border-[#1e2126] bg-[#111111]
          md:flex
          ${showList ? "flex" : "hidden"}
        `}
      >
        <SidebarHeader />

        {/* Show skeleton while first load, then the real list */}
        {isLoadingConversations && !conversationsInitialized ? (
          <ConversationSkeleton />
        ) : (
          <ConversationList onSelectConversation={handleSelectConversation} />
        )}
      </aside>

      {/* ── Right main area ───────────────────────────────── */}
      <main
        className={`
          flex-1 min-w-0
          md:flex md:flex-col
          ${!showList ? "flex flex-col" : "hidden"}
        `}
      >
        <AnimatePresence mode="wait">
          {activeConversationId ? (
            <motion.div
              key={activeConversationId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              <ChatArea onBack={handleBack} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              <NoConversationSelected />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
