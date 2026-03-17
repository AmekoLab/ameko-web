"use client";

import { FC, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAllWarrantyRequests } from "@/src/store/slices/adminWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import { format, parseISO } from "date-fns";
import AdminDecisionModal from "@/src/components/Admin/AdminDecisionModal";

// ─── Constants ─────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: number | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: 0, label: "Pending" },
  { value: 1, label: "In Progress" },
  { value: 2, label: "Shop Accepted" },
  { value: 3, label: "Rejected" },
  { value: 4, label: "Auto Cancelled" },
  { value: 5, label: "Awaiting Return" },
  { value: 6, label: "Returning" },
  { value: 7, label: "Returned" },
  { value: 8, label: "Completed" },
];

const STATUS_BADGE: Record<number, { bg: string; label: string }> = {
  0: { bg: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Pending" },
  1: { bg: "bg-[#f5d800]/10 text-[#f5d800] border-[#f5d800]/20", label: "In Progress" },
  2: { bg: "bg-teal-500/10 text-teal-400 border-teal-500/20", label: "Shop Accepted" },
  3: { bg: "bg-red-500/10 text-red-500 border-red-500/20", label: "Rejected" },
  4: { bg: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: "Auto Cancelled" },
  5: { bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Awaiting Return" },
  6: { bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", label: "Returning" },
  7: { bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Returned" },
  8: { bg: "bg-green-500/10 text-green-400 border-green-500/20", label: "Completed" },
};

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
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

const getStatusBadge = (status: number): { bg: string; label: string } =>
  STATUS_BADGE[status] || {
    bg: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    label: `#${status}`,
  };

const truncate = (text: string | null, max = 40): string => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

// ─── Table Skeleton ────────────────────────────────────────
const TableSkeleton: FC = () => (
  <div className="animate-pulse">
    <div className="h-10 w-48 bg-[#1e2126] rounded-sm mb-6" />
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
      <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-[#1e2126] bg-black">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 bg-[#1e2126] rounded-sm w-full" />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-[#1e2126]"
        >
          <div className="h-4 w-20 bg-[#1e2126] rounded-sm" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1e2126]" />
            <div className="h-4 w-20 bg-[#1e2126] rounded-sm" />
          </div>
          <div className="h-4 w-32 bg-[#1e2126] rounded-sm" />
          <div className="h-4 w-20 bg-[#1e2126] rounded-sm" />
          <div className="h-6 w-20 bg-[#1e2126] rounded-sm" />
          <div className="h-4 w-28 bg-[#1e2126] rounded-sm" />
          <div className="h-8 w-28 bg-[#1e2126] rounded-sm" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <ShieldCheck className="w-16 h-16 text-[#1e2126] mb-5" strokeWidth={1} />
    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">No requests found</h2>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 max-w-sm">
      No warranty or return requests match the current filter.
    </p>
  </div>
);

// ─── Table Row ─────────────────────────────────────────────
interface RowProps {
  request: WarrantyRequest;
  onDecisionClick: (request: WarrantyRequest) => void;
}

const TableRow: FC<RowProps> = ({ request, onDecisionClick }) => {
  const badge = getStatusBadge(request.status);

  return (
    <tr className="border-b border-[#1e2126] hover:bg-[#202030] transition-colors group">
      {/* ID & Date */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-[#f5d800] uppercase tracking-widest font-mono">
            {request.id.slice(0, 8)}
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {formatDate(request.createdAt)}
          </span>
        </div>
      </td>
      {/* Customer */}
      <td className="px-5 py-4">
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
            <div className="w-8 h-8 rounded-full bg-[#1e2126] flex items-center justify-center border border-gray-800">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
          <span className="text-[11px] font-bold uppercase tracking-widest text-white truncate max-w-[120px]">
            {request.customerName || "N/A"}
          </span>
        </div>
      </td>
      {/* Type & Reason */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {request.typeName}
          </span>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1 mt-1">
            {request.reason}
          </span>
        </div>
      </td>
      {/* Refund Amount */}
      <td className="px-5 py-4">
        <span className="font-oswald font-black text-white text-[13px] tracking-wider">
          {formatCurrency(request.refundAmount)}
        </span>
      </td>
      {/* Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border whitespace-nowrap ${badge.bg}`}
        >
          {badge.label}
        </span>
      </td>
      {/* Notes */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1.5 max-w-[180px]">
          <span
            className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate"
            title={request.shopResponse || undefined}
          >
            <span className="text-gray-400">Shop:</span>{" "}
            {truncate(request.shopResponse, 30)}
          </span>
          <span
            className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate"
            title={request.adminNote || undefined}
          >
            <span className="text-gray-400">Admin:</span>{" "}
            {truncate(request.adminNote, 30)}
          </span>
        </div>
      </td>
      {/* Actions */}
      <td className="px-5 py-4">
        <button
          onClick={() => onDecisionClick(request)}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black bg-[#f5d800] px-3.5 py-2 rounded-sm hover:bg-[#ffe500] transition-colors whitespace-nowrap shadow-[0_0_10px_rgba(245,216,0,0.2)]"
        >
          <Eye className="w-3.5 h-3.5" />
          View & Decide
        </button>
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
    <div className="flex items-center justify-between p-4 bg-black border-t border-[#1e2126]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Page <span className="font-black text-white px-1">{current}</span> /{" "}
        {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
          className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          disabled={current >= total}
          onClick={() => onChange(current + 1)}
          className="p-2 rounded-sm border border-[#1e2126] bg-[#151515] text-gray-400 hover:text-white hover:bg-[#202030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Status Filter ─────────────────────────────────────────
interface StatusFilterProps {
  value: number | undefined;
  onChange: (status: number | undefined) => void;
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange }) => (
  <div className="relative inline-block w-full sm:w-auto">
    <select
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      className="appearance-none w-full sm:w-auto bg-[#151515] border border-[#1e2126] rounded-sm pl-4 pr-10 py-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-300 focus:outline-none focus:border-[#f5d800]/50 hover:border-[#f5d800]/30 cursor-pointer transition-colors"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value ?? ""} className="bg-[#151515] text-gray-300">
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────
const AdminWarrantyDashboard: FC = () => {
  const dispatch = useAppDispatch();
  const { adminWarrantyList, adminPagination, loadingAdminWarranties } =
    useAppSelector((state) => state.adminWarranty);

  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined,
  );
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedAdminIssue, setSelectedAdminIssue] =
    useState<WarrantyRequest | null>(null);

  useEffect(() => {
    dispatch(
      fetchAllWarrantyRequests({
        page: 1,
        pageSize: PAGE_SIZE,
        status: statusFilter,
      }),
    );
  }, [dispatch, statusFilter]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        fetchAllWarrantyRequests({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter,
        }),
      );
    },
    [dispatch, statusFilter],
  );

  const handleDecisionClick = useCallback((request: WarrantyRequest) => {
    setSelectedAdminIssue(request);
    setDecisionModalOpen(true);
  }, []);

  const handleDecisionSuccess = useCallback(() => {
    dispatch(
      fetchAllWarrantyRequests({
        page: 1,
        pageSize: PAGE_SIZE,
        status: statusFilter,
      }),
    );
  }, [dispatch, statusFilter]);

  return (
    <div className="p-8 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-[#1e2126] pb-4">
          <div>
            <h1 className="text-3xl font-oswald font-black text-white uppercase tracking-widest flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8 text-[#f5d800]" />
              Warranty Requests
            </h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Manage warranty & return requests.
            </p>
          </div>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        {loadingAdminWarranties ? (
          <TableSkeleton />
        ) : adminWarrantyList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left border-collapse">
                <thead>
                  <tr className="bg-black border-b border-[#1e2126] text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <th className="px-5 py-4">
                      ID / Date
                    </th>
                    <th className="px-5 py-4">
                      Customer
                    </th>
                    <th className="px-5 py-4">
                      Type & Reason
                    </th>
                    <th className="px-5 py-4">
                      Amount
                    </th>
                    <th className="px-5 py-4">
                      Status
                    </th>
                    <th className="px-5 py-4">
                      Response
                    </th>
                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2126]">
                  {adminWarrantyList.map((req) => (
                    <TableRow
                      key={req.id}
                      request={req}
                      onDecisionClick={handleDecisionClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              current={adminPagination.current}
              total={adminPagination.total}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <AdminDecisionModal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        issue={selectedAdminIssue}
        onSuccess={handleDecisionSuccess}
      />
    </div>
  );
};

export default AdminWarrantyDashboard;
