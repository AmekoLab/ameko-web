"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchHeldTransactions } from "@/src/store/slices/walletSlice";
import { X, Loader2, Inbox, Clock } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function statusBadge(status: string) {
  const lower = status.toLowerCase();
  let colors = "bg-gray-100 text-gray-600";
  if (lower === "processing") colors = "bg-blue-50 text-blue-600";
  else if (lower === "pending") colors = "bg-yellow-50 text-yellow-600";
  else if (lower === "completed") colors = "bg-green-50 text-green-600";
  else if (lower === "cancelled" || lower === "failed")
    colors = "bg-red-50 text-red-600";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${colors}`}
    >
      {status}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────
interface HeldTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeldTransactionsModal({
  isOpen,
  onClose,
}: HeldTransactionsModalProps) {
  const dispatch = useAppDispatch();
  const { heldTransactions, loadingHeld } = useAppSelector(
    (state) => state.wallet,
  );

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchHeldTransactions());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-black font-oswald">
              Số dư đang chờ xử lý
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingHeld ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : heldTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm text-gray-500">
                Không có khoản tiền nào đang bị đóng băng.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {heldTransactions.map((tx) => (
                <div
                  key={tx.transactionId}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Amount */}
                      <p className="text-lg font-black text-orange-500 font-oswald">
                        {tx.amount.toLocaleString("vi-VN")}
                        <span className="text-sm ml-1">₫</span>
                      </p>

                      {/* Order ID */}
                      <p className="text-xs text-gray-500 mt-1">
                        Đơn hàng:{" "}
                        <span className="font-mono text-blue-600 hover:underline cursor-pointer">
                          {tx.orderId.slice(0, 8)}…
                        </span>
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 pt-1">
                      {statusBadge(tx.orderStatus)}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400">
                      {formatDate(tx.date)}
                    </p>
                  </div>

                  {/* Reason */}
                  {tx.reason && (
                    <p className="text-xs text-gray-400 italic mt-1.5">
                      {tx.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
