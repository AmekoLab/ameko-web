"use client";

import { useState } from "react";
import { Gift, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GiftVoucherModalProps {
  isOpen: boolean;
  customerName: string;
  onClose: () => void;
  onConfirm: (discount: number, minOrder: number) => Promise<void>;
}

export default function GiftVoucherModal({
  isOpen,
  customerName,
  onClose,
  onConfirm,
}: GiftVoucherModalProps) {
  const [discountAmount, setDiscountAmount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleConfirm = async () => {
    const discount = Number(String(discountAmount).replace(/\D/g, ""));
    const minOrder = Number(String(minOrderValue).replace(/\D/g, ""));
    setIsSending(true);
    try {
      await onConfirm(discount, minOrder);
    } finally {
      setIsSending(false);
      // Reset state naturally so it's clean for the next open
      setDiscountAmount("");
      setMinOrderValue("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-xs bg-white border border-amazon-border rounded-sm p-4 shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-amazon-textMuted hover:text-amazon-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-3 text-amazon-text mt-1">
              <Gift className="w-5 h-5 text-amazon-btnSecondary" />
              <h4 className="font-black text-sm uppercase tracking-wider truncate">
                Tặng Voucher
              </h4>
            </div>

            <p className="text-[11px] text-amazon-textMuted mb-3">
              Gửi tặng cho: <span className="font-bold text-amazon-text">{customerName}</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-amazon-textMuted uppercase tracking-widest mb-1.5">
                  Giảm giá (₫)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={discountAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setDiscountAmount(
                        raw ? new Intl.NumberFormat("vi-VN").format(Number(raw)) : ""
                      );
                    }}
                    className="w-full bg-neutral-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-amazon-border rounded-sm px-3 py-2 text-sm font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/20"
                    placeholder="Ví dụ: 50.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-amazon-textMuted select-none pointer-events-none">
                    ₫
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-amazon-textMuted uppercase tracking-widest mb-1.5">
                  Đơn tối thiểu (₫)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={minOrderValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setMinOrderValue(
                        raw ? new Intl.NumberFormat("vi-VN").format(Number(raw)) : ""
                      );
                    }}
                    className="w-full bg-neutral-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-amazon-border rounded-sm px-3 py-2 text-sm font-bold text-amazon-text focus:outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/20"
                    placeholder="Ví dụ: 200.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-amazon-textMuted select-none pointer-events-none">
                    ₫
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-sm text-xs font-black uppercase tracking-widest text-amazon-text hover:text-amazon-link bg-white border border-amazon-border hover:bg-neutral-50 shadow-sm transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSending || !discountAmount}
                className="flex-1 py-2 rounded-sm text-xs font-black uppercase tracking-widest text-amazon-text bg-amazon-btnPrimary border border-amazon-focus/50 shadow-sm hover:brightness-95 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending && <Loader2 className="w-3 h-3 animate-spin" />}
                {isSending ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
