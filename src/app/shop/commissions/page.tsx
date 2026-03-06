"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import { fetchShopTargetedRequests } from "@/src/store/slices/commissionSlice";
import {
  Inbox,
  FileEdit,
  XCircle,
  User,
  Banknote,
  Calendar,
} from "lucide-react";
import { SubmitQuoteModal } from "@/src/components/Shop/SubmitQuoteModal";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PendingTarget: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Chờ phản hồi",
  },
  OpenPool: { bg: "bg-blue-100", text: "text-blue-700", label: "Đang mở" },
  Completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Hoàn thành",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  label: "Không xác định",
};

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

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
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse flex gap-4">
    <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-5 w-48 bg-gray-200 rounded" />
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-40 bg-gray-200 rounded" />
    </div>
    <div className="flex items-center gap-2">
      <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      <div className="h-9 w-24 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────
export default function ShopTargetedRequestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { targetedRequests, loadingTargetedRequests } = useSelector(
    (state: RootState) => state.commission,
  );

  const [quoteModal, setQuoteModal] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({ isOpen: false, requestId: "" });

  useEffect(() => {
    dispatch(fetchShopTargetedRequests());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchShopTargetedRequests());
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      <SubmitQuoteModal
        isOpen={quoteModal.isOpen}
        onClose={() => setQuoteModal({ isOpen: false, requestId: "" })}
        requestId={quoteModal.requestId}
        onSuccess={handleRefresh}
      />
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Yêu cầu chỉ định</h1>
        <p className="text-sm text-gray-500 mt-1">
          Các yêu cầu báo giá từ khách hàng gửi đến shop của bạn
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
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <Inbox className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Hiện tại chưa có yêu cầu chỉ định nào
          </h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Khi khách hàng gửi yêu cầu báo giá đến shop của bạn, chúng sẽ xuất
            hiện ở đây.
          </p>
        </div>
      )}

      {/* Request List */}
      {!loadingTargetedRequests && targetedRequests.length > 0 && (
        <div className="space-y-4">
          {targetedRequests.map((req) => {
            const statusStyle = STATUS_STYLES[req.status] || DEFAULT_STATUS;

            return (
              <div
                key={req.commissionRequestId}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Thumbnail */}
                  {req.referenceImages && (
                    <div className="relative w-full lg:w-24 h-40 lg:h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={req.referenceImages}
                        alt={req.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-[15px] truncate">
                          {req.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          SL: {req.quantity}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {req.userName || "Khách hàng"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {formatVND(req.minBudget)} –{" "}
                          {formatVND(req.maxBudget)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDateTime(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 lg:self-center">
                    <button
                      onClick={() =>
                        setQuoteModal({
                          isOpen: true,
                          requestId: req.commissionRequestId,
                        })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                      <FileEdit className="w-4 h-4" /> Xem & Báo giá
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 font-semibold text-sm rounded-lg transition-colors border border-red-200">
                      <XCircle className="w-4 h-4" /> Từ chối
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
