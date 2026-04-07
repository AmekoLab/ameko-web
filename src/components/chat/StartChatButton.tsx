"use client";

import { FC } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { startConversationThunk } from "@/src/store/slices/chatSlice";
import { useState } from "react";

// ─── Props ────────────────────────────────────────────────

interface StartChatButtonProps {
  /** The shop owner's userId — passed to startConversationThunk */
  targetUserId: string;
  /** Optional display name shown as tooltip / aria-label */
  shopName?: string;
}

// ─── Component ───────────────────────────────────────────

const StartChatButton: FC<StartChatButtonProps> = ({
  targetUserId,
  shopName,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Hide the button if the user is viewing their own profile
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  if (currentUserId === targetUserId) return null;

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await dispatch(startConversationThunk(targetUserId)).unwrap();
      // startConversationThunk automatically sets activeConversationId
      // and dispatches setWidgetOpen(true) on success
    } catch {
      // fail silently — the widget stays closed, user can retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={shopName ? `Chat với ${shopName}` : "Chat với Shop"}
      className="
        inline-flex items-center gap-2
        px-4 py-2 rounded-xl
        bg-amazon-btnPrimary text-amazon-text text-sm font-bold
        hover:bg-[#e6cc00] active:scale-95
        transition-all duration-150
        disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
        shadow-md shadow-[#f5d800]/20
      "
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageSquare className="w-4 h-4" />
      )}
      {isLoading ? "Opening..." : "Chat with Shop"}
    </button>
  );
};

export default StartChatButton;
