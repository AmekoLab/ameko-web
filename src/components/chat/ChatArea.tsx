"use client";

import {
  FC,
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  memo,
} from "react";
import { ArrowLeft, Send, Loader2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import {
  sendMessageThunk,
  setActiveConversation,
  fetchMessagesThunk,
  markMessagesReadThunk,
  reactToMessageThunk,
  selectMessagesForConversation,
} from "@/src/store/slices/chatSlice";
import { Message, REACTION_EMOJIS, REACTION_LABELS, ReactionType } from "@/src/types/chat.types";

// ─── Helpers ─────────────────────────────────────────────

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Reaction Picker ──────────────────────────────────────

const ALL_REACTIONS = [
  ReactionType.Like,
  ReactionType.Love,
  ReactionType.Haha,
  ReactionType.Wow,
  ReactionType.Sad,
  ReactionType.Angry,
];

const ReactionPicker: FC<{
  currentReaction: number | null | undefined;
  isMine: boolean;
  onPick: (r: number | null) => void;
  onClose: () => void;
}> = ({ currentReaction, isMine, onPick, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.75, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.75, y: 8 }}
    transition={{ type: "spring", stiffness: 450, damping: 26 }}
    className={`absolute bottom-full mb-1.5 z-[300] flex gap-0.5
      bg-[#1a1b23] border border-[#2a2d3a] rounded-2xl px-1.5 py-1 shadow-2xl shadow-black/60
      ${isMine ? "right-0" : "left-0"}
    `}
    onMouseLeave={onClose}
  >
    {ALL_REACTIONS.map((r) => (
      <button
        key={r}
        type="button"
        title={REACTION_LABELS[r]}
        onClick={() => onPick(currentReaction === r ? null : r)}
        className={`
          text-[18px] w-8 h-8 flex items-center justify-center
          transition-transform hover:scale-125 active:scale-105 rounded-full
          ${currentReaction === r ? "bg-[#f5d800]/15 ring-1 ring-[#f5d800]/40" : "hover:bg-white/5"}
        `}
      >
        {REACTION_EMOJIS[r]}
      </button>
    ))}
  </motion.div>
);

// ─── Bubble ───────────────────────────────────────────────

const MessageBubble: FC<{
  message: Message;
  isMine: boolean;
  compact?: boolean;
  onReact: (msg: Message, reaction: number | null) => void;
}> = memo(({ message, isMine, compact, onReact }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const reaction = message.reaction ?? null;
  const hasReaction = reaction !== null && reaction !== undefined;

  const handlePick = (r: number | null) => {
    onReact(message, r);
    setPickerOpen(false);
  };

  return (
    // Outer row: full width, no flex stretch on the bubble
    <div className={`flex ${isMine ? "flex-row-reverse" : "flex-row"} items-end gap-1.5 group w-full`}>

      {/* Reaction trigger button */}
      <button
        type="button"
        onClick={() => setPickerOpen((p) => !p)}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-full bg-[#1e2126] hover:bg-[#252830] text-gray-500 hover:text-yellow-400 transition-all duration-150 self-end mb-0.5"
        title="React"
      >
        {hasReaction
          ? <span className="text-xs leading-none">{REACTION_EMOJIS[reaction!]}</span>
          : <Heart className="w-3 h-3" />
        }
      </button>

      {/* Bubble column — max 70% of width, anchors reaction picker */}
      {/* pb-4 only when a reaction badge is present so it has room below */}
      <div className={`relative flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%] ${hasReaction ? "pb-2" : ""}`}>

        {/* Reaction picker */}
        <AnimatePresence>
          {pickerOpen && (
            <ReactionPicker
              currentReaction={reaction}
              isMine={isMine}
              onPick={handlePick}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Bubble — no overflow-hidden so the badge below isn't clipped */}
        <div
          className={`
            relative w-full
            ${compact ? "px-3 py-1.5 text-[12px]" : "px-4 py-2.5 text-sm"}
            rounded-2xl leading-relaxed
            ${isMine
              ? "bg-[#f5d800] text-black rounded-br-sm font-medium"
              : "bg-[#1e2030] text-white rounded-bl-sm"
            }
            break-words whitespace-pre-wrap
          `}
        >
          {message.content}
        </div>

        {/* Reaction badge — OUTSIDE the bubble div, so it is never clipped */}
        <AnimatePresence>
          {hasReaction && (
            <motion.button
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              onClick={() => setPickerOpen((p) => !p)}
              title={`${REACTION_LABELS[reaction!]} — click to change`}
              className={`
                absolute bottom-0.5 ${isMine ? "right-2" : "left-2"}
                bg-[#1a1b23] border border-[#2a2d3a] rounded-full px-1.5 py-px
                shadow-md text-[13px] leading-none cursor-pointer
                hover:scale-110 transition-transform z-10
              `}
            >
              {REACTION_EMOJIS[reaction!]}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Timestamp */}
        <span className={`text-[9px] text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1 ${isMine ? "text-right" : "text-left"}`}>
          {fmtTime(message.createdAt)}
          {message.status === "sending" && <span className="ml-1 italic">· Sending</span>}
          {message.status === "error" && <span className="ml-1 text-red-500 font-bold">· Failed</span>}
        </span>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

// ─── Empty thread ─────────────────────────────────────────

const EmptyThread: FC<{ compact?: boolean }> = memo(({ compact }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
    <div className={`${compact ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-[#f5d800]/10 border border-[#f5d800]/20 flex items-center justify-center mb-3`}>
      <Send className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-[#f5d800]/60`} />
    </div>
    <p className="text-xs font-semibold text-gray-400">No messages yet</p>
    <p className="text-[10px] text-gray-600 mt-1">Say hello 👋</p>
  </div>
));
EmptyThread.displayName = "EmptyThread";

// ─── ChatArea ─────────────────────────────────────────────

interface ChatAreaProps {
  onBack?: () => void;
  compact?: boolean;
}

const ChatArea: FC<ChatAreaProps> = ({ onBack, compact }) => {
  const dispatch = useAppDispatch();

  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  const conversations = useAppSelector((state) => state.chat.conversations);
  const messages = useAppSelector((state) => selectMessagesForConversation(state, activeConversationId));
  const activeConversation = conversations.find((c) => c.conversationId === activeConversationId) ?? null;

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ── Fetch history ────────────────────────────────────
  useEffect(() => {
    if (activeConversationId) dispatch(fetchMessagesThunk(activeConversationId));
  }, [activeConversationId, dispatch]);

  // ── Mark as Read ────────────────────────────────────
  const unreadCount = activeConversation?.unreadCount || 0;
  const readTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (activeConversationId && messages.length > 0 && unreadCount > 0) {
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      readTimeoutRef.current = setTimeout(() => {
        const lastMsg = messages[messages.length - 1];
        dispatch(markMessagesReadThunk({ conversationId: activeConversationId, upToMessageId: lastMsg.id }));
      }, 600);
    }
    return () => { if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current); };
  }, [messages, activeConversationId, unreadCount, dispatch]);

  // ── Auto-scroll ──────────────────────────────────────
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ── Send ─────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !activeConversationId || isSending) return;
    isNearBottomRef.current = true;
    setInputValue("");
    // Reset textarea height
    const ta = document.getElementById("chat-input") as HTMLTextAreaElement | null;
    if (ta) { ta.style.height = "auto"; }
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    try {
      await dispatch(sendMessageThunk({
        conversationId: activeConversationId,
        content: text,
        messageType: 0,
        tempId,
        senderId: currentUserId ?? "",
      })).unwrap();
    } catch { /* optimistic UI handles error */ }
  }, [inputValue, activeConversationId, isSending, dispatch, currentUserId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend],
  );

  // ── React ────────────────────────────────────────────
  const handleReact = useCallback((m: Message, newReaction: number | null) => {
    if (!activeConversationId) return;
    dispatch(reactToMessageThunk({ conversationId: activeConversationId, messageId: m.id, reaction: newReaction }));
  }, [activeConversationId, dispatch]);

  // ── No active conversation ────────────────────────────
  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0a] text-center px-8">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-[#1e2126] flex items-center justify-center mb-4">
          <Send className="w-5 h-5 text-gray-600" />
        </div>
        <p className="text-sm font-semibold text-gray-300">Select a conversation</p>
        <p className="text-xs text-gray-600 mt-1">Choose one from the list</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden">

      {/* ── Header ───────────────────────────────────────── */}
      <div className={`flex items-center gap-2.5 ${compact ? "px-3 py-2" : "px-4 py-3"} border-b border-[#1e2126] bg-[#111111] shrink-0`}>
        {onBack && (
          <button
            type="button"
            onClick={() => { onBack(); dispatch(setActiveConversation(null)); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </button>
        )}

        <div className={`${compact ? "w-7 h-7" : "w-9 h-9"} rounded-full bg-[#f5d800]/20 border border-[#f5d800]/30 flex items-center justify-center shrink-0 overflow-hidden`}>
          {activeConversation.otherUserAvatarUrl ? (
            <img src={activeConversation.otherUserAvatarUrl} alt={activeConversation.otherUserName} className="w-full h-full object-cover" />
          ) : (
            <span className={`text-[#f5d800] ${compact ? "text-[9px]" : "text-xs"} font-bold`}>
              {activeConversation.otherUserName[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`${compact ? "text-[12px]" : "text-sm"} font-semibold text-white truncate leading-tight`}>
            {activeConversation.otherUserName}
          </h3>
          {!compact && <p className="text-[10px] text-gray-500 mt-0.5">Direct message</p>}
        </div>
      </div>

      {/* ── Message list ─────────────────────────────────── */}
   
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scrollbar-thumb-[#f5d800] scrollbar-track-transparent"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex flex-col justify-end min-h-full px-3 py-3 gap-1">
          {messages.length === 0 ? (
            <EmptyThread compact={compact} />
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id ?? msg.tempId}
                message={msg}
                isMine={msg.senderId === currentUserId}
                compact={compact}
                onReact={handleReact}
              />
            ))
          )}
          {/* Extra space so reaction badges don't clip at bottom */}
          <div ref={bottomRef} className="h-3 shrink-0" />
        </div>
      </div>

      {/* ── Input area ───────────────────────────────────── */}
      <div className={`${compact ? "px-2.5 py-2" : "px-3 py-3"} border-t border-[#1e2126] bg-[#111111] shrink-0`}>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, compact ? 80 : 112)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            disabled={isSending}
            className={`
              flex-1 resize-none bg-[#1a1a1a] border border-[#2a2d35] rounded-2xl
              px-3.5 ${compact ? "py-1.5 text-[12px]" : "py-2.5 text-sm"} text-white placeholder-gray-600
              focus:outline-none focus:border-[#f5d800]/50 focus:ring-1 focus:ring-[#f5d800]/20
              transition-colors leading-relaxed
              disabled:opacity-50 disabled:cursor-not-allowed
              overflow-hidden
            `}
            style={{ height: compact ? "32px" : "40px", minHeight: compact ? "32px" : "40px", maxHeight: compact ? "80px" : "112px" }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={`
              shrink-0 ${compact ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-[#f5d800] text-black
              flex items-center justify-center transition-all
              hover:bg-[#e6cc00] active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100
              self-end
            `}
            aria-label="Send message"
          >
            {isSending
              ? <Loader2 className={compact ? "w-3.5 h-3.5 animate-spin" : "w-4 h-4 animate-spin"} />
              : <Send className={compact ? "w-3 h-3" : "w-4 h-4"} />
            }
          </button>
        </div>

        {!compact && (
          <p className="text-[10px] text-gray-700 mt-1.5 text-right">
            Enter to send · Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
