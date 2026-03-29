"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { setActiveConversation } from "@/src/store/slices/chatSlice";
import { Conversation } from "@/src/types/chat.types";

// ─── Helpers ─────────────────────────────────────────────

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Avatar ───────────────────────────────────────────────

const Avatar: FC<{ name: string; avatarUrl?: string | null; compact?: boolean }> = ({
  name, avatarUrl, compact,
}) => {
  const cls = compact ? "w-8 h-8" : "w-9 h-9";
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${cls} rounded-full bg-[#f5d800]/20 border border-[#f5d800]/30 flex items-center justify-center shrink-0`}>
      <span className="text-[#f5d800] text-[11px] font-bold leading-none">{getInitials(name)}</span>
    </div>
  );
};

// ─── ConversationItem ─────────────────────────────────────

const ConversationItem: FC<{
  conversation: Conversation;
  isActive: boolean;
  compact?: boolean;
  onClick: () => void;
}> = ({ conversation, isActive, compact, onClick }) => {
  const { otherUserName, otherUserAvatarUrl, lastMessage, lastMessageAt, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;
  const py = compact ? "py-2" : "py-2.5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-2.5 ${py} rounded-xl text-left transition-all duration-150
        ${isActive
          ? "bg-[#f5d800]/8 border border-[#f5d800]/20"
          : "border border-transparent hover:bg-white/5"
        }
      `}
    >
      {/* Online dot + Avatar */}
      <div className="relative shrink-0">
        <Avatar name={otherUserName} avatarUrl={otherUserAvatarUrl} compact={compact} />
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className={`text-[13px] font-semibold truncate ${isActive ? "text-[#f5d800]" : "text-white"}`}>
            {otherUserName}
          </span>
          {lastMessageAt && (
            <span className="text-[10px] text-gray-600 shrink-0">
              {fmtTime(lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <p className={`text-[11px] truncate leading-snug ${hasUnread ? "text-gray-300 font-medium" : "text-gray-500"}`}>
            {lastMessage ?? <span className="italic text-gray-600">No messages yet</span>}
          </p>
          {hasUnread && (
            <span className="shrink-0 min-w-[16px] h-4 rounded-full bg-[#f5d800] text-black text-[9px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Empty State ─────────────────────────────────────────

const EmptyState: FC<{ isSearching?: boolean }> = ({ isSearching }) => (
  <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
      <MessageSquare className="w-5 h-5 text-gray-600" />
    </div>
    <p className="text-xs font-semibold text-gray-400">
      {isSearching ? "No results found" : "No conversations yet"}
    </p>
    {!isSearching && (
      <p className="text-[10px] text-gray-600 mt-1">
        Start a chat from a product page
      </p>
    )}
  </div>
);

// ─── ConversationList ─────────────────────────────────────

interface ConversationListProps {
  onSelectConversation?: (id: number) => void;
  compact?: boolean;
}

const ConversationList: FC<ConversationListProps> = ({
  onSelectConversation,
  compact,
}) => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(c => c.otherUserName.toLowerCase().includes(q));
  }, [conversations, query]);

  const handleSelect = useCallback(
    (id: number) => {
      dispatch(setActiveConversation(id));
      onSelectConversation?.(id);
    },
    [dispatch, onSelectConversation],
  );

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Search */}
      <div className={`${compact ? "px-2.5 py-2" : "px-3 py-2.5"} shrink-0`}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className={`
              w-full bg-[#1a1a1a] border border-[#1e2126] rounded-lg
              pl-8 pr-3 ${compact ? "py-1.5 text-[11px]" : "py-2 text-xs"}
              text-white placeholder-gray-600
              focus:outline-none focus:border-[#f5d800]/40 focus:ring-1 focus:ring-[#f5d800]/15
              transition-colors
            `}
          />
        </div>
      </div>

      {/* List */}
      <div className={`flex-1 overflow-y-auto ${compact ? "px-1.5 pb-2" : "px-2 pb-3"} space-y-0.5 custom-scrollbar scrollbar-thumb-[#f5d800] scrollbar-track-transparent`}>
        {filtered.length === 0 ? (
          <EmptyState isSearching={query.length > 0} />
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.conversationId}
              conversation={conv}
              isActive={conv.conversationId === activeConversationId}
              compact={compact}
              onClick={() => handleSelect(conv.conversationId)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
