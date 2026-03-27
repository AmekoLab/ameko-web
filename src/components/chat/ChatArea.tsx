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
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import {
  sendMessageThunk,
  setActiveConversation,
  fetchMessagesThunk,
  markMessagesReadThunk,
  reactToMessageThunk,
  selectMessagesForConversation,
} from "@/src/store/slices/chatSlice";
import { Message } from "@/src/types/chat.types";

// ─── Helpers ─────────────────────────────────────────────

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Bubble ───────────────────────────────────────────────

const MessageBubble: FC<{
  message: Message;
  isMine: boolean;
  currentUserId?: string;
  onReact: (msg: Message) => void;
}> = memo(({ message, isMine, currentUserId, onReact }) => {
  const rawReactions = message.reactions || [];
  const reactionArray = Array.isArray(rawReactions)
    ? rawReactions
    : Object.entries(rawReactions).map(([uId, r]) => ({ userId: uId, reaction: r as number }));

  const reactionKeys = reactionArray.map(r => r.userId);
  const hasReactions = reactionArray.length > 0;
  const hasMyReaction = currentUserId ? reactionKeys.includes(currentUserId) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col ${isMine ? "items-end" : "items-start"} group relative mb-2`}
    >
      <div className="flex items-center gap-2 max-w-[75%] relative">
        {isMine && (
          <button
            type="button"
            onClick={() => onReact(message)}
            className="hidden group-hover:flex p-1.5 rounded-full bg-[#1e2126] hover:bg-[#2a2d35] text-gray-400 hover:text-red-500 transition-colors shrink-0 -translate-y-2 absolute -left-8"
          >
            <Heart className={`w-3.5 h-3.5 ${hasMyReaction ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        )}

        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words relative
            ${
              isMine
                ? "bg-[#f5d800] text-black rounded-br-sm font-medium"
                : "bg-[#202030] text-white rounded-bl-sm"
            }
          `}
        >
          {message.content}
          
          {hasReactions && (
            <div className={`
              absolute -bottom-3 ${isMine ? "right-2" : "left-2"} 
              bg-[#1e2126] border border-[#2a2d35] rounded-full px-1.5 py-0.5 
              flex items-center gap-1 shadow-sm shrink-0 z-10
            `}>
              <span className="text-[10px]">❤️</span>
              <span className="text-[10px] font-bold text-gray-300 pointer-events-none">
                {reactionKeys.length > 1 ? reactionKeys.length : ""}
              </span>
            </div>
          )}
        </div>

        {!isMine && (
          <button
            type="button"
            onClick={() => onReact(message)}
            className="hidden group-hover:flex p-1.5 rounded-full bg-[#1e2126] hover:bg-[#2a2d35] text-gray-400 hover:text-red-500 transition-colors shrink-0 -translate-y-2 absolute -right-8"
          >
            <Heart className={`w-3.5 h-3.5 ${hasMyReaction ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        )}
      </div>

      <span className="text-[10px] text-gray-600 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {fmtTime(message.createdAt)}
        {message.status === "sending" && <span className="ml-1 italic text-gray-500">· Sending...</span>}
        {message.status === "error" && <span className="ml-1 font-bold text-red-500">· Failed</span>}
      </span>
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";

// ─── Empty thread ─────────────────────────────────────────

const EmptyThread: FC = memo(() => (
  <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
    <div className="w-12 h-12 rounded-full bg-[#f5d800]/10 border border-[#f5d800]/20 flex items-center justify-center mb-4">
      <Send className="w-5 h-5 text-[#f5d800]/60" />
    </div>
    <p className="text-sm font-semibold text-gray-400">No messages yet</p>
    <p className="text-xs text-gray-600 mt-1">Say hello 👋</p>
  </div>
));
EmptyThread.displayName = "EmptyThread";

// ─── ChatArea ─────────────────────────────────────────────

interface ChatAreaProps {
  onBack?: () => void;
}

const ChatArea: FC<ChatAreaProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();

  // ── Selectors ────────────────────────────────────────────
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  const conversations = useAppSelector((state) => state.chat.conversations);
  
  // Use the memoized active message selector 
  const messages = useAppSelector((state) => selectMessagesForConversation(state, activeConversationId));

  const activeConversation = conversations.find((c) => c.conversationId === activeConversationId) ?? null;

  // ── Local state ───────────────────────────────────────────
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ── Fetch history on mount ──────────────────────────────
  useEffect(() => {
    if (activeConversationId) {
      dispatch(fetchMessagesThunk(activeConversationId));
    }
  }, [activeConversationId, dispatch]);

  // ── Mark as Read (Debounced/Optimistic) ──────────────────────────────
  const unreadCount = activeConversation?.unreadCount || 0;
  const readTimeoutRef = useRef<NodeJS.Timeout>(null);
  
  useEffect(() => {
    if (activeConversationId && messages.length > 0 && unreadCount > 0) {
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      
      readTimeoutRef.current = setTimeout(() => {
        const lastMsg = messages[messages.length - 1];
        dispatch(
          markMessagesReadThunk({
            conversationId: activeConversationId,
            upToMessageId: lastMsg.id,
          })
        );
      }, 500);
    }
    
    return () => {
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  }, [messages, activeConversationId, unreadCount, dispatch]);

  // ── Auto-scroll (Smart Scroll) ────────────────────────────
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
  }, []);

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isNearBottom]);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !activeConversationId || isSending) return;

    setIsNearBottom(true);
    setInputValue("");
    
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    try {
      await dispatch(
        sendMessageThunk({ 
          conversationId: activeConversationId, 
          content: text, 
          messageType: 0,
          tempId,
          senderId: currentUserId ?? ""
        }),
      ).unwrap();
    } catch {
      // Revert if explicitly desired, but standard optimistic UI will just leave the message showing "error"
    } 
  }, [inputValue, activeConversationId, isSending, dispatch, currentUserId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Handlers ──────────────────────────────────────────────
  const handleReact = useCallback((m: Message) => {
    if (!currentUserId || !activeConversationId) return;
    
    const raw = m.reactions || [];
    const arr = Array.isArray(raw) ? raw : Object.entries(raw).map(([uId, r]) => ({ userId: uId, reaction: r as number }));
    const hasMyReaction = arr.some(r => r.userId === currentUserId);
    
    dispatch(
      reactToMessageThunk({
        conversationId: activeConversationId,
        messageId: m.id,
        reaction: hasMyReaction ? null : 1, // 1 = Heart
      })
    );
  }, [currentUserId, activeConversationId, dispatch]);

  // ── No active conversation ────────────────────────────────
  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0a] text-center px-8">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-[#1e2126] flex items-center justify-center mb-5">
          <Send className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-base font-semibold text-gray-300">Select a conversation</p>
        <p className="text-sm text-gray-600 mt-1">Choose one from the list to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2126] bg-[#111111] shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={() => {
              onBack();
              dispatch(setActiveConversation(null));
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Back to conversation list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="w-9 h-9 rounded-full bg-[#f5d800]/20 border border-[#f5d800]/30 flex items-center justify-center shrink-0">
          {activeConversation.otherUserAvatarUrl ? (
            <img
              src={activeConversation.otherUserAvatarUrl}
              alt={activeConversation.otherUserName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <span className="text-[#f5d800] text-xs font-bold">
              {activeConversation.otherUserName[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{activeConversation.otherUserName}</h3>
          <p className="text-[11px] text-gray-500">Direct message</p>
        </div>
      </div>

      {/* ── Message History ─────────────────────────────────── */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <EmptyThread />
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUserId}
              currentUserId={currentUserId}
              onReact={handleReact}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ─────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-[#1e2126] bg-[#111111] shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={isSending}
            className="
              flex-1 resize-none bg-[#151515] border border-[#1e2126] rounded-xl
              px-4 py-2.5 text-sm text-white placeholder-gray-600
              focus:outline-none focus:border-[#f5d800] focus:ring-1 focus:ring-[#f5d800]/30
              transition-colors max-h-32 overflow-y-auto leading-relaxed
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="
              shrink-0 w-10 h-10 rounded-xl bg-[#f5d800] text-black
              flex items-center justify-center transition-all
              hover:bg-[#e6cc00] active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100
            "
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-[10px] text-gray-700 mt-1.5 text-right">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
