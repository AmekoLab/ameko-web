"use client";

import { FC, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { setActiveConversation } from "@/src/store/slices/chatSlice";
import { Conversation } from "@/src/types/chat.types";

// ─── Helpers ─────────────────────────────────────────────

const getInitials = (name?: string) => {
  if (!name) return "U"; // Nếu không có tên, trả về chữ "U" (User) mặc định
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Avatar ───────────────────────────────────────────────

const Avatar: FC<{ name: string; avatarUrl?: string | null; size?: number }> = ({
  name,
  avatarUrl,
  size = 10,
}) => {
  const sizeCls = `w-${size} h-${size}`;
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeCls} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeCls} rounded-full bg-[#f5d800]/20 border border-[#f5d800]/30 flex items-center justify-center shrink-0`}
    >
      <span className="text-[#f5d800] text-xs font-bold leading-none">
        {getInitials(name)}
      </span>
    </div>
  );
};

// ─── ConversationItem ─────────────────────────────────────

const ConversationItem: FC<{
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}> = ({ conversation, isActive, onClick }) => {
  const { otherUserName, otherUserAvatarUrl, lastMessage, lastMessageAt, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all
        ${isActive
          ? "bg-white/8 border-l-2 border-[#f5d800] pl-[10px]"
          : "border-l-2 border-transparent hover:bg-white/5"
        }
      `}
    >
      {/* Avatar */}
      <Avatar name={otherUserName} avatarUrl={otherUserAvatarUrl} size={10} />

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-sm font-semibold truncate ${
              isActive ? "text-[#f5d800]" : "text-white"
            }`}
          >
            {otherUserName}
          </span>
          {lastMessageAt && (
            <span className="text-[10px] text-gray-500 shrink-0">
              {fmtTime(lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-400 truncate leading-relaxed">
            {lastMessage ?? (
              <span className="italic text-gray-600">No messages yet</span>
            )}
          </p>
          {hasUnread && (
            <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-[#f5d800] text-black text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Empty State ─────────────────────────────────────────

const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
      <MessageSquare className="w-6 h-6 text-gray-600" />
    </div>
    <p className="text-sm font-semibold text-gray-400">No conversations yet</p>
    <p className="text-xs text-gray-600 mt-1">
      Start a new chat to get things going
    </p>
  </div>
);

// ─── ConversationList ─────────────────────────────────────

interface ConversationListProps {
  onSelectConversation?: (id: number) => void;
}

const ConversationList: FC<ConversationListProps> = ({
  onSelectConversation,
}) => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const activeConversationId = useAppSelector(
    (state) => state.chat.activeConversationId,
  );

  const handleSelect = useCallback(
    (id: number) => {
      dispatch(setActiveConversation(id));
      onSelectConversation?.(id);
    },
    [dispatch, onSelectConversation],
  );

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
    

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {conversations.length === 0 ? (
          <EmptyState />
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              
              key={conv.conversationId}
              conversation={conv}
              isActive={conv.conversationId === activeConversationId}
              onClick={() => handleSelect(conv.conversationId)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
