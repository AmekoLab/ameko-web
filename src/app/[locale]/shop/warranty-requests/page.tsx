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
  AlertTriangle,
  UploadCloud,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchShopWarrantyRequests,
  confirmShopReceipt,
  submitShopDisputeThunk,
} from "@/src/store/slices/shopWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { format, parseISO } from "date-fns";
import ShopReviewModal from "@/src/components/Warranty/ShopReviewModal";
import { toast } from "react-toastify";

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
  ShopRejected: "bg-red-50 text-red-700 border border-red-200",
  Disputed: "bg-red-50 text-red-700 border border-red-200",
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
    ShopRejected: t("status.shopRejected"),
    Disputed: t("status.disputed"),
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
        <div className="flex flex-col items-start gap-1">
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-sm whitespace-nowrap ${statusStyle}`}
          >
            {statusLabel}
          </span>

          {/* Sub-note for Disputed / AdminReviewing statuses */}
          {(request.statusName === "Disputed" || request.statusName === "AdminReviewing") && (
            <span className="text-[10px] text-neutral-500 italic flex items-center gap-1">
              {t("status.awaitingAdminReview")}
            </span>
          )}
        </div>
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
  onConfirm: (action: "accept" | "dispute", disputeData?: { shopResponse: string; evidenceUrl: string }) => void;
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
  const [actionType, setActionType] = useState<"accept" | "dispute">("accept");
  const [shopResponse, setShopResponse] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActionType("accept");
      setShopResponse("");
      setEvidenceUrl("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(
      actionType,
      actionType === "dispute" ? { shopResponse, evidenceUrl } : undefined
    );
  };

  const isSubmitDisabled =
    isLoading ||
    (actionType === "dispute" && (!shopResponse.trim() || !evidenceUrl.trim()));

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-neutral-100 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Segmented Control for Action Type */}
        <div className="flex p-1 bg-neutral-100/80 rounded-xl mb-6 shadow-inner">
          <button
            onClick={() => setActionType("accept")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              actionType === "accept"
                ? "bg-white text-green-600 shadow-sm ring-1 ring-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
            }`}
          >
            <CheckCircle className="w-4 h-4" /> {t("confirmReceiptModal.acceptTab") || "Xác nhận"}
          </button>
          <button
            onClick={() => setActionType("dispute")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              actionType === "dispute"
                ? "bg-white text-red-600 shadow-sm ring-1 ring-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> {t("confirmReceiptModal.disputeTab") || "Khiếu nại"}
          </button>
        </div>

        {/* Dynamic Content based on Action */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {actionType === "accept" ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                {t("confirmReceiptModal.title")}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed px-4">
                {t("confirmReceiptModal.description") || "Bạn có chắc chắn muốn xác nhận đã nhận được hàng trả về? Hành động này không thể hoàn tác."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-1">
                  {t("confirmReceiptModal.disputeReason")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-neutral-200 rounded-xl p-3 text-sm min-h-[90px] focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all resize-none bg-neutral-50 focus:bg-white placeholder:text-neutral-400"
                  placeholder={t("confirmReceiptModal.disputeReasonPlaceholder") || "Mô tả chi tiết vấn đề bạn gặp phải với hàng hoàn trả..."}
                  value={shopResponse}
                  onChange={(e) => setShopResponse(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-1">
                  {t("confirmReceiptModal.disputeEvidence")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setEvidenceUrl(
                          "[https://res.cloudinary.com/demo/image/upload/sample.jpg](https://res.cloudinary.com/demo/image/upload/sample.jpg)"
                        );
                      }
                    }}
                  />
                  <div className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors ${evidenceUrl ? "border-green-400 bg-green-50" : "border-neutral-300 bg-neutral-50 group-hover:bg-neutral-100"}`}>
                    {evidenceUrl ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                        <span className="text-xs font-medium text-green-600">{t("confirmReceiptModal.disputeEvidenceUploaded")}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-neutral-400 mb-1" />
                        <span className="text-xs font-medium text-neutral-500">{t("confirmReceiptModal.disputeEvidencePlaceholder")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-600 font-bold text-sm rounded-xl transition-colors border border-neutral-200"
          >
            {t("confirmReceiptModal.cancel") || "Hủy bỏ"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] ${
              actionType === "accept"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : actionType === "accept" ? (
              t("confirmReceiptModal.confirm") || "Xác nhận"
            ) : (
              t("confirmReceiptModal.dispute") || "Submit Dispute"
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

  const handleExecuteConfirmReceive = useCallback(
    async (action: "accept" | "dispute", disputeData?: { shopResponse: string; evidenceUrl: string }) => {
      if (!receiptConfirmId) return;
      try {
        if (action === "accept") {
          await dispatch(confirmShopReceipt(receiptConfirmId)).unwrap();
          toast.success(t("confirmReceiptSuccess") || "Đã xác nhận nhận hàng thành công!");
        } else if (action === "dispute" && disputeData) {
          await dispatch(submitShopDisputeThunk({
            issueId: receiptConfirmId,
            approve: false,
            shopResponse: disputeData.shopResponse,
            evidenceUrl: disputeData.evidenceUrl,
          })).unwrap();
          toast.success(t("disputeSuccess") || "Đã gửi khiếu nại lên Admin thành công!");
        }
        
        dispatch(fetchShopWarrantyRequests({ page: shopPagination.current, pageSize: PAGE_SIZE }));
        setReceiptConfirmId(null);
      } catch (error) {
        toast.error(t("actionFailed") || "Có lỗi xảy ra, vui lòng thử lại!");
      }
    },
    [dispatch, receiptConfirmId, shopPagination.current, t]
  );

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
