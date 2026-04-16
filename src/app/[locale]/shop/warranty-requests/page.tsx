"use client";

import { FC, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  CheckCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchShopWarrantyRequests,
  confirmShopReceipt,
} from "@/src/store/slices/shopWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { format, parseISO } from "date-fns";
import ShopReviewModal from "@/src/components/Warranty/ShopReviewModal";

// ─── Constants ─────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
  InProgress: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  AwaitingReturn: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  ShopAccepted: "bg-green-50 text-green-700 border border-green-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
  AdminReviewing: "bg-blue-50 text-blue-700 border border-blue-200",
  Completed: "bg-green-50 text-green-700 border border-green-200",
  AutoCancelled: "bg-red-50 text-red-700 border border-red-200",
  Returning: "bg-blue-50 text-blue-700 border border-blue-200",
  Returned: "bg-blue-50 text-blue-700 border border-blue-200",
};

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

const getStatusStyle = (statusName: string): string =>
  STATUS_STYLES[statusName] ||
  "bg-neutral-50 text-neutral-700 border border-neutral-200";

// ─── Table Skeleton ────────────────────────────────────────
const TableSkeleton: FC = () => (
  <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse bg-amazon-bgSecondary min-h-screen">
    <div className="h-10 w-80 bg-neutral-200 rounded-sm mb-8" />
    <div className="bg-white rounded-md shadow-sm border border-amazon-border overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-amazon-border bg-neutral-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 bg-neutral-200 rounded-sm w-full" />
        ))}
      </div>
      {/* Body rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-amazon-border bg-white"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200" />
            <div className="h-4 w-20 bg-neutral-200 rounded-sm" />
          </div>
          <div className="h-4 w-24 bg-neutral-200 rounded-sm" />
          <div className="h-4 w-32 bg-neutral-200 rounded-sm" />
          <div className="h-4 w-20 bg-neutral-200 rounded-sm" />
          <div className="h-4 w-28 bg-neutral-200 rounded-sm" />
          <div className="h-6 w-20 bg-neutral-200 rounded-sm" />
          <div className="h-8 w-24 bg-neutral-200 rounded-sm" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyState: FC = () => {
  const t = useTranslations("ShopWarrantyRequestsPage");

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-md shadow-sm border border-amazon-border">
      <div className="w-16 h-16 rounded-full bg-neutral-50 border border-amazon-border flex items-center justify-center mb-5">
        <ShieldCheck className="w-8 h-8 text-neutral-400" />
      </div>
      <h2 className="text-[14px] font-medium text-amazon-text mb-2">
        {t("empty.title")}
      </h2>
      <p className="text-[13px] text-amazon-textMuted max-w-sm">
        {t("empty.description")}
      </p>
    </div>
  );
};

// ─── Table Row ─────────────────────────────────────────────
interface RowProps {
  request: WarrantyRequest;
  onReviewClick: (request: WarrantyRequest) => void;
  onConfirmReceive: (issueId: string) => void;
  isConfirmingReceipt: boolean;
}

const TableRow: FC<RowProps> = ({
  request,
  onReviewClick,
  onConfirmReceive,
  isConfirmingReceipt,
}) => {
  const t = useTranslations("ShopWarrantyRequestsPage");

  const statusLabels: Record<string, string> = {
    InProgress: t("status.inProgress"),
    AwaitingReturn: t("status.awaitingReturn"),
    ShopAccepted: t("status.shopAccepted"),
    Rejected: t("status.rejected"),
    AdminReviewing: t("status.adminReviewing"),
    Completed: t("status.completed"),
    AutoCancelled: t("status.autoCancelled"),
    Returning: t("status.returning"),
    Returned: t("status.returned"),
  };

  const typeLabels: Record<string, string> = {
    ReturnRequest: t("types.returnRequest"),
    CancelRequest: t("types.cancelRequest"),
  };

  const statusLabel = statusLabels[request.statusName] || request.statusName;
  const typeLabel = typeLabels[request.typeName] || request.typeName;
  const statusStyle = getStatusStyle(request.statusName);

  return (
    <tr className="border-b border-amazon-border hover:bg-neutral-50 transition-colors">
      {/* Customer */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {request.customerAvatar ? (
            <Image
              src={request.customerAvatar}
              alt={request.customerName || ""}
              width={32}
              height={32}
              className="rounded-full object-cover border border-amazon-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-50 border border-amazon-border flex items-center justify-center">
              <User className="w-4 h-4 text-amazon-textMuted" />
            </div>
          )}
          <span className="text-sm font-medium text-amazon-text truncate max-w-[120px]">
            {request.customerName || t("table.na")}
          </span>
        </div>
      </td>
      {/* Type */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-amazon-text">{typeLabel}</span>
      </td>
      {/* Reason */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-amazon-text line-clamp-2">
          {request.reason}
        </span>
      </td>
      {/* Refund Amount */}
      <td className="px-5 py-3.5">
        <span className="text-sm font-bold text-amazon-price">
          {formatCurrency(request.refundAmount)}
        </span>
      </td>
      {/* Date */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-amazon-text whitespace-nowrap">
          {formatDate(request.createdAt)}
        </span>
      </td>
      {/* Status */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-sm whitespace-nowrap ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </td>
      {/* Actions */}
      <td className="px-5 py-3.5">
        {request.status === 1 ? (
          <button
            onClick={() => onReviewClick(request)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amazon-text bg-amazon-btnPrimary px-4 py-2 rounded-sm hover:brightness-95 transition-colors whitespace-nowrap shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-amazon-text" />
            {t("actions.viewProcess")}
          </button>
        ) : request.status === 5 ? (
          <span className="text-amazon-textMuted text-sm font-medium">
            {t("actions.waitReturn")}
          </span>
        ) : request.status === 6 ? (
          <button
            onClick={() => onConfirmReceive(request.id)}
            disabled={isConfirmingReceipt}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-sm hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t("actions.confirmReceipt")}
          </button>
        ) : (
          <button
            onClick={() => onReviewClick(request)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amazon-textMuted bg-white border border-amazon-border px-4 py-2 rounded-sm hover:bg-neutral-50 hover:text-amazon-text transition-colors whitespace-nowrap shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            {t("actions.viewInfo")}
          </button>
        )}
      </td>
    </tr>
  );
};

// ─── Pagination ────────────────────────────────────────────
interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ current, total, onChange }) => {
  const t = useTranslations("ShopWarrantyRequestsPage");

  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-between py-5 text-sm font-medium text-amazon-textMuted border-t border-amazon-border">
      <span className="text-amazon-textMuted">
        {t("pagination.pageLabel")}{" "}
        <span className="text-amazon-text font-bold">{current}</span> / {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
          className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 text-amazon-textMuted hover:text-amazon-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={current >= total}
          onClick={() => onChange(current + 1)}
          className="p-1.5 rounded-sm border border-amazon-border bg-white hover:bg-neutral-50 text-amazon-textMuted hover:text-amazon-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Confirm Receipt Modal ─────────────────────────────────
interface ConfirmReceiptModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmReceiptModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmReceiptModalProps) => {
  const t = useTranslations("ShopWarrantyRequestsPage");

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-neutral-100 rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">
          {t("confirmReceiptModal.title")}
        </h3>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          {t("confirmReceiptModal.description")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-sm rounded-xl transition-colors border border-neutral-200"
          >
            {t("confirmReceiptModal.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("confirmReceiptModal.confirming")}
              </>
            ) : (
              t("confirmReceiptModal.confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────
const ShopWarrantyDashboard: FC = () => {
  const t = useTranslations("ShopWarrantyRequestsPage");
  const dispatch = useAppDispatch();
  const {
    shopWarrantyList,
    shopPagination,
    loadingShopWarranties,
    isConfirmingReceipt,
  } = useAppSelector((state) => state.shopWarranty);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<WarrantyRequest | null>(
    null,
  );
  const [receiptConfirmId, setReceiptConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchShopWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(fetchShopWarrantyRequests({ page, pageSize: PAGE_SIZE }));
    },
    [dispatch],
  );

  const handleReviewClick = useCallback((request: WarrantyRequest) => {
    setSelectedIssue(request);
    setReviewModalOpen(true);
  }, []);

  const handleReviewSuccess = useCallback(() => {
    dispatch(fetchShopWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleConfirmReceiveClick = useCallback((issueId: string) => {
    setReceiptConfirmId(issueId);
  }, []);

  const handleExecuteConfirmReceive = useCallback(async () => {
    if (!receiptConfirmId) return;
    try {
      await dispatch(confirmShopReceipt(receiptConfirmId)).unwrap();
      dispatch(fetchShopWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
      setReceiptConfirmId(null);
    } catch {
      // error toast handled by thunk
    }
  }, [dispatch, receiptConfirmId]);

  if (loadingShopWarranties) return <TableSkeleton />;

  return (
    <div className="max-w-[1440px] w-full mx-auto">
      <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary min-h-screen">
        <div className="flex justify-between items-end mb-6 border-b border-amazon-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text mb-2 flex items-center gap-3">
              {/* <ShieldCheck className="w-8 h-8 text-neutral-400" /> */}
              {t("header.title")}
            </h1>
            <p className="text-[11px] text-amazon-textMuted">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        {shopWarrantyList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white shadow-sm rounded-md border border-amazon-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-amazon-text">
                <thead>
                  <tr className="bg-neutral-50 border-b border-amazon-border font-medium text-amazon-text">
                    <th className="px-5 py-4">{t("table.customer")}</th>
                    <th className="px-5 py-4">{t("table.type")}</th>
                    <th className="px-5 py-4 max-w-[200px]">
                      {t("table.reason")}
                    </th>
                    <th className="px-5 py-4">{t("table.refundAmount")}</th>
                    <th className="px-5 py-4">{t("table.createdDate")}</th>
                    <th className="px-5 py-4">{t("table.status")}</th>
                    <th className="px-5 py-4 text-center">
                      {t("table.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {shopWarrantyList.map((req) => (
                    <TableRow
                      key={req.id}
                      request={req}
                      onReviewClick={handleReviewClick}
                      onConfirmReceive={handleConfirmReceiveClick}
                      isConfirmingReceipt={
                        isConfirmingReceipt && receiptConfirmId === req.id
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5">
              <Pagination
                current={shopPagination.current}
                total={shopPagination.total}
                onChange={handlePageChange}
              />
            </div>
          </div>
        )}

        <ShopReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          issue={selectedIssue}
          onSuccess={handleReviewSuccess}
        />

        <ConfirmReceiptModal
          isOpen={!!receiptConfirmId}
          onConfirm={handleExecuteConfirmReceive}
          onCancel={() => setReceiptConfirmId(null)}
          isLoading={isConfirmingReceipt}
        />
      </div>
    </div>
  );
};

export default ShopWarrantyDashboard;
