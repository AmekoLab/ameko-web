"use client";

import { useState, useEffect, useCallback } from "react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue } from "@/src/types/orderIssue.types";
import { Eye, Check, X, Loader2 } from "lucide-react";
import OrderIssueDetailModal from "@/src/components/Shop/OrderIssues/OrderIssueDetailModal";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";

// ─── Status constants ──────────────────────────────────────
const STATUS = {
  IN_PROGRESS: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  AUTO_CANCELLED: 4,
} as const;

const STATUS_BADGE: Record<number, { bg: string; text: string }> = {
  [STATUS.IN_PROGRESS]: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  [STATUS.ACCEPTED]: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  [STATUS.REJECTED]: { bg: "bg-red-50 border-red-200", text: "text-red-600" },
  [STATUS.AUTO_CANCELLED]: { bg: "bg-neutral-50 border-neutral-200", text: "text-neutral-500" },
};

const DEFAULT_BADGE = { bg: "bg-neutral-50 border-neutral-200", text: "text-neutral-500" };

export default function ShopOrderIssuesPage() {
  const t = useTranslations("ShopCancelRequestsPage");
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<number | null>(STATUS.IN_PROGRESS);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ─── Filter tabs definition ──────────────────────────────
  const tabs: { label: string; value: number | null }[] = [
    { label: t("tabs.all"), value: null },
    { label: t("tabs.inProgress"), value: STATUS.IN_PROGRESS },
    { label: t("tabs.accepted"), value: STATUS.ACCEPTED },
    { label: t("tabs.rejected"), value: STATUS.REJECTED },
    { label: t("tabs.autoCancelled"), value: STATUS.AUTO_CANCELLED },
  ];

  // ─── Fetch issues with optional status filter ────────────
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderIssueService.getShopIssues({
        Type: 0,
        Status: currentStatus !== null ? currentStatus : undefined,
      });
      if (res.success && res.data) {
        setIssues(res.data.items);
      } else {
        toast.error(res.message || t("toast.fetchFailed"));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("toast.fetchUnexpectedError");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [t, currentStatus]);

  useEffect(() => {
    void fetchIssues();
  }, [fetchIssues]);

  // ─── Process (Accept / Reject) ───────────────────────────
  const handleProcess = async (issueId: string, isAccept: boolean) => {
    setProcessingId(issueId);
    try {
      const res = await orderIssueService.processIssue({
        issueId,
        decision: isAccept ? 2 : 3, // 2 = Approve, 3 = Reject
        shopResponse: "",
      });
      if (res.success) {
        toast.success(isAccept ? t("toast.acceptSuccess") : t("toast.rejectSuccess"));
        await fetchIssues();
      } else {
        toast.error(res.message || (isAccept ? t("toast.acceptFailed") : t("toast.rejectFailed")));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("toast.processError");
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssueId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const getStatusLabel = (status: number): string => {
    const map: Record<number, string> = {

      [STATUS.IN_PROGRESS]: t("status.inProgress"),
      [STATUS.ACCEPTED]: t("status.accepted"),
      [STATUS.REJECTED]: t("status.rejected"),
      [STATUS.AUTO_CANCELLED]: t("status.autoCancelled"),
    };
    return map[status] ?? t("status.unknown");
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto">
      <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
        <h1 className="font-bold text-2xl text-amazon-text mb-4">
          {t("header.title")}
        </h1>

        {/* ── Status Filter Tabs ── */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tabs.map((tab) => {
            const isActive = currentStatus === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setCurrentStatus(tab.value)}
                className={`px-4 py-2 text-[13px] font-medium rounded-sm border transition-all ${
                  isActive
                    ? "bg-amazon-btnPrimary border-amazon-border text-amazon-text shadow-sm"
                    : "bg-white border-amazon-border text-amazon-textMuted hover:bg-neutral-50 hover:text-amazon-text"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-amazon-border rounded-md shadow-sm overflow-hidden">
          <div className="w-full">
            <table className="w-full text-left text-sm text-amazon-text table-fixed">
              <thead className="bg-neutral-50 border-b border-amazon-border text-amazon-text font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("table.orderId")}</th>
                  <th className="px-6 py-4 font-medium">{t("table.customer")}</th>
                  <th className="px-6 py-4 font-medium">{t("table.amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("table.reason")}</th>
                  <th className="px-6 py-4 font-medium">{t("table.status")}</th>
                  <th className="px-6 py-4 font-medium">{t("table.date")}</th>
                  <th className="px-6 py-4 font-medium text-center">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amazon-border">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-amazon-textMuted"
                    >
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-400"></div>
                      </div>
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-amazon-textMuted italic"
                    >
                      {t("empty.noPendingIssues")}
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => {
                    const badge = STATUS_BADGE[issue.status] || DEFAULT_BADGE;
                    const isActionable = issue.status === STATUS.IN_PROGRESS;
                    const isProcessing = processingId === issue.id;

                    return (
                      <tr
                        key={issue.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-amazon-text">
                          <span
                            className="cursor-default"
                            title={issue.orderId}
                          >
                            {issue.orderId.length > 8
                              ? issue.orderId.slice(0, 8) + "…"
                              : issue.orderId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-amazon-text">
                          {issue.customerName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-amazon-price">
                            {formatCurrency(issue.cancelledItemsAmount)}
                          </div>
                          <div className="text-[11px] text-amazon-textMuted">
                            {issue.cancelledItemCount} SP
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-amazon-text max-w-[200px] truncate"
                          title={issue.reason}
                        >
                          {issue.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-sm text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                          >
                            {getStatusLabel(issue.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-amazon-text">
                          {formatDate(issue.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* {isActionable && (
                              <>
                                <button
                                  onClick={() => handleProcess(issue.id, true)}
                                  disabled={isProcessing}
                                  title={t("actions.accept")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-[12px] rounded-sm transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  {t("actions.accept")}
                                </button>
                                <button
                                  onClick={() => handleProcess(issue.id, false)}
                                  disabled={isProcessing}
                                  title={t("actions.reject")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-[12px] rounded-sm transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                  {t("actions.reject")}
                                </button>
                              </>
                            )} */}
                            <button
                              onClick={() => {
                                setSelectedIssueId(issue.id);
                                setIsModalOpen(true);
                              }}
                              className="p-2 bg-white hover:bg-neutral-50 text-amazon-textMuted hover:text-amazon-text rounded-sm transition-colors border border-amazon-border shadow-sm inline-flex items-center justify-center"
                              title={t("actions.viewDetails")}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <OrderIssueDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          issueId={selectedIssueId}
        />
      </div>
    </div>
  );
}
