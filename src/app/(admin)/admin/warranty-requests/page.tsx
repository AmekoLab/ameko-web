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
  0: { bg: "bg-orange-100 text-orange-800", label: "Pending" },
  1: { bg: "bg-yellow-100 text-yellow-800", label: "In Progress" },
  2: { bg: "bg-teal-100 text-teal-800", label: "Shop Accepted" },
  3: { bg: "bg-red-100 text-red-800", label: "Rejected" },
  4: { bg: "bg-gray-100 text-gray-600", label: "Auto Cancelled" },
  5: { bg: "bg-blue-100 text-blue-800", label: "Awaiting Return" },
  6: { bg: "bg-indigo-100 text-indigo-800", label: "Returning" },
  7: { bg: "bg-cyan-100 text-cyan-800", label: "Returned" },
  8: { bg: "bg-green-100 text-green-800", label: "Completed" },
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
    bg: "bg-gray-100 text-gray-800",
    label: `#${status}`,
  };

const truncate = (text: string | null, max = 40): string => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

// ─── Table Skeleton ────────────────────────────────────────
const TableSkeleton: FC = () => (
  <div className="animate-pulse">
    <div className="h-10 w-48 bg-gray-200 rounded mb-6" />
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full" />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-gray-100"
        >
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <ShieldCheck className="w-16 h-16 text-gray-300 mb-5" strokeWidth={1} />
    <h2 className="text-xl font-bold text-gray-900 mb-2">No requests found</h2>
    <p className="text-gray-500 max-w-sm">
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
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      {/* ID & Date */}
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-mono font-medium text-gray-900">
            {request.id.slice(0, 8)}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(request.createdAt)}
          </span>
        </div>
      </td>
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
      {/* Type & Reason */}
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            {request.typeName}
          </span>
          <span className="text-sm text-gray-700 line-clamp-1">
            {request.reason}
          </span>
        </div>
      </td>
      {/* Refund Amount */}
      <td className="px-5 py-3.5">
        <span className="text-sm font-bold text-gray-900">
          {formatCurrency(request.refundAmount)}
        </span>
      </td>
      {/* Status */}
      <td className="px-5 py-3.5">
        <span
          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${badge.bg}`}
        >
          {badge.label}
        </span>
      </td>
      {/* Notes */}
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-0.5 max-w-[180px]">
          <span
            className="text-xs text-gray-500 truncate"
            title={request.shopResponse || undefined}
          >
            <span className="font-medium">Shop:</span>{" "}
            {truncate(request.shopResponse, 30)}
          </span>
          <span
            className="text-xs text-gray-500 truncate"
            title={request.adminNote || undefined}
          >
            <span className="font-medium">Admin:</span>{" "}
            {truncate(request.adminNote, 30)}
          </span>
        </div>
      </td>
      {/* Actions */}
      <td className="px-5 py-3.5">
        <button
          onClick={() => onDecisionClick(request)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-purple-600 px-3.5 py-2 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
        >
          <Eye className="w-4 h-4" />
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

// ─── Status Filter ─────────────────────────────────────────
interface StatusFilterProps {
  value: number | undefined;
  onChange: (status: number | undefined) => void;
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange }) => (
  <div className="relative inline-block">
    <select
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer transition-colors"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value ?? ""}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 lg:py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Warranty & Return Management
        </h1>
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {loadingAdminWarranties ? (
        <TableSkeleton />
      ) : adminWarrantyList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID / Date
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type & Reason
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
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
