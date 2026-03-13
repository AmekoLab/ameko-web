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
  InProgress: { bg: "bg-yellow-100 text-yellow-800", label: "Pending" },
  AwaitingReturn: { bg: "bg-blue-100 text-blue-800", label: "Awaiting Return" },
  ShopAccepted: { bg: "bg-teal-100 text-teal-800", label: "Accepted" },
  Rejected: { bg: "bg-red-100 text-red-800", label: "Rejected" },
  AdminReviewing: {
    bg: "bg-purple-100 text-purple-800",
    label: "Admin Reviewing",
  },
  Completed: { bg: "bg-green-100 text-green-800", label: "Completed" },
  AutoCancelled: { bg: "bg-gray-100 text-gray-600", label: "Auto Cancelled" },
  Returning: { bg: "bg-blue-100 text-blue-800", label: "Returning" },
  Returned: { bg: "bg-blue-200 text-blue-900", label: "Returned" },
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
    bg: "bg-gray-100 text-gray-800",
    label: statusName,
  };

const getTypeLabel = (typeName: string): string =>
  TYPE_LABELS[typeName] || typeName;

// ─── Table Skeleton ────────────────────────────────────────
const TableSkeleton: FC = () => (
  <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-80 bg-gray-200 rounded mb-8" />
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full" />
        ))}
      </div>
      {/* Body rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <ShieldCheck className="w-16 h-16 text-gray-300 mb-5" strokeWidth={1} />
    <h2 className="text-xl font-bold text-gray-900 mb-2">No requests yet</h2>
    <p className="text-gray-500 max-w-sm">
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
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      {/* Customer */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {request.customerAvatar ? (
            <Image
              src={request.customerAvatar}
              alt={request.customerName || ""}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {request.customerName || "N/A"}
          </span>
        </div>
      </td>
      {/* Type */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-gray-700">
          {getTypeLabel(request.typeName)}
        </span>
      </td>
      {/* Reason */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-gray-700 line-clamp-2">
          {request.reason}
        </span>
      </td>
      {/* Refund Amount */}
      <td className="px-5 py-3.5">
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(request.refundAmount)}
        </span>
      </td>
      {/* Date */}
      <td className="px-5 py-3.5">
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(request.createdAt)}
        </span>
      </td>
      {/* Status */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.bg}`}
        >
          {status.label}
        </span>
      </td>
      {/* Actions */}
      <td className="px-5 py-3.5">
        {request.status === 1 ? (
          <button
            onClick={() => onReviewClick(request)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 px-3.5 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            View & Process
          </button>
        ) : request.status === 5 ? (
          <span className="text-gray-500 text-sm italic">
            Waiting for customer to send item
          </span>
        ) : request.status === 6 ? (
          <button
            onClick={() => onConfirmReceive(request.id)}
            disabled={isConfirmingReceipt}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-green-600 px-3.5 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm item received
          </button>
        ) : (
          <button
            onClick={() => onReviewClick(request)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            View details
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
    <div className="flex items-center justify-center gap-2 py-5">
      <button
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-600 px-3">
        Page <span className="font-semibold text-gray-900">{current}</span> /{" "}
        {total}
      </span>
      <button
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
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
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 lg:py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Warranty & Return Request Management
      </h1>

      {shopWarrantyList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
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
          <Pagination
            current={shopPagination.current}
            total={shopPagination.total}
            onChange={handlePageChange}
          />
        </div>
      )}

      <ShopReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        issue={selectedIssue}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default ShopWarrantyDashboard;
