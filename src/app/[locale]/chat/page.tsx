"use client";

import { useState } from "react";
import { MessageSquareDashed, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { setActiveConversation } from "@/src/store/slices/chatSlice";
import ConversationList from "@/src/components/chat/ConversationList";
import ChatArea from "@/src/components/chat/ChatArea";
import { useTranslations } from "next-intl";

// ─── Skeleton loader (while conversations fetch on reload) ────────────────────

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-sm">
          <div className="w-9 h-9 rounded-full bg-neutral-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-32 rounded-sm bg-neutral-200" />
            <div className="h-2 w-24 rounded-sm bg-neutral-100" />
          </div>
          <div className="h-2 w-8 rounded-sm bg-neutral-100 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Desktop empty state ──────────────────────────────────

function NoConversationSelected() {
  const t = useTranslations("ChatPage");

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10 bg-amazon-bgSecondary">
      <div className="w-16 h-16 rounded-sm bg-white border border-amazon-border flex items-center justify-center mb-5 shadow-sm">
        <MessageSquareDashed className="w-8 h-8 text-amazon-textMuted" />
      </div>
      <h2 className="text-base font-black text-amazon-text mb-2">
        {t("emptyTitle")}
      </h2>
      <p className="text-xs text-amazon-textMuted max-w-xs leading-relaxed font-bold">
        {t("emptyDescription")}
      </p>
      <div className="mt-5 flex items-center gap-2 text-[10px] text-amazon-textMuted font-bold">
        <div className="w-8 h-px bg-amazon-border" />
        <span>{t("securedLabel")}</span>
        <div className="w-8 h-px bg-amazon-border" />
      </div>
    </div>
  );
}

// ─── Sidebar header ───────────────────────────────────────

function SidebarHeader() {
  const t = useTranslations("ChatPage");
  const totalUnread = useAppSelector((state) =>
    state.chat.conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0),
  );
  const count = useAppSelector((state) => state.chat.conversations.length);
  const isLoading = useAppSelector(
    (state) => state.chat.isLoadingConversations,
  );

  return (
    <div className="flex items-center justify-between px-4 py-3.5 z-10">
      <div className="flex items-center gap-2.5">
        <Users className="w-4 h-4 text-amazon-btnSecondary" />
        <h1 className="text-sm font-black text-amazon-text ">
          {t("messages")}
        </h1>
        {totalUnread > 0 && (
          <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-sm bg-amazon-btnPrimary text-amazon-text text-[10px] font-black px-1">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </div>
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 text-amazon-textMuted animate-spin" />
      ) : (
        <span className="text-[10px] text-amazon-textMuted font-bold uppercase tracking-widest">
          {count} {count === 1 ? t("chatSingular") : t("chatPlural")}
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const activeConversationId = useAppSelector(
    (state) => state.chat.activeConversationId,
  );

  // Chat loading state — drives skeleton vs. real list
  const isLoadingConversations = useAppSelector(
    (state) => state.chat.isLoadingConversations,
  );
  const conversationsInitialized = useAppSelector(
    (state) => state.chat.conversationsInitialized,
  );

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
    <div className="h-[100dvh] bg-amazon-bgSecondary text-amazon-text flex overflow-hidden font-sans">
      {/* ── Left sidebar ──────────────────────────────────── */}
      <aside
        className={`
          flex-col
          w-full md:w-72 lg:w-80 xl:w-96 shrink-0
          border-r border-amazon-border bg-white
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
