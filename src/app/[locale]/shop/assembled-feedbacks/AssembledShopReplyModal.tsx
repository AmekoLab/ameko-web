"use client";

import { useState } from "react";
import { feedbackService } from "@/src/services/feedback.service";
import { X, Loader2, SendHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

interface AssembledShopReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackId: string;
  onSuccess: () => void;
}

export default function AssembledShopReplyModal({
  isOpen,
  onClose,
  feedbackId,
  onSuccess,
}: AssembledShopReplyModalProps) {
  const t = useTranslations("ShopFeedbacks");
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reply.trim()) {
      toast.warning(t("requireReplyContent"));
      return;
    }

    try {
      setIsSubmitting(true);
      const response: any = await feedbackService.replyToAssembledFeedback(feedbackId, reply);

      if (response?.success) {
        toast.success(t("replySuccess"));
        setReply("");
        onSuccess();
        onClose();
      } else {
        toast.error(response?.message || t("replyError"));
      }
    } catch (error) {
      console.error("Reply error:", error);
      toast.error(t("replyServerError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-sm shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 uppercase text-sm">
            {t("modalTitleAssembled")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            {t("replyContentLabel")}
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t("replyPlaceholder")}
            className="w-full h-32 p-3 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-amazon-primary focus:border-amazon-primary outline-none resize-none transition-all"
            disabled={isSubmitting}
          />
          <p className="text-[10px] text-gray-400 mt-2 italic">
            {t("replyPublicNoticeAssembled")}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-sm transition-colors uppercase"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-amazon-text bg-amazon-primary hover:brightness-95 rounded-sm transition-all disabled:opacity-50 uppercase shadow-sm border border-amazon-border"
          >
            {isSubmitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <SendHorizontal className="w-3 h-3" />
            )}
            {t("submitReply")}
          </button>
        </div>
      </div>
    </div>
  );
}
