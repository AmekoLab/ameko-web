"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { walletService } from "@/src/services/wallet.service";
import { TransactionDetail } from "@/src/types/wallet.types";
import {
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Repeat,
} from "lucide-react";

interface Props {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (amount: number, currency: string = "VND") => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function TransactionDetailModal({
  transactionId,
  isOpen,
  onClose,
}: Props) {
  const t = useTranslations("Wallet");
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await walletService.getTransactionDetail(transactionId);
          if (res.success && res.data) {
            setDetail(res.data);
          }
        } catch (error) {
          console.error("Failed to fetch transaction details", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      setDetail(null);
    }
  }, [isOpen, transactionId]);

  if (!isOpen) return null;

  const getFlowUI = (flow: string) => {
    switch (flow) {
      case "In":
        return {
          color: "text-green-600",
          sign: "+",
          icon: <ArrowDownRight className="w-8 h-8" />,
        };
      case "Out":
        return {
          color: "text-red-600",
          sign: "-",
          icon: <ArrowUpRight className="w-8 h-8" />,
        };
      case "Held":
        return {
          color: "text-amber-600",
          sign: "",
          icon: <Lock className="w-8 h-8" />,
        };
      default:
        return {
          color: "text-neutral-500",
          sign: "",
          icon: <Repeat className="w-8 h-8" />,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
          <h3 className="font-bold text-neutral-900 text-lg">
            {t("details.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-200 rounded-sm transition-colors text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mb-2" />
            </div>
          ) : !detail ? (
            <div className="text-center py-12 text-neutral-500">
              {t("notAvailable")}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Big Amount Header */}
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div
                  className={`w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4 border shadow-sm ${getFlowUI(detail.flowDirection).color}`}
                >
                  {getFlowUI(detail.flowDirection).icon}
                </div>
                <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  {t(`types.${detail.type}`) || detail.type}
                </h4>
                <div
                  className={`text-3xl font-black ${getFlowUI(detail.flowDirection).color}`}
                >
                  {getFlowUI(detail.flowDirection).sign}{" "}
                  {formatCurrency(detail.amount, detail.currency)}
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase mt-2 border ${
                    detail.status === "Completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : detail.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {t(`status.${detail.status}`) || detail.status}
                </span>
              </div>

              {/* Data Grid */}
              <div className="bg-neutral-50/50 border border-neutral-200 rounded-md divide-y divide-neutral-200/60 text-sm">
                <div className="flex justify-between p-3">
                  <span className="text-neutral-500">
                    {t("details.transactionId")}
                  </span>
                  <span className="font-mono text-neutral-900 text-xs">
                    {detail.id.split("-")[0]}...{detail.id.split("-").pop()}
                  </span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-neutral-500">{t("details.time")}</span>
                  <span className="font-medium text-neutral-900">
                    {new Date(detail.createdAt).toLocaleString(
                      t("localeCode").includes(".") ? "vi-VN" : t("localeCode"),
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
                {detail.relatedOrderId && (
                  <div className="flex justify-between p-3">
                    <span className="text-neutral-500">
                      {t("details.relatedOrder")}
                    </span>
                    <span className="font-mono text-amazon-link text-xs cursor-pointer">
                      {detail.relatedOrderId.split("-")[0]}...
                    </span>
                  </div>
                )}
                {detail.feeAmount > 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-neutral-500">{t("fee")}</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(detail.feeAmount, detail.currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Balance Tracking (Before vs After) */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  {t("details.balanceAfter")} & {t("details.balanceBefore")}
                </h5>
                <div className="bg-white border border-neutral-200 rounded-md p-3 text-sm space-y-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 text-xs">
                      {t("details.balanceBefore")}
                    </span>
                    <span className="font-medium text-neutral-600 line-through decoration-neutral-300">
                      {formatCurrency(
                        detail.balanceBeforeTransaction,
                        detail.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-neutral-200 pt-2">
                    <span className="text-neutral-900 font-medium text-xs">
                      {t("details.balanceAfter")}
                    </span>
                    <span className="font-bold text-neutral-900 text-base">
                      {formatCurrency(
                        detail.balanceAfterTransaction,
                        detail.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {detail.description && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-neutral-500 uppercase">
                    {t("details.description")}
                  </span>
                  <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-md border border-neutral-100 leading-relaxed">
                    {detail.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 shrink-0 bg-neutral-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-neutral-300 text-neutral-700 font-bold rounded-sm shadow-sm hover:bg-neutral-100 transition-colors uppercase text-sm"
          >
            {t("details.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
