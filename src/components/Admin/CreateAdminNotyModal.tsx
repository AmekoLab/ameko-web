"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { notificationService } from "@/src/services/notification.service";
import { AdminUserItem } from "@/src/types/admin.types";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUser: AdminUserItem | null;
}

export default function CreateAdminNotyModal({ isOpen, onClose, targetUser }: Props) {
  const t = useTranslations("CreateAdminNotyModal");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t("toastRequireTitle"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await notificationService.createAdminNotification({
        userId: targetUser.id,
        title: title.trim(),
        message: message.trim() || undefined,
        redirectUrl: redirectUrl.trim() || undefined,
      });

      if (res.success) {
        toast.success(t("toastSuccess", { name: targetUser.fullName || targetUser.username }));
        onClose();
        setTitle("");
        setMessage("");
        setRedirectUrl("");
      } else {
        toast.error(res.message || t("toastFail"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("toastError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-neutral-800">{t("title")}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 text-lg leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="bg-blue-50 text-blue-800 p-2 text-xs rounded border border-blue-200">
            <strong>{t("recipient")}</strong> {targetUser.fullName || targetUser.username} ({targetUser.email})
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">{t("labelTitle")} <span className="text-red-500">*</span></label>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm border border-neutral-300 rounded p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder={t("placeholderTitle")}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">{t("labelMessage")}</label>
            <textarea
              maxLength={1000}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm border border-neutral-300 rounded p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              placeholder={t("placeholderMessage")}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">{t("labelRedirectUrl")}</label>
            <input
              type="text"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="w-full text-sm border border-neutral-300 rounded p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-[13px]"
              placeholder="/orders/123..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors" disabled={isSubmitting}>{t("btnCancel")}</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? t("btnSending") : t("btnSend")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
