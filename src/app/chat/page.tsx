"use client";

import { MessageSquareDashed } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { setActiveConversation } from "@/src/store/slices/chatSlice";
import ConversationList from "@/src/components/chat/ConversationList";
import ChatArea from "@/src/components/chat/ChatArea";

// ─── Desktop empty state ──────────────────────────────────

function NoConversationSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10">
      <div className="w-20 h-20 rounded-full bg-white/5 border border-[#1e2126] flex items-center justify-center mb-6">
        <MessageSquareDashed className="w-9 h-9 text-gray-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-200 mb-2">Your Messages</h2>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        Select a conversation from the sidebar to start chatting, or open a
        product to start a new one.
      </p>
      <div className="mt-6 w-12 h-0.5 bg-[#1e2126] rounded-full" />
      <p className="mt-4 text-xs text-gray-700">
        Messages are end-to-end secured
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const activeConversationId = useAppSelector(
    (state) => state.chat.activeConversationId,
  );

  const handleBack = () => dispatch(setActiveConversation(null));

  // ── Mobile: show either the list OR the chat (fullscreen)
  // ── Desktop: always show both columns side-by-side

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────────────
          On mobile: hidden when a conversation is active.
          On desktop: always visible, fixed width.               */}
      <aside
        className={`
          w-full md:w-80 lg:w-96 shrink-0
          border-r border-[#1e2126]
          ${activeConversationId ? "hidden md:flex md:flex-col" : "flex flex-col"}
        `}
      >
        <ConversationList />
      </aside>

      {/* ── Right main area ───────────────────────────────────
          On mobile: only shown when a conversation is active.
          On desktop: always visible, fills remaining space.     */}
      <main
        className={`
          flex-1 min-w-0
          ${activeConversationId ? "flex flex-col" : "hidden md:flex md:flex-col"}
        `}
      >
        {activeConversationId ? (
          <ChatArea
            // Pass onBack only on mobile (hidden on ≥md via CSS)
            onBack={handleBack}
          />
        ) : (
          // Desktop empty-state (this branch only renders on md+ because
          // the container is `hidden md:flex` when no conversation is active)
          <NoConversationSelected />
        )}
      </main>
    </div>
  );
}
