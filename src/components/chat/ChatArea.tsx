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
import { ArrowLeft, Send, Loader2, Heart, Ticket, Gift } from "lucide-react";
import { toast } from "react-toastify";
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
import { createNegotiationVoucherThunk } from "@/src/store/slices/voucherSlice";
import { Message, REACTION_EMOJIS, ReactionType } from "@/src/types/chat.types";
import { useLocale, useTranslations } from "next-intl";

// ─── Helpers ─────────────────────────────────────────────

function fmtTime(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
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

const getReactionLabel = (
  reaction: number,
  t: (key: string, values?: Record<string, string>) => string,
): string => {
  switch (reaction) {
    case ReactionType.Like:
      return t("reaction.like");
    case ReactionType.Love:
      return t("reaction.love");
    case ReactionType.Haha:
      return t("reaction.haha");
    case ReactionType.Wow:
      return t("reaction.wow");
    case ReactionType.Sad:
      return t("reaction.sad");
    case ReactionType.Angry:
      return t("reaction.angry");
    default:
      return t("reaction.buttonTitle");
  }
};

const ReactionPicker: FC<{
  currentReaction: number | null | undefined;
  isMine: boolean;
  reactionLabels: Record<number, string>;
  onPick: (r: number | null) => void;
  onClose: () => void;
}> = ({ currentReaction, isMine, reactionLabels, onPick, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.75, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.75, y: 8 }}
    transition={{ type: "spring", stiffness: 450, damping: 26 }}
    className={`absolute bottom-full mb-1.5 z-[300] flex gap-0.5
      bg-white border border-amazon-border rounded-full px-1.5 py-1 shadow-md
      ${isMine ? "right-0" : "left-0"}
    `}
    onMouseLeave={onClose}
  >
    {ALL_REACTIONS.map((r) => (
      <button
        key={r}
        type="button"
        title={reactionLabels[r]}
        onClick={() => onPick(currentReaction === r ? null : r)}
        className={`
          text-[18px] w-8 h-8 flex items-center justify-center
          transition-transform hover:scale-125 active:scale-105 rounded-full
          ${currentReaction === r ? "bg-amazon-btnSecondary ring-1 ring-amazon-focus/40" : "hover:bg-neutral-50"}
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
  const t = useTranslations("ChatArea");
  const locale = useLocale();
  const localeTag = locale === "vi" ? "vi-VN" : "en-US";
  const [pickerOpen, setPickerOpen] = useState(false);

  const reaction = message.reaction ?? null;
  const hasReaction = reaction !== null && reaction !== undefined;
  const reactionLabels: Record<number, string> = {
    [ReactionType.Like]: t("reaction.like"),
    [ReactionType.Love]: t("reaction.love"),
    [ReactionType.Haha]: t("reaction.haha"),
    [ReactionType.Wow]: t("reaction.wow"),
    [ReactionType.Sad]: t("reaction.sad"),
    [ReactionType.Angry]: t("reaction.angry"),
  };

  const handlePick = (r: number | null) => {
    onReact(message, r);
    setPickerOpen(false);
  };

  return (
    // Outer row: full width, no flex stretch on the bubble
    <div
      className={`flex ${isMine ? "flex-row-reverse" : "flex-row"} items-end gap-1.5 group w-full`}
    >
      {/* Reaction trigger button */}
      <button
        type="button"
        onClick={() => setPickerOpen((p) => !p)}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-full bg-white border border-amazon-border shadow-sm hover:bg-neutral-50 text-amazon-textMuted hover:text-amazon-link transition-all duration-150 self-end mb-0.5"
        title={t("reaction.buttonTitle")}
      >
        {hasReaction ? (
          <span className="text-xs leading-none">
            {REACTION_EMOJIS[reaction!]}
          </span>
        ) : (
          <Heart className="w-3 h-3" />
        )}
      </button>

      {/* Bubble column — max 70% of width, anchors reaction picker */}
      {/* pb-4 only when a reaction badge is present so it has room below */}
      <div
        className={`relative flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[70%] ${hasReaction ? "pb-2" : ""}`}
      >
        {/* Reaction picker */}
        <AnimatePresence>
          {pickerOpen && (
            <ReactionPicker
              currentReaction={reaction}
              isMine={isMine}
              reactionLabels={reactionLabels}
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
            ${
              isMine
                ? "bg-amazon-btnPrimary text-amazon-text rounded-br-sm border border-amazon-focus/50 shadow-sm font-bold"
                : "bg-white text-amazon-text rounded-bl-sm border border-amazon-border shadow-sm font-bold"
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
              title={t("reaction.changeTitle", {
                reaction: getReactionLabel(reaction!, t),
              })}
              className={`
                absolute bottom-0.5 ${isMine ? "right-2" : "left-2"}
                bg-white border border-amazon-border rounded-full px-1.5 py-px
                shadow-sm text-[13px] leading-none cursor-pointer
                hover:scale-110 transition-transform z-10
              `}
            >
              {REACTION_EMOJIS[reaction!]}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Timestamp */}
        <span
          className={`text-[9px] text-amazon-textMuted font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1 ${isMine ? "text-right" : "text-left"}`}
        >
          {fmtTime(message.createdAt, localeTag)}
          {message.status === "sending" && (
            <span className="ml-1 italic">{`· ${t("statusSending")}`}</span>
          )}
          {message.status === "error" && (
            <span className="ml-1 text-red-500 font-bold">{`· ${t("statusFailed")}`}</span>
          )}
        </span>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

// ─── Empty thread ─────────────────────────────────────────

const EmptyThread: FC<{ compact?: boolean }> = memo(({ compact }) => {
  const t = useTranslations("ChatArea");

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
      <div
        className={`${compact ? "w-10 h-10" : "w-12 h-12"} rounded-full bg-neutral-100 border border-amazon-border shadow-sm flex items-center justify-center mb-3`}
      >
        <Send
          className={`${compact ? "w-4 h-4" : "w-5 h-5"} text-amazon-textMuted`}
        />
      </div>
      <p className="text-xs font-bold text-amazon-textMuted">
        {t("emptyThreadTitle")}
      </p>
      <p className="text-[10px] text-amazon-textMuted mt-1 font-bold">
        {t("emptyThreadSubtitle")}
      </p>
    </div>
  );
});
EmptyThread.displayName = "EmptyThread";

// ─── ChatArea ─────────────────────────────────────────────

interface ChatAreaProps {
  onBack?: () => void;
  compact?: boolean;
}

const ChatArea: FC<ChatAreaProps> = ({ onBack, compact }) => {
  const dispatch = useAppDispatch();
  const t = useTranslations("ChatArea");
  const locale = useLocale();
  const localeTag = locale === "vi" ? "vi-VN" : "en-US";

  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const activeConversationId = useAppSelector(
    (state) => state.chat.activeConversationId,
  );
  const conversations = useAppSelector((state) => state.chat.conversations);
  const messages = useAppSelector((state) =>
    selectMessagesForConversation(state, activeConversationId),
  );
  const activeConversation =
    conversations.find((c) => c.conversationId === activeConversationId) ??
    null;

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ── Voucher gift state ──────────────────────────────
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isSendingVoucher, setIsSendingVoucher] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");

  // ── Fetch history ────────────────────────────────────
  useEffect(() => {
    if (activeConversationId)
      dispatch(fetchMessagesThunk(activeConversationId));
  }, [activeConversationId, dispatch]);

  // ── Mark as Read ────────────────────────────────────
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
          }),
        );
      }, 600);
    }
    return () => {
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
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
    const ta = document.getElementById(
      "chat-input",
    ) as HTMLTextAreaElement | null;
    if (ta) {
      ta.style.height = "auto";
    }
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    try {
      await dispatch(
        sendMessageThunk({
          conversationId: activeConversationId,
          content: text,
          messageType: 0,
          tempId,
          senderId: currentUserId ?? "",
        }),
      ).unwrap();
    } catch {
      /* optimistic UI handles error */
    }
  }, [inputValue, activeConversationId, isSending, dispatch, currentUserId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ── React ────────────────────────────────────────────
  const handleReact = useCallback(
    (m: Message, newReaction: number | null) => {
      if (!activeConversationId) return;
      dispatch(
        reactToMessageThunk({
          conversationId: activeConversationId,
          messageId: m.id,
          reaction: newReaction,
        }),
      );
    },
    [activeConversationId, dispatch],
  );

  // ── Send Voucher Gift ────────────────────────────────
  const handleSendVoucher = useCallback(async () => {
    if (!activeConversation || !activeConversationId || !currentUserId) return;

    const discount = Number(String(discountAmount).replace(/\D/g, ""));
    const minOrder = Number(String(minOrderValue).replace(/\D/g, ""));

    if (discount <= 0 || minOrder < 0) {
      toast.error(t("toastInvalidAmount"));
      return;
    }

    setIsSendingVoucher(true);
    try {
      // 1. Create the Voucher using otherUserId as targetUserId
      const voucherRes = await dispatch(
        createNegotiationVoucherThunk({
          targetUserId: activeConversation.otherUserId,
          discountAmount: discount,
          minOrderValue: minOrder,
        }),
      ).unwrap();

      // 2. Send the Chat Message
      const voucherCode =
        voucherRes.code ||
        (voucherRes as { data?: { code?: string } }).data?.code ||
        t("notAvailable");
      const messageContent = t("voucherMessage", {
        discount: discount.toLocaleString(localeTag),
        voucherCode,
        minOrder: minOrder.toLocaleString(localeTag),
      });

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await dispatch(
        sendMessageThunk({
          conversationId: activeConversationId,
          content: messageContent,
          messageType: 0,
          tempId,
          senderId: currentUserId,
        }),
      ).unwrap();

      setIsVoucherModalOpen(false);
      setDiscountAmount("");
      setMinOrderValue("");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : t("toastGiftVoucherError"),
      );
    } finally {
      setIsSendingVoucher(false);
    }
  }, [
    activeConversation,
    activeConversationId,
    currentUserId,
    discountAmount,
    minOrderValue,
    dispatch,
    localeTag,
    t,
  ]);

  // ── No active conversation ────────────────────────────
  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-amazon-bgSecondary text-center px-8">
        <div className="w-12 h-12 rounded-sm bg-white border border-amazon-border shadow-sm flex items-center justify-center mb-4">
          <Send className="w-5 h-5 text-amazon-textMuted" />
        </div>
        <p className="text-sm font-black text-amazon-text tracking-tight uppercase">
          {t("noConversationTitle")}
        </p>
        <p className="text-xs text-amazon-textMuted mt-1 font-bold">
          {t("noConversationSubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-amazon-bgSecondary overflow-hidden">
      {/* ── Header ───────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2.5 ${compact ? "px-3 py-2" : "px-4 py-3"} border-b border-amazon-border bg-white shadow-sm shrink-0 z-10`}
      >
        {onBack && (
          <button
            type="button"
            onClick={() => {
              onBack();
              dispatch(setActiveConversation(null));
            }}
            className="p-1.5 rounded-sm border border-transparent text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 transition-colors shrink-0"
            aria-label={t("ariaBack")}
          >
            <ArrowLeft className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </button>
        )}

        <div
          className={`${compact ? "w-7 h-7" : "w-9 h-9"} rounded-full bg-neutral-100 border border-amazon-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm`}
        >
          {activeConversation.otherUserAvatarUrl ? (
            <img
              src={activeConversation.otherUserAvatarUrl}
              alt={activeConversation.otherUserName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className={`text-amazon-textMuted ${compact ? "text-[9px]" : "text-xs"} font-black`}
            >
              {activeConversation.otherUserName[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`${compact ? "text-[12px]" : "text-sm"} font-black uppercase text-amazon-text truncate leading-tight`}
          >
            {activeConversation.otherUserName}
          </h3>
          {!compact && (
            <p className="text-[10px] text-green-500  mt-0.5">
              {t("directMessage")}
            </p>
          )}
        </div>
      </div>

      {/* ── Message list ─────────────────────────────────── */}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scrollbar-thumb-amazon-textMuted scrollbar-track-transparent"
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
      <div
        className={`${compact ? "px-2.5 py-2" : "px-3 py-3"} border-t border-amazon-border bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.02)] shrink-0 z-10`}
      >
        <div className="flex items-end gap-2">
          {/* Gift Voucher Button */}
          <button
            type="button"
            onClick={() => setIsVoucherModalOpen(true)}
            className={`
              shrink-0 ${compact ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-btnPrimary text-amazon-btnPrimary
              flex items-center justify-center transition-all shadow-sm
              hover:bg-neutral-50 hover:text-amazon-btnPrimary active:scale-95 self-end border border-amazon-border
            `}
            title={t("giftVoucherTitle")}
          >
            <Ticket className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </button>
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
            placeholder={t("messagePlaceholder")}
            disabled={isSending}
            className={`
              flex-1 resize-none bg-neutral-50 border border-amazon-border rounded-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]
              px-3.5 ${compact ? "py-1.5 text-[12px]" : "py-2.5 text-sm"} text-amazon-text placeholder:text-amazon-textMuted font-bold
              focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/20
              transition-colors leading-relaxed
              disabled:opacity-50 disabled:cursor-not-allowed
              overflow-hidden
            `}
            style={{
              height: compact ? "32px" : "40px",
              minHeight: compact ? "32px" : "40px",
              maxHeight: compact ? "80px" : "112px",
            }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={`
              shrink-0 ${compact ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-amazon-btnPrimary text-amazon-text
              flex items-center justify-center transition-all shadow-sm border border-amazon-focus/50
              hover:brightness-95 active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100
              self-end
            `}
            aria-label={t("sendMessageAria")}
          >
            {isSending ? (
              <Loader2
                className={
                  compact ? "w-3.5 h-3.5 animate-spin" : "w-4 h-4 animate-spin"
                }
              />
            ) : (
              <Send className={compact ? "w-3 h-3" : "w-4 h-4"} />
            )}
          </button>
        </div>

        {!compact && (
          <p className="text-[10px] text-amazon-textMuted font-bold mt-1.5 text-right">
            {t("sendHint")}
          </p>
        )}
      </div>
      {/* Mini Voucher Modal */}
      <AnimatePresence>
        {isVoucherModalOpen && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-white border border-amazon-border rounded-sm p-4 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-4 text-amazon-text">
                <Gift className="w-5 h-5 text-amazon-btnSecondary" />
                <h4 className="font-black text-sm uppercase tracking-wider">
                  {t("giftVoucherTitle")}
                </h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-amazon-textMuted uppercase tracking-widest mb-1.5">
                    {t("voucherModalDiscountLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={discountAmount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setDiscountAmount(raw ? new Intl.NumberFormat("vi-VN").format(Number(raw)) : "");
                      }}
                      className="w-full bg-neutral-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-amazon-border rounded-sm px-3 py-2 text-sm font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/20"
                      placeholder={t("voucherModalDiscountPlaceholder")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-amazon-textMuted select-none pointer-events-none">
                      ₫
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-amazon-textMuted uppercase tracking-widest mb-1.5">
                    {t("voucherModalMinOrderLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={minOrderValue}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setMinOrderValue(raw ? new Intl.NumberFormat("vi-VN").format(Number(raw)) : "");
                      }}
                      className="w-full bg-neutral-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-amazon-border rounded-sm px-3 py-2 text-sm font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/20"
                      placeholder={t("voucherModalMinOrderPlaceholder")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-amazon-textMuted select-none pointer-events-none">
                      ₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="flex-1 py-2 rounded-sm text-xs font-black uppercase tracking-widest text-amazon-text hover:text-amazon-link bg-white border border-amazon-border hover:bg-neutral-50 shadow-sm transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSendVoucher}
                  disabled={isSendingVoucher || !discountAmount}
                  className="flex-1 py-2 rounded-sm text-xs font-black uppercase tracking-widest text-amazon-text bg-amazon-btnPrimary border border-amazon-focus/50 shadow-sm hover:brightness-95 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSendingVoucher && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {isSendingVoucher ? t("gifting") : t("gift")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatArea;
