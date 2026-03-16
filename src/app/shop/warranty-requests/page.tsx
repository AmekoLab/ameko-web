"use client";

import { FC, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  CheckCircle,
  FileText,
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

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  InProgress: { bg: "bg-[#f5d800]/10 text-[#f5d800] border border-[#f5d800]/20", label: "Pending" },
  AwaitingReturn: { bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20", label: "Awaiting Return" },
  ShopAccepted: { bg: "bg-teal-500/10 text-teal-400 border border-teal-500/20", label: "Accepted" },
  Rejected: { bg: "bg-red-500/10 text-red-500 border border-red-500/20", label: "Rejected" },
  AdminReviewing: {
    bg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    label: "Admin Reviewing",
  },
  Completed: { bg: "bg-green-500/10 text-green-400 border border-green-500/20", label: "Completed" },
  AutoCancelled: { bg: "bg-gray-500/10 text-gray-500 border border-gray-500/20", label: "Auto Cancelled" },
  Returning: { bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20", label: "Returning" },
  Returned: { bg: "bg-blue-400/10 text-blue-300 border border-blue-400/20", label: "Returned" },
};

const TYPE_LABELS: Record<string, string> = {
  ReturnRequest: "Return / Refund",
  CancelRequest: "Order Cancellation",
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

const getStatus = (statusName: string): { bg: string; label: string } =>
  STATUS_STYLES[statusName] || {
    bg: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
    label: statusName,
  };

const getTypeLabel = (typeName: string): string =>
  TYPE_LABELS[typeName] || typeName;

// ─── Table Skeleton ────────────────────────────────────────
const TableSkeleton: FC = () => (
  <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse bg-black min-h-screen">
    <div className="h-10 w-80 bg-[#1e2126] rounded-sm mb-8" />
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-[#1e2126] bg-black">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 bg-[#1e2126] rounded-sm w-full" />
        ))}
      </div>
      {/* Body rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-[#1e2126] bg-[#151515]"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e2126]" />
            <div className="h-4 w-20 bg-[#1e2126] rounded-sm" />
          </div>
          <div className="h-4 w-24 bg-[#1e2126] rounded-sm" />
          <div className="h-4 w-32 bg-[#1e2126] rounded-sm" />
          <div className="h-4 w-20 bg-[#1e2126] rounded-sm" />
          <div className="h-4 w-28 bg-[#1e2126] rounded-sm" />
          <div className="h-6 w-20 bg-[#1e2126] rounded-sm" />
          <div className="h-8 w-24 bg-[#1e2126] rounded-sm" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-[#151515] rounded-sm border border-[#1e2126]">
    <div className="w-16 h-16 rounded-full bg-black border border-[#1e2126] flex items-center justify-center mb-5">
      <ShieldCheck className="w-8 h-8 text-[#f5d800]" />
    </div>
    <h2 className="text-[13px] font-black uppercase tracking-widest text-white mb-2">
      No requests yet
    </h2>
    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 max-w-sm">
      The shop has not received any warranty or return requests from customers.
    </p>
  </div>
);

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
  const status = getStatus(request.statusName);

  return (
    <tr className="border-b border-[#1e2126] hover:bg-[#202030] transition-colors">
      {/* Customer */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {request.customerAvatar ? (
            <Image
              src={request.customerAvatar}
              alt={request.customerName || ""}
              width={32}
              height={32}
              className="rounded-full object-cover border border-[#1e2126]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-black border border-[#1e2126] flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <span className="text-[11px] font-black uppercase tracking-widest text-white truncate max-w-[120px]">
            {request.customerName || "N/A"}
          </span>
        </div>
      </td>
      {/* Type */}
      <td className="px-5 py-3.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {getTypeLabel(request.typeName)}
        </span>
      </td>
      {/* Reason */}
      <td className="px-5 py-3.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 line-clamp-2">
          {request.reason}
        </span>
      </td>
      {/* Refund Amount */}
      <td className="px-5 py-3.5">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#f5d800]">
          {formatCurrency(request.refundAmount)}
        </span>
      </td>
      {/* Date */}
      <td className="px-5 py-3.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
          {formatDate(request.createdAt)}
        </span>
      </td>
      {/* Status */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm whitespace-nowrap ${status.bg}`}
        >
          {status.label}
        </span>
      </td>
      {/* Actions */}
      <td className="px-5 py-3.5">
        {request.status === 1 ? (
          <button
            onClick={() => onReviewClick(request)}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black bg-[#f5d800] px-3.5 py-2 rounded-sm hover:bg-[#ffe500] transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(245,216,0,0.3)]"
          >
            <Eye className="w-3.5 h-3.5 text-black" />
            View & Process
          </button>
        ) : request.status === 5 ? (
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Wait Return
          </span>
        ) : request.status === 6 ? (
          <button
            onClick={() => onConfirmReceive(request.id)}
            disabled={isConfirmingReceipt}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-green-600 px-3.5 py-2 rounded-sm hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Confirm Rcpt
          </button>
        ) : (
          <button
            onClick={() => onReviewClick(request)}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-black border border-[#1e2126] px-3.5 py-2 rounded-sm hover:bg-[#202030] hover:text-white transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            View Info
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
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-between py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">
      <span className="text-gray-400">
        Page <span className="text-white">{current}</span> / {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
          className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={current >= total}
          onClick={() => onChange(current + 1)}
          className="p-1.5 rounded-sm border border-[#1e2126] bg-[#151515] hover:bg-[#202030] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────
const ShopWarrantyDashboard: FC = () => {
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

  const handleConfirmReceive = useCallback(
    async (issueId: string) => {
      const isConfirmed = window.confirm(
        "Bạn có chắc chắn đã nhận được hàng hoàn trả nguyên vẹn? Hành động này sẽ chốt đơn và không thể hoàn tác.",
      );
      if (!isConfirmed) return;
      try {
        await dispatch(confirmShopReceipt(issueId)).unwrap();
        dispatch(fetchShopWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
      } catch {
        // error toast handled by thunk
      }
    },
    [dispatch],
  );

  if (loadingShopWarranties) return <TableSkeleton />;

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#f5d800]" />
              Warranty Requests
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Manage return & warranty requests from customers.
            </p>
          </div>
        </div>

        {shopWarrantyList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white">
                <thead>
                  <tr className="bg-black border-b border-[#1e2126] text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4 max-w-[200px]">Reason</th>
                    <th className="px-5 py-4">Refund Amount</th>
                    <th className="px-5 py-4">Created Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {shopWarrantyList.map((req) => (
                    <TableRow
                      key={req.id}
                      request={req}
                      onReviewClick={handleReviewClick}
                      onConfirmReceive={handleConfirmReceive}
                      isConfirmingReceipt={isConfirmingReceipt}
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
      </div>
    </div>
  );
};

export default ShopWarrantyDashboard;
