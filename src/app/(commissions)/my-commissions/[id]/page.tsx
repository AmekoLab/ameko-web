"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchCommissionDetail,
  acceptCommissionQuote,
  cancelCommission,
  publishCommissionToPool,
} from "@/src/store/slices/commissionSlice";
import { CommissionQuote } from "@/src/types/commission.types";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Store,
  Hash,
  Banknote,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PendingTarget: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Chờ Shop xử lý",
  },
  Quoted: { bg: "bg-blue-100", text: "text-blue-700", label: "Đã có báo giá" },
  OpenPool: { bg: "bg-blue-100", text: "text-blue-700", label: "Đang mở" },
  Completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Hoàn thành",
  },
  Canceled: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Đã hủy",
  },
  TargetRejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Shop đã từ chối",
  },
};

const QUOTE_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PendingUserDecision: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Chờ bạn quyết định",
  },
  Accepted: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Đã chấp nhận",
  },
  Rejected: { bg: "bg-red-100", text: "text-red-700", label: "Đã từ chối" },
  Expired: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hết hạn" },
};

const DEFAULT_STATUS = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  label: "Không xác định",
};

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
};

// ─── QuoteCard ─────────────────────────────────────────────
interface QuoteCardProps {
  quote: CommissionQuote;
  isAccepting: boolean;
  onAccept: (quoteId: string) => void;
}

const QuoteCard = ({ quote, isAccepting, onAccept }: QuoteCardProps) => {
  const qStatus = QUOTE_STATUS_STYLES[quote.status] || DEFAULT_STATUS;
  const isPending = quote.status === "PendingUserDecision";
  const isAccepted = quote.status === "Accepted";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Shop info + quote status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
            {quote.shopAvatar ? (
              <Image
                src={quote.shopAvatar}
                alt={quote.shopName}
                fill
                className="object-cover"
              />
            ) : (
              <Store className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {quote.shopName || "Shop"}
            </p>
            <p className="text-xs text-gray-500">Báo giá</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${qStatus.bg} ${qStatus.text}`}
        >
          {qStatus.label}
        </span>
      </div>

      {/* Body: Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Giá báo</p>
          <p className="text-xl font-bold text-[#ce2a32]">
            {formatVND(quote.quotedPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Thời gian dự kiến</p>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {quote.estimatedDays} ngày
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Hạn chót</p>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(quote.expiredAt)}
          </p>
        </div>
      </div>

      {/* Shop Notes */}
      {quote.shopNotes && (
        <div className="bg-gray-50 border-l-4 border-gray-300 rounded-r-lg px-4 py-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Lời nhắn từ Shop:</p>
          <p className="text-sm text-gray-700 italic leading-relaxed">
            {quote.shopNotes}
          </p>
        </div>
      )}

      {/* Footer: Action */}
      {isPending && (
        <button
          onClick={() => onAccept(quote.commissionQuoteId)}
          disabled={isAccepting}
          className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAccepting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Chấp nhận báo giá
            </>
          )}
        </button>
      )}
      {isAccepted && (
        <div className="w-full py-2.5 bg-green-50 text-green-700 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 border border-green-200">
          <CheckCircle className="w-4 h-4" /> Đã chọn báo giá này
        </div>
      )}
    </div>
  );
};

// ─── Confirm Modal ─────────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmAcceptModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Xác nhận chấp nhận báo giá
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Bạn có chắc chắn muốn chấp nhận mức giá này? Đơn hàng sẽ được tạo ngay
          sau khi xác nhận.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Xác nhận"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────
export default function CommissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentRequest,
    loadingDetail,
    isAcceptingQuote,
    isCanceling,
    isPublishingToPool,
  } = useSelector((state: RootState) => state.commission);

  const [confirmQuoteId, setConfirmQuoteId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchCommissionDetail(params.id));
    }
  }, [dispatch, params.id]);

  const handleAccept = (quoteId: string) => {
    setConfirmQuoteId(quoteId);
  };

  const handleConfirmAccept = async () => {
    if (!confirmQuoteId || !params.id) return;
    try {
      await dispatch(acceptCommissionQuote(confirmQuoteId)).unwrap();
      toast.success("Báo giá đã được chấp nhận!");
      setConfirmQuoteId(null);
      router.push(`/cart`);
    } catch {
      // toast handled in thunk
    }
  };

  const handleCancelRequest = async () => {
    if (!params.id) return;
    try {
      await dispatch(cancelCommission(params.id)).unwrap();
      setShowCancelConfirm(false);
    } catch {
      // toast handled in thunk
    }
  };

  const handlePublishToPool = async () => {
    if (!params.id) return;
    try {
      await dispatch(publishCommissionToPool(params.id)).unwrap();
      setShowPublishConfirm(false);
    } catch {
      // toast handled in thunk
    }
  };

  // Full-page loading
  if (loadingDetail || !currentRequest) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#ce2a32] animate-spin" />
          <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[currentRequest.status] || DEFAULT_STATUS;
  const isCanceled = currentRequest.status === "Canceled";
  const canCancel =
    !isCanceled &&
    (currentRequest.status === "PendingTarget" ||
      currentRequest.status === "OpenPool");
  const canPublish =
    currentRequest.status === "PendingTarget" ||
    currentRequest.status === "TargetRejected";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <ConfirmAcceptModal
        isOpen={!!confirmQuoteId}
        onConfirm={handleConfirmAccept}
        onCancel={() => setConfirmQuoteId(null)}
        isLoading={isAcceptingQuote}
      />

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xác nhận hủy yêu cầu
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc chắn muốn hủy yêu cầu này không? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isCanceling}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCanceling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Xác nhận hủy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm Modal */}
      {showPublishConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowPublishConfirm(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Đăng lên Chợ chung
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn muốn đăng yêu cầu này lên chợ chung để các Shop khác cùng báo
              giá? Hành động này sẽ gỡ bỏ chỉ định Shop hiện tại.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePublishToPool}
                disabled={isPublishingToPool}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPublishingToPool ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href="/my-commissions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Request Info (col-span-1) ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Canceled Alert */}
            {isCanceled && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-700">
                  Yêu cầu này đã bị hủy
                </p>
              </div>
            )}

            {/* Reference Image */}
            {currentRequest.referenceImages && (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src={currentRequest.referenceImages}
                  alt={currentRequest.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Title + Status */}
            <div>
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-xl font-black text-gray-900 flex-1">
                  {currentRequest.title}
                </h1>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
              </div>

              <p className="text-xs text-gray-400">
                ID: {currentRequest.commissionRequestId}
              </p>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              {/* Shop target */}
              {currentRequest.targetedShopId ? (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Gửi đến:</span>
                  <span className="font-medium text-gray-900">
                    {currentRequest.targetedShopName || "Shop"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Gửi lên: Chợ chung</span>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Số lượng:</span>
                <span className="font-medium text-gray-900">
                  {currentRequest.quantity}
                </span>
              </div>

              {/* Budget */}
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Ngân sách:</span>
                <span className="font-medium text-gray-900">
                  {formatVND(currentRequest.minBudget)} –{" "}
                  {formatVND(currentRequest.maxBudget)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(currentRequest.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Mô tả yêu cầu
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {currentRequest.description}
              </p>
            </div>

            {/* Cancel Button */}
            {canCancel && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCanceling}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang hủy...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Hủy yêu cầu
                  </>
                )}
              </button>
            )}

            {/* Publish to Pool Button */}
            {canPublish && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={isPublishingToPool}
                className="w-full py-2.5 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg transition-colors border border-blue-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPublishingToPool ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang đăng...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" /> Đăng lên Chợ chung
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Right Column: Quotes / Bids (col-span-2) ── */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Báo giá từ Shop
            </h2>

            {currentRequest.quotes.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Chưa có báo giá nào
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Vui lòng đợi shop phản hồi...
                </p>
              </div>
            ) : (
              /* Quotes List */
              <div className="space-y-4">
                {currentRequest.quotes.map((quote) => (
                  <QuoteCard
                    key={quote.commissionQuoteId}
                    quote={quote}
                    isAccepting={isAcceptingQuote}
                    onAccept={handleAccept}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
