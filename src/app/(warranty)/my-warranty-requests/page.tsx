"use client";

import { FC, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Truck,
  Eye,
  Undo2,
  Pencil,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import {
  fetchMyWarrantyRequests,
  withdrawWarranty,
} from "@/src/store/slices/warrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { format, parseISO } from "date-fns";
import CustomerShipModal from "@/src/components/Warranty/CustomerShipModal";
import UpdateWarrantyModal from "@/src/components/Warranty/UpdateWarrantyModal";

// ─── Constants ─────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
  InProgress: "bg-yellow-100 text-yellow-800",
  AwaitingReturn: "bg-blue-100 text-blue-800",
  ShopAccepted: "bg-teal-100 text-teal-800",
  Rejected: "bg-red-100 text-red-800",
  AdminReviewing: "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  AutoCancelled: "bg-gray-100 text-gray-600",
  Returning: "bg-blue-100 text-blue-800",
  Returned: "bg-blue-200 text-blue-900",
};

const TYPE_LABELS: Record<string, string> = {
  ReturnRequest: "Return / Refund",
  CancelRequest: "Order Cancellation Request",
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
  STATUS_STYLES[statusName] || "bg-gray-100 text-gray-800";

const getTypeLabel = (typeName: string): string =>
  TYPE_LABELS[typeName] || typeName;

// ─── Loading Skeleton ──────────────────────────────────────
const WarrantySkeleton: FC = () => (
  <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
    <div className="h-10 w-72 bg-gray-200 rounded mb-8" />
    <div className="space-y-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-44 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 w-60 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
          <div className="h-16 w-full bg-gray-100 rounded-lg mb-4" />
          <div className="flex gap-3">
            <div className="h-9 w-28 bg-gray-200 rounded-lg" />
            <div className="h-9 w-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyWarranties: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <ShieldCheck className="w-20 h-20 text-gray-300 mb-6" strokeWidth={1} />
    <h2 className="text-2xl font-bold text-gray-900 mb-2">No requests yet</h2>
    <p className="text-gray-500 max-w-sm">
      You have not submitted any warranty or return requests. New requests will
      appear here.
    </p>
  </div>
);

// ─── Warranty Card ─────────────────────────────────────────
interface WarrantyCardProps {
  request: WarrantyRequest;
  onShipClick: (issueId: string) => void;
  onWithdrawClick: (issueId: string) => void;
  onEditClick: (request: WarrantyRequest) => void;
  isWithdrawing: boolean;
}

const WarrantyCard: FC<WarrantyCardProps> = ({
  request,
  onShipClick,
  onWithdrawClick,
  onEditClick,
  isWithdrawing,
}) => {
  const showWithdraw = request.status === 0 || request.status === 1;
  const showEdit = request.status === 0 || request.status === 1;
  const showReturnShipping =
    request.requiresReturn && request.statusName === "AwaitingReturn";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {request.typeName === "ReturnRequest" ? (
            <PackageOpen className="w-4.5 h-4.5 text-orange-500" />
          ) : (
            <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
          )}
          <span className="text-sm font-semibold text-gray-900">
            {getTypeLabel(request.typeName)}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(request.statusName)}`}
        >
          {request.statusName}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Reason + Date */}
        <div>
          <p className="text-sm font-bold text-gray-900">{request.reason}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(request.createdAt)}
          </p>
        </div>

        {/* Refund Amount */}
        {request.refundAmount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Refund Amount:</span>
            <span className="text-base font-bold text-[#ce2a32]">
              {formatCurrency(request.refundAmount)}
            </span>
          </div>
        )}

        {/* Evidence */}
        {request.evidenceUrl && (
          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={request.evidenceUrl}
              alt="Evidence"
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* Shop Response */}
        {request.shopResponse && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-600 mb-0.5">
                Shop Response
              </p>
              <p className="text-sm text-gray-700 break-words">
                {request.shopResponse}
              </p>
            </div>
          </div>
        )}

        {/* Admin Note */}
        {request.adminNote && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-600 mb-0.5">
                Admin Note
              </p>
              <p className="text-sm text-blue-700 break-words">
                {request.adminNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Eye className="w-4 h-4" />
          View Details
        </button>

        {showWithdraw && (
          <button
            onClick={() => onWithdrawClick(request.id)}
            disabled={isWithdrawing}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            Withdraw Request
          </button>
        )}

        {showEdit && (
          <button
            onClick={() => onEditClick(request)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Request
          </button>
        )}

        {showReturnShipping && (
          <button
            onClick={() => onShipClick(request.id)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Truck className="w-4 h-4" />
            Send Return Info
          </button>
        )}
      </div>
    </div>
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
    <div className="flex items-center justify-center gap-2 pt-8">
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
const MyWarrantiesPage: FC = () => {
  const dispatch = useAppDispatch();
  const { warrantyList, pagination, loadingWarranties, isWithdrawing } =
    useAppSelector((state) => state.warranty);

  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUpdateIssue, setSelectedUpdateIssue] =
    useState<WarrantyRequest | null>(null);

  useEffect(() => {
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(fetchMyWarrantyRequests({ page, pageSize: PAGE_SIZE }));
    },
    [dispatch],
  );

  const handleShipClick = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setShipModalOpen(true);
  }, []);

  const handleShipSuccess = useCallback(() => {
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleEditClick = useCallback((request: WarrantyRequest) => {
    setSelectedUpdateIssue(request);
    setUpdateModalOpen(true);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleWithdraw = useCallback(
    async (issueId: string) => {
      const isConfirmed = window.confirm(
        "Bạn có chắc chắn muốn hủy yêu cầu khiếu nại/bảo hành này? Hành động này không thể hoàn tác.",
      );
      if (!isConfirmed) return;
      try {
        await dispatch(withdrawWarranty(issueId)).unwrap();
        dispatch(fetchMyWarrantyRequests({ page: 1, pageSize: PAGE_SIZE }));
      } catch {
        // error toast handled by thunk
      }
    },
    [dispatch],
  );

  if (loadingWarranties) return <WarrantySkeleton />;

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 lg:py-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Warranty & Return Requests
      </h1>

      {warrantyList.length === 0 ? (
        <EmptyWarranties />
      ) : (
        <>
          <div className="space-y-5">
            {warrantyList.map((req) => (
              <WarrantyCard
                key={req.id}
                request={req}
                onShipClick={handleShipClick}
                onWithdrawClick={handleWithdraw}
                onEditClick={handleEditClick}
                isWithdrawing={isWithdrawing}
              />
            ))}
          </div>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            onChange={handlePageChange}
          />
        </>
      )}

      {selectedIssueId && (
        <CustomerShipModal
          isOpen={shipModalOpen}
          onClose={() => setShipModalOpen(false)}
          issueId={selectedIssueId}
          onSuccess={handleShipSuccess}
        />
      )}

      <UpdateWarrantyModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        issue={selectedUpdateIssue}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default MyWarrantiesPage;
