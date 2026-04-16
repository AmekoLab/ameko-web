"use client";

import { FC, useEffect, useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { fetchAllWarrantyRequests } from "@/src/store/slices/adminWarrantySlice";
import { WarrantyRequest } from "@/src/services/warranty.service";
import AdminDecisionModal from "@/src/components/Admin/AdminDecisionModal";

// ─── Constants ─────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: number | undefined; labelKey: string }[] = [
  { value: undefined, labelKey: "statusAll" },
  { value: 0, labelKey: "statusPending" },
  { value: 1, labelKey: "statusInProgress" },
  { value: 2, labelKey: "statusShopAccepted" },
  { value: 3, labelKey: "statusRejected" },
  { value: 4, labelKey: "statusAutoCancelled" },
  { value: 5, labelKey: "statusAwaitingReturn" },
  { value: 6, labelKey: "statusReturning" },
  { value: 7, labelKey: "statusReturned" },
  { value: 8, labelKey: "statusCompleted" },
];

const STATUS_BADGE: Record<number, { bg: string; labelKey: string }> = {
  0: {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    labelKey: "statusPending",
  },
  1: {
    bg: "bg-yellow-50 text-yellow-700 border-yellow-200",
    labelKey: "statusInProgress",
  },
  2: {
    bg: "bg-teal-50 text-teal-700 border-teal-200",
    labelKey: "statusShopAccepted",
  },
  3: {
    bg: "bg-red-50 text-red-700 border-red-200",
    labelKey: "statusRejected",
  },
  4: {
    bg: "bg-neutral-100 text-neutral-600 border-neutral-300",
    labelKey: "statusAutoCancelled",
  },
  5: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    labelKey: "statusAwaitingReturn",
  },
  6: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    labelKey: "statusReturning",
  },
  7: {
    bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    labelKey: "statusReturned",
  },
  8: {
    bg: "bg-green-50 text-green-700 border-green-200",
    labelKey: "statusCompleted",
  },
};

type Translator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

// ─── Helpers ───────────────────────────────────────────────
const formatCurrency = (amount: number, localeCode: string): string =>
  new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateStr: string, localeCode: string): string => {
  try {
    return new Intl.DateTimeFormat(localeCode, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const getStatusBadge = (
  status: number,
  t: Translator,
): { bg: string; label: string } => {
  const config = STATUS_BADGE[status];
  if (!config) {
    return {
      bg: "bg-neutral-100 text-neutral-600 border-neutral-300",
      label: t("statusUnknownCode", { status }),
    };
  }

  return {
    bg: config.bg,
    label: t(config.labelKey),
  };
};

const truncate = (text: string | null, max = 40): string => {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

// ─── Table Skeleton ────────────────────────────────────────
const TableSkeleton: FC = () => (
  <div className="animate-pulse flex flex-col gap-4">
    <div className="bg-white rounded-md border border-amazon-border overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-amazon-border bg-neutral-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 bg-neutral-200 rounded w-full" />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-amazon-border bg-white"
        >
          <div className="h-4 w-20 bg-neutral-100 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100" />
            <div className="h-4 w-20 bg-neutral-100 rounded" />
          </div>
          <div className="h-4 w-32 bg-neutral-100 rounded" />
          <div className="h-4 w-20 bg-neutral-100 rounded" />
          <div className="h-6 w-20 bg-neutral-100 rounded" />
          <div className="h-4 w-28 bg-neutral-100 rounded" />
          <div className="h-6 w-20 bg-neutral-100 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────
const EmptyState: FC<{ t: Translator }> = ({ t }) => (
  <div className="bg-white rounded-md border border-amazon-border flex flex-col items-center justify-center py-20 text-center shadow-sm">
    <h2 className="text-[13px] font-bold text-amazon-text mb-1">
      {t("emptyTitle")}
    </h2>
    <p className="text-[11px] text-amazon-textMuted max-w-sm">
      {t("emptyDescription")}
    </p>
  </div>
);

// ─── Table Row ─────────────────────────────────────────────
interface RowProps {
  request: WarrantyRequest;
  onDecisionClick: (request: WarrantyRequest) => void;
  t: Translator;
  dateLocale: string;
  numberLocale: string;
}

const TableRow: FC<RowProps> = ({
  request,
  onDecisionClick,
  t,
  dateLocale,
  numberLocale,
}) => {
  const badge = getStatusBadge(request.status, t);

  return (
    <tr className="border-b border-amazon-border hover:bg-neutral-50 transition-colors">
      {/* ID & Date */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-mono font-medium text-amazon-text">
            {request.id.slice(0, 8)}
          </span>
          <span className="text-[10px] text-amazon-textMuted">
            {formatDate(request.createdAt, dateLocale)}
          </span>
        </div>
      </td>
      {/* Customer */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {request.customerAvatar ? (
            <Image
              src={request.customerAvatar}
              alt={request.customerName || t("customerAvatarAlt")}
              width={24}
              height={24}
              className="rounded-full object-cover border border-amazon-border"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center border border-amazon-border">
              <span className="text-[10px] text-amazon-textMuted">U</span>
            </div>
          )}
          <span className="text-[11px] font-medium text-amazon-text truncate max-w-[120px]">
            {request.customerName || t("notAvailable")}
          </span>
        </div>
      </td>
      {/* Type & Reason */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-amazon-text">
            {request.typeName}
          </span>
          <span className="text-[11px] text-amazon-textMuted max-w-[150px] truncate">
            {request.reason}
          </span>
        </div>
      </td>
      {/* Refund Amount */}
      <td className="px-4 py-3">
        <span className="font-bold text-[11px] text-amazon-text">
          {formatCurrency(request.refundAmount, numberLocale)}
        </span>
      </td>
      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-sm border whitespace-nowrap ${badge.bg}`}
        >
          {badge.label}
        </span>
      </td>
      {/* Notes */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 max-w-[180px]">
          <span
            className="text-[10px] text-amazon-textMuted truncate"
            title={request.shopResponse || undefined}
          >
            <strong className="font-medium text-amazon-text">
              {t("shopLabel")}:
            </strong>{" "}
            {truncate(request.shopResponse, 30)}
          </span>
          <span
            className="text-[10px] text-amazon-textMuted truncate"
            title={request.adminNote || undefined}
          >
            <strong className="font-medium text-amazon-text">
              {t("adminLabel")}:
            </strong>{" "}
            {truncate(request.adminNote, 30)}
          </span>
        </div>
      </td>
      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDecisionClick(request)}
          className="inline-flex text-[10px] font-medium text-amazon-text bg-white border border-amazon-border px-3 py-1.5 rounded-sm hover:bg-neutral-50 transition-colors whitespace-nowrap shadow-sm"
        >
          {t("viewDetails")}
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
  t: Translator;
}

const Pagination: FC<PaginationProps> = ({ current, total, onChange, t }) => {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-between p-3 border-t border-amazon-border bg-neutral-50/50">
      <span className="text-[10px] text-amazon-textMuted">
        {t("pageLabel")}{" "}
        <span className="font-bold text-amazon-text mx-0.5">{current}</span> /{" "}
        {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
          className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t("prev")}
        </button>
        <button
          disabled={current >= total}
          onClick={() => onChange(current + 1)}
          className="px-2 py-1 text-[10px] font-medium rounded-sm border border-amazon-border bg-white text-amazon-text hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

// ─── Status Filter ─────────────────────────────────────────
interface StatusFilterProps {
  value: number | undefined;
  onChange: (status: number | undefined) => void;
  t: Translator;
}

const StatusFilter: FC<StatusFilterProps> = ({ value, onChange, t }) => (
  <div className="relative inline-block w-full sm:w-auto">
    <select
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      className="appearance-none w-full sm:w-auto bg-white border border-amazon-border py-1.5 pl-2 pr-6 text-[10px] font-medium text-amazon-text rounded-sm focus:outline-none focus:border-amazon-btnPrimary cursor-pointer transition-colors"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option
          key={opt.value ?? "all"}
          value={opt.value ?? ""}
          className="text-amazon-text"
        >
          {t(opt.labelKey)}
        </option>
      ))}
    </select>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────
const AdminWarrantyDashboard: FC = () => {
  const t = useTranslations("AdminWarrantyRequestsPage");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const numberLocale = locale === "vi" ? "vi-VN" : "en-US";

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
    <div className="w-full flex flex-col gap-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-amazon-text leading-tight">
              {t("title")}
            </h1>
            <p className="text-[11px] text-amazon-textMuted mt-0.5">
              {t("subtitle")}
            </p>
          </div>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} t={t} />
        </div>

        {loadingAdminWarranties ? (
          <TableSkeleton />
        ) : adminWarrantyList.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="bg-white rounded-md border border-amazon-border flex flex-col shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-neutral-50 border-b border-amazon-border">
                  <tr className="text-left text-[10px] font-medium text-amazon-textMuted">
                    <th className="px-4 py-2">{t("tableIdDate")}</th>
                    <th className="px-4 py-2">{t("tableCustomer")}</th>
                    <th className="px-4 py-2">{t("tableTypeReason")}</th>
                    <th className="px-4 py-2">{t("tableAmount")}</th>
                    <th className="px-4 py-2">{t("tableStatus")}</th>
                    <th className="px-4 py-2">{t("tableResponse")}</th>
                    <th className="px-4 py-2 text-right">{t("tableAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amazon-border text-amazon-text">
                  {adminWarrantyList.map((req) => (
                    <TableRow
                      key={req.id}
                      request={req}
                      onDecisionClick={handleDecisionClick}
                      t={t}
                      dateLocale={dateLocale}
                      numberLocale={numberLocale}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              current={adminPagination.current}
              total={adminPagination.total}
              onChange={handlePageChange}
              t={t}
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
