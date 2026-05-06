"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchShopTargetedRequests,
  fetchCommissionDetail,
  rejectCommissionRequest,
} from "@/src/store/slices/commissionSlice";
import {
  Inbox,
  FileEdit,
  XCircle,
  User,
  Banknote,
  Calendar,
  Loader2,
  Eye,
  X,
  Clock,
  Package,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { SubmitQuoteModal } from "@/src/components/Shop/SubmitQuoteModal";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PendingTarget: {
    bg: "bg-amber-50 border border-amber-200",
    text: "text-amber-700",
  },
  OpenPool: { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700" },
  Completed: {
    bg: "bg-emerald-50 border border-emerald-200",
    text: "text-emerald-700",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-neutral-50 border border-amazon-border",
  text: "text-amazon-textMuted",
};

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + "₫";

const formatDateTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return dateStr;
  }
};

// ─── Skeleton Row ──────────────────────────────────────────
const RowSkeleton = () => (
  <div className="bg-white rounded-sm border border-amazon-border p-5 animate-pulse flex gap-4 shadow-sm">
    <div className="w-20 h-20 bg-neutral-100 rounded-sm shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-5 w-48 bg-neutral-100 rounded-sm" />
      <div className="h-4 w-32 bg-neutral-100 rounded-sm" />
      <div className="h-4 w-40 bg-neutral-100 rounded-sm" />
    </div>
    <div className="flex items-center gap-2">
      <div className="h-9 w-28 bg-neutral-100 rounded-sm" />
      <div className="h-9 w-24 bg-neutral-100 rounded-sm" />
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────
export default function ShopTargetedRequestsPage() {
  const t = useTranslations("ShopTargetedRequestsPage");
  const tCommon = useTranslations("Common");
  const dispatch = useDispatch<AppDispatch>();
  const { targetedRequests, loadingTargetedRequests, currentRequest, loadingDetail } = useSelector(
    (state: RootState) => state.commission,
  );

  const [quoteModal, setQuoteModal] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: "" });

  // ─── Detail Modal State ───
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // ─── Rejection Modal State ───
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: "" });
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    dispatch(fetchShopTargetedRequests());
  }, [dispatch]);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PendingTarget: t("status.pendingTarget"),
      OpenPool: t("status.openPool"),
      Completed: t("status.completed"),
    };

    return statusMap[status] ?? t("status.unknown");
  };

  const handleRefresh = () => {
    dispatch(fetchShopTargetedRequests());
  };

  const handleRejectClick = (requestId: string) => {
    setRejectModal({ isOpen: true, requestId });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.requestId) return;
    setIsRejecting(true);
    try {
      await dispatch(rejectCommissionRequest(rejectModal.requestId)).unwrap();
      setRejectModal({ isOpen: false, requestId: "" });
      handleRefresh(); // Refresh the list if needed
    } catch (error) {
      console.error(t("errors.rejectFailed"), error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleViewDetail = (requestId: string) => {
    setDetailModalOpen(true);
    dispatch(fetchCommissionDetail(requestId));
  };

  const handleQuoteFromDetail = () => {
    if (!currentRequest) return;
    setDetailModalOpen(false);
    setQuoteModal({ isOpen: true, requestId: currentRequest.commissionRequestId });
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <SubmitQuoteModal
        isOpen={quoteModal.isOpen}
        onClose={() => setQuoteModal({ isOpen: false, requestId: "" })}
        requestId={quoteModal.requestId}
        onSuccess={handleRefresh}
      />

      {/* Confirmation Modal for Rejection */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white border border-amazon-border w-full max-w-sm rounded-sm p-6 shadow-xl">
            <h2 className="text-lg font-bold text-amazon-text mb-2">
              {t("rejectModal.title")}
            </h2>
            <p className="text-[13px] font-medium text-amazon-textMuted mb-6">
              {t("rejectModal.description")}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  !isRejecting &&
                  setRejectModal({ isOpen: false, requestId: "" })
                }
                disabled={isRejecting}
                className="px-4 py-2 bg-white hover:bg-neutral-50 border border-amazon-border text-amazon-textMuted font-medium text-[13px] rounded-sm transition-colors disabled:opacity-50"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 border border-red-600 hover:bg-red-700 text-white font-medium text-[13px] rounded-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRejecting && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {isRejecting ? t("rejectModal.rejecting") : tCommon("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detailModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            className="bg-white border border-amazon-border w-full max-w-lg rounded-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-amazon-border bg-neutral-50">
              <h2 className="text-[15px] font-bold text-amazon-text">
                {t("detailModal.title")}
              </h2>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 hover:bg-neutral-200 rounded-full transition-colors text-amazon-textMuted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-7 h-7 animate-spin text-amazon-textMuted" />
                </div>
              ) : currentRequest ? (
                <div className="p-5 space-y-5">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-amazon-text">
                      {currentRequest.title}
                    </h3>
                    <span
                      className={`inline-block mt-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium ${
                        (STATUS_STYLES[currentRequest.status] || DEFAULT_STATUS).bg
                      } ${(STATUS_STYLES[currentRequest.status] || DEFAULT_STATUS).text}`}
                    >
                      {getStatusLabel(currentRequest.status)}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amazon-textMuted mb-1">
                        <User className="w-3 h-3" />
                        {t("detailModal.customer")}
                      </div>
                      <p className="text-sm font-semibold text-amazon-text truncate">
                        {currentRequest.userName}
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amazon-textMuted mb-1">
                        <Banknote className="w-3 h-3" />
                        {t("detailModal.budget")}
                      </div>
                      <p className="text-sm font-bold text-amazon-price">
                        {formatVND(currentRequest.minBudget)} – {formatVND(currentRequest.maxBudget)}
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amazon-textMuted mb-1">
                        <Package className="w-3 h-3" />
                        {t("detailModal.quantity")}
                      </div>
                      <p className="text-sm font-semibold text-amazon-text">
                        {t("detailModal.units", { count: currentRequest.quantity })}
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amazon-textMuted mb-1">
                        <Calendar className="w-3 h-3" />
                        {t("detailModal.createdAt")}
                      </div>
                      <p className="text-sm font-semibold text-amazon-text">
                        {formatDateTime(currentRequest.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Deadline */}
                  {currentRequest.shopResponseDeadlineAt && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-sm">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          {t("detailModal.deadline")}
                        </p>
                        <p className="text-sm font-semibold text-amber-800">
                          {formatDateTime(currentRequest.shopResponseDeadlineAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amazon-textMuted mb-2">
                      <FileText className="w-3 h-3" />
                      {t("detailModal.description")}
                    </div>
                    <div className="bg-neutral-50 border border-amazon-border rounded-sm p-3 text-sm text-amazon-text whitespace-pre-wrap leading-relaxed">
                      {currentRequest.description}
                    </div>
                  </div>

                  {/* Reference Images */}
                  {currentRequest.referenceImages && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amazon-textMuted mb-2">
                        <ImageIcon className="w-3 h-3" />
                        {t("detailModal.referenceImages")}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {currentRequest.referenceImages.split(",").map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-sm overflow-hidden bg-neutral-100 border border-amazon-border"
                          >
                            <Image
                              src={img.trim()}
                              alt={`Reference ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="200px"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-amazon-textMuted text-sm">
                  No data
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {currentRequest && !loadingDetail && (
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-amazon-border bg-neutral-50">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-neutral-100 border border-amazon-border text-amazon-textMuted font-medium text-[13px] rounded-sm transition-colors"
                >
                  {t("detailModal.close")}
                </button>
                {currentRequest.hasMyPendingQuote ? (
                  <span className="px-4 py-2 bg-neutral-100 border border-amazon-border text-amazon-textMuted font-medium text-[13px] rounded-sm cursor-not-allowed">
                    {t("detailModal.alreadyQuoted")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleQuoteFromDetail}
                    className="flex items-center gap-1.5 px-5 py-2 bg-amazon-btnPrimary border border-amazon-border hover:brightness-95 text-amazon-text font-medium text-[13px] rounded-sm transition-colors shadow-sm"
                  >
                    <FileEdit className="w-4 h-4" />
                    {t("detailModal.submitQuote")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="py-2 px-2 md:px-6 relative bg-amazon-bgSecondary">
        <h1 className="text-2xl font-bold text-amazon-text flex items-center gap-3">
          {t("header.title")}
        </h1>
        <p className="text-[11px] text-amazon-textMuted mt-1">
          {t("header.subtitle")}
        </p>
      </div>

      {/* Loading */}
      {loadingTargetedRequests && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingTargetedRequests && targetedRequests.length === 0 && (
        <div className="bg-white rounded-sm border border-amazon-border shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-50 border border-amazon-border flex items-center justify-center mb-5">
            <Inbox className="w-10 h-10 text-amazon-textMuted opacity-30" />
          </div>
          <h2 className="text-[14px] font-bold text-amazon-text mb-1">
            {t("empty.title")}
          </h2>
          <p className="text-[11px] font-medium text-amazon-textMuted max-w-sm">
            {t("empty.description")}
          </p>
        </div>
      )}

      {/* Request List */}
      {!loadingTargetedRequests && targetedRequests.length > 0 && (
        <div className="space-y-4">
          {targetedRequests.map((req) => {
            const statusStyle = STATUS_STYLES[req.status] || DEFAULT_STATUS;
            const statusLabel = getStatusLabel(req.status);

            return (
              <div
                key={req.commissionRequestId}
                className="bg-white rounded-sm border border-amazon-border shadow-sm p-5 hover:border-amazon-btnPrimary transition-colors cursor-pointer"
                onClick={() => handleViewDetail(req.commissionRequestId)}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Thumbnail */}
                  {req.referenceImages && (
                    <div className="relative w-full lg:w-24 h-40 lg:h-24 rounded-sm overflow-hidden bg-neutral-50 border border-amazon-border shrink-0">
                      <Image
                        src={req.referenceImages}
                        alt={req.title}
                        fill
                        className="object-cover p-1"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-amazon-text text-[15px] truncate">
                          {req.title}
                        </h3>
                        <p className="text-[13px] font-medium text-amazon-text mt-0.5">
                          {t("qty", { count: req.quantity })}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-sm text-[12px] font-medium whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-amazon-textMuted mt-2">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-amazon-text">
                          {req.userName || t("customerFallback")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5" />
                        <span className="text-amazon-price font-bold">
                          {formatVND(req.minBudget)} –{" "}
                          {formatVND(req.maxBudget)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDateTime(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 lg:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(req.commissionRequestId);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-50 text-amazon-text font-medium text-[13px] rounded-sm transition-colors border border-amazon-border shadow-sm"
                    >
                      <Eye className="w-4 h-4" /> {t("actions.viewDetail")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuoteModal({
                          isOpen: true,
                          requestId: req.commissionRequestId,
                        });
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 bg-amazon-btnPrimary border border-amazon-border hover:brightness-95 text-amazon-text font-medium text-[13px] rounded-sm transition-colors shadow-sm"
                    >
                      <FileEdit className="w-4 h-4" /> {t("actions.quote")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectClick(req.commissionRequestId);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 bg-white hover:bg-red-50 text-red-500 font-medium text-[13px] rounded-sm transition-colors border border-amazon-border shadow-sm"
                    >
                      <XCircle className="w-4 h-4" /> {t("actions.reject")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
