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
  InProgress: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  AwaitingReturn: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  ShopAccepted: "bg-teal-500/10 border-teal-500/30 text-teal-400",
  Rejected: "bg-red-500/10 border-red-500/30 text-red-400",
  AdminReviewing: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  Completed: "bg-green-500/10 border-green-500/30 text-green-400",
  AutoCancelled: "bg-gray-500/10 border-gray-500/30 text-gray-400",
  Returning: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  Returned: "bg-blue-500/20 border-blue-500/40 text-blue-300",
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
  STATUS_STYLES[statusName] || "bg-[#202030] border-[#2a2d35] text-gray-400";

const getTypeLabel = (typeName: string): string =>
  TYPE_LABELS[typeName] || typeName;

// ─── Loading Skeleton ──────────────────────────────────────
const WarrantySkeleton: FC = () => (
  <div className="bg-black min-h-screen">
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 lg:py-20 animate-pulse">
      <div className="h-10 w-72 bg-[#1e2126] rounded-sm mb-8" />
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#151515] rounded-sm border border-[#1e2126] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-44 bg-[#202030] rounded-sm" />
              <div className="h-6 w-24 bg-[#202030] rounded-sm" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 w-60 bg-[#202030] rounded-sm" />
              <div className="h-4 w-40 bg-[#202030] rounded-sm" />
              <div className="h-4 w-36 bg-[#202030] rounded-sm" />
            </div>
            <div className="h-16 w-full bg-[#111111] rounded-sm mb-4" />
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-[#202030] rounded-sm" />
              <div className="h-10 w-32 bg-[#202030] rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyWarranties: FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#1e2126] bg-[#151515] rounded-sm">
    <div className="w-16 h-16 rounded-full bg-[#202030] border border-[#2a2d35] flex items-center justify-center mb-5">
      <ShieldCheck className="w-8 h-8 text-gray-500" />
    </div>
    <h2 className="text-[14px] font-black uppercase tracking-widest text-white mb-2">No requests yet</h2>
    <p className="text-[12px] text-gray-400 max-w-sm">
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
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2126] bg-[#111111]">
        <div className="flex items-center gap-2">
          {request.typeName === "ReturnRequest" ? (
            <PackageOpen className="w-4.5 h-4.5 text-orange-500" />
          ) : (
            <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
          )}
          <span className="text-[12px] font-black uppercase tracking-widest text-white">
            {getTypeLabel(request.typeName)}
          </span>
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 box-border rounded-sm border ${getStatusStyle(request.statusName)}`}
        >
          {request.statusName}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-4">
        {/* Reason + Date */}
        <div>
          <p className="text-[14px] font-bold text-gray-200">{request.reason}</p>
          <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500 flex items-center gap-1.5 mt-2">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(request.createdAt)}
          </p>
        </div>

        {/* Refund Amount */}
        {request.refundAmount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Refund Amount:</span>
            <span className="text-[14px] font-black tracking-widest text-[#f5d800]">
              {formatCurrency(request.refundAmount)}
            </span>
          </div>
        )}

        {/* Evidence */}
        {request.evidenceUrl && (
          <div className="relative w-full h-40 rounded-sm overflow-hidden border border-[#1e2126] bg-[#0f0f0f]">
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
          <div className="flex gap-3 p-4 rounded-sm bg-[#111111] border border-[#2a2d35]">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Shop Response
              </p>
              <p className="text-[13px] text-gray-300 break-words">
                {request.shopResponse}
              </p>
            </div>
          </div>
        )}

        {/* Admin Note */}
        {request.adminNote && (
          <div className="flex gap-3 p-4 rounded-sm bg-blue-500/10 border border-blue-500/30">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-1">
                Admin Note
              </p>
              <p className="text-[13px] text-blue-300 break-words">
                {request.adminNote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-t border-[#1e2126] bg-[#0f0f0f]">
        <button className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300 bg-[#111111] border border-[#2a2d35] px-4 py-2 rounded-sm hover:bg-[#1a1c20] transition-colors shadow-sm">
          <Eye className="w-4 h-4" />
          View Details
        </button>

        {showWithdraw && (
          <button
            onClick={() => onWithdrawClick(request.id)}
            disabled={isWithdrawing}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Undo2 className="w-4 h-4" />
            Withdraw
          </button>
        )}

        {showEdit && (
          <button
            onClick={() => onEditClick(request)}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-sm hover:bg-blue-500/20 transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}

        {showReturnShipping && (
          <button
            onClick={() => onShipClick(request.id)}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black bg-[#f5d800] px-4 py-2 border border-[#f5d800] rounded-sm hover:bg-[#e6ca00] transition-colors shadow-sm"
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
        className="p-2 rounded-sm border border-[#2a2d35] bg-[#111111] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-[12px] font-bold uppercase tracking-widest text-gray-500 px-3">
        Page <span className="text-white">{current}</span> /{" "}
        {total}
      </span>
      <button
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        className="p-2 rounded-sm border border-[#2a2d35] bg-[#111111] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12 lg:py-20">
        <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-widest text-white mb-10 pb-4 border-b border-[#1e2126]">
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
    </div>
  );
};

export default MyWarrantiesPage;
