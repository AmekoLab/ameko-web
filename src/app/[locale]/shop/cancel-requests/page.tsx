"use client";

import { useState, useEffect, useCallback } from "react";
import { orderIssueService } from "@/src/services/orderIssue.service";
import { OrderIssue } from "@/src/types/orderIssue.types";
import { Eye } from "lucide-react";
import OrderIssueDetailModal from "@/src/components/Shop/OrderIssues/OrderIssueDetailModal";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";

export default function ShopOrderIssuesPage() {
  const t = useTranslations("ShopCancelRequestsPage");
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderIssueService.getShopIssues({ Status: 1 });
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
  }, [t]);

  useEffect(() => {
    void fetchIssues();
  }, [fetchIssues]);

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

  return (
    <div className="max-w-[1440px] w-full mx-auto">
      <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
        <h1 className="font-bold text-2xl text-amazon-text mb-6">
          {t("header.title")}
        </h1>

        <div className="bg-white border border-amazon-border rounded-md shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap text-amazon-text">
              <thead className="bg-neutral-50 border-b border-amazon-border text-amazon-text font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    {t("table.orderId")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("table.customer")}
                  </th>
                  <th className="px-6 py-4 font-medium">{t("table.amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("table.reason")}</th>
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
                      colSpan={6}
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
                      colSpan={6}
                      className="px-6 py-10 text-center text-amazon-textMuted italic"
                    >
                      {t("empty.noPendingIssues")}
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-amazon-text">
                        {issue.orderId}
                      </td>
                      <td className="px-6 py-4 text-amazon-text">
                        {issue.customerName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-amazon-price">
                          {formatCurrency(issue.cancelledItemsAmount)}
                        </div>
                        <div className="text-[11px] text-amazon-textMuted">
                          {t("itemCount", { count: issue.cancelledItemCount })}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-amazon-text max-w-[200px] truncate"
                        title={issue.reason}
                      >
                        {issue.reason}
                      </td>
                      <td className="px-6 py-4 text-amazon-text">
                        {formatDate(issue.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedIssueId(issue.id);
                            setIsModalOpen(true);
                          }}
                          className="p-2 bg-white hover:bg-neutral-50 text-amazon-textMuted hover:text-amazon-text rounded-sm transition-colors border border-amazon-border shadow-sm inline-flex items-center justify-center group"
                          title={t("actions.viewDetails")}
                        >
                          <Eye className="w-4 h-4 transition-colors" />
                        </button>
                      </td>
                    </tr>
                  ))
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
