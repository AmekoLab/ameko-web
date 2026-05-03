"use client";
import { useState } from "react";
import { adminReputationService } from "@/src/services/adminReputation.service";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

interface AdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "Customer" | "Shop";
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
}

export const AdjustReputationModal = ({ isOpen, onClose, targetType, targetId, targetName, onSuccess }: AdjustModalProps) => {
  const t = useTranslations("AdjustReputationModal");
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delta < -100 || delta > 100) return toast.error(t("errorDelta")); 
    if (!reason.trim() || reason.length > 500) return toast.error(t("errorReason")); 

    setIsProcessing(true);
    try {
      const typeInt = targetType === "Customer" ? 0 : 1;
      const res = await adminReputationService.adjustReputation({ targetType: typeInt, targetId, delta, reason });
      if (res.success) {
        toast.success(t("success", { score: res.data.newScore }));
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("errorApi"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div className="bg-white border border-amazon-border shadow-xl rounded-md w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-blue-100 bg-blue-50">
          <h3 className="text-sm font-bold text-blue-700">{t("title", { targetType })}</h3>
          <p className="text-[11px] text-amazon-text mt-1">
            {t("adjustingFor")} <span className="font-medium">{targetName}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-amazon-text mb-1">{t("deltaLabel")}</label>
            <input 
              type="number" min="-100" max="100" required value={delta} onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full border border-amazon-border rounded-sm p-2 text-[11px] outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-amazon-text mb-1">{t("reasonLabel")} <span className="text-red-500">*</span></label>
            <textarea 
              required maxLength={500} rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full border border-amazon-border rounded-sm p-2 text-[11px] outline-none focus:border-blue-500 resize-none" 
              placeholder={t("reasonPlaceholder")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 border border-amazon-border text-[11px] rounded-sm hover:bg-gray-100">{t("cancel")}</button>
            <button type="submit" disabled={isProcessing} className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-medium rounded-sm hover:bg-blue-700 disabled:opacity-50">
              {isProcessing ? t("processing") : t("confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
