"use client";

import { FC, useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Info,
  History,
  Copy,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/src/store/hook";
import { getVoucherUsageHistoryThunk } from "@/src/store/slices/voucherSlice";

// ─── Helpers ─────────────────────────────────────────────

function fmtVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

// ─── Copiable Field ──────────────────────────────────────

const CopiableField: FC<{
  label: string;
  value: string;
  copyTitle: string;
  mono?: boolean;
}> = ({ label, value, copyTitle, mono }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <p className="text-[11px] text-amazon-textMuted mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`text-[13px] font-medium text-amazon-text break-all ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1 rounded-sm hover:bg-neutral-100 text-amazon-textMuted transition"
          title={copyTitle}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusColor(status: string): string {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-700 border border-green-200";
    case "Disabled":
      return "bg-red-50 text-red-700 border border-red-200";
    case "Expired":
      return "bg-neutral-100 text-amazon-textMuted border border-amazon-border";
    default:
      return "bg-neutral-100 text-amazon-textMuted border border-amazon-border";
  }
}

function typeColor(type: string): string {
  switch (type) {
    case "Promotion":
      return "bg-green-50 text-green-700 border border-green-200";
    case "Negotiation":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    case "Compensation":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    default:
      return "bg-neutral-100 text-amazon-textMuted border border-amazon-border";
  }
}

// ─── Detail Row ──────────────────────────────────────────

const DetailRow: FC<{
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <p className="text-[11px] text-amazon-textMuted mb-0.5">{label}</p>
    <div className="text-[13px] font-medium text-amazon-text">{children}</div>
  </div>
);

// ─── Props ───────────────────────────────────────────────

interface VoucherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Outer Wrapper (handles mount/unmount) ───────────────

const VoucherDetailsModal: FC<VoucherDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return <VoucherDetailsModalContent onClose={onClose} />;
};

// ─── Inner Content (state resets on remount) ─────────────

const VoucherDetailsModalContent: FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const t = useTranslations("VoucherDetailsModal");
  const tCommon = useTranslations("Common");
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const voucher = useAppSelector(
    (state) => state.voucher.selectedVoucherDetails,
  );
  const loading = useAppSelector((state) => state.voucher.isFetchingDetails);
  const usageHistory = useAppSelector((state) => state.voucher.usageHistory);
  const usagePagination = useAppSelector(
    (state) => state.voucher.usagePagination,
  );
  const isFetchingUsage = useAppSelector(
    (state) => state.voucher.isFetchingUsage,
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fetch usage history when voucher details are loaded
  useEffect(() => {
    if (voucher?.id) {
      dispatch(
        getVoucherUsageHistoryThunk({
          id: voucher.id,
          pageNumber: 1,
          pageSize: 5,
        }),
      );
    }
  }, [voucher?.id, dispatch]);

  const voucherId = voucher?.id;

  const handleUsagePageChange = useCallback(
    (newPage: number) => {
      if (!voucherId) return;
      dispatch(
        getVoucherUsageHistoryThunk({
          id: voucherId,
          pageNumber: newPage,
          pageSize: 5,
        }),
      );
    },
    [dispatch, voucherId],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const usagePct =
    voucher && voucher.usageLimit > 0
      ? Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)
      : 0;

  const getStatusLabel = useCallback(
    (status: string) => {
      const map: Record<string, string> = {
        Active: t("status.active"),
        Disabled: t("status.disabled"),
        Expired: t("status.expired"),
        Depleted: t("status.depleted"),
      };
      return map[status] ?? status;
    },
    [t],
  );

  const getTypeLabel = useCallback(
    (type: string) => {
      const map: Record<string, string> = {
        Promotion: t("type.promotion"),
        Negotiation: t("type.negotiation"),
        Compensation: t("type.compensation"),
      };
      return map[type] ?? type;
    },
    [t],
  );

  const getDiscountTypeLabel = useCallback(
    (discountType: string) => {
      const map: Record<string, string> = {
        Percentage: t("discountType.percentage"),
        FixedAmount: t("discountType.fixedAmount"),
      };
      return map[discountType] ?? discountType;
    },
    [t],
  );

  const getStackingPolicyLabel = useCallback(
    (policy: string) => {
      const map: Record<string, string> = {
        All: t("stackingPolicy.all"),
        WithCompensationOnly: t("stackingPolicy.withCompensationOnly"),
        None: t("stackingPolicy.none"),
        AllowStacking: t("stackingPolicy.allowStacking"),
      };
      return map[policy] ?? policy;
    },
    [t],
  );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 transition-opacity"
    >
      <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-sm flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mx-4 border border-amazon-border">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amazon-border">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amazon-textMuted" />
            <h3 className="font-bold text-[15px] text-amazon-text">
              {t("title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-50 rounded-sm transition-colors"
            aria-label={tCommon("close")}
          >
            <X className="w-5 h-5 text-amazon-textMuted" />
          </button>
        </div>

        {/* ── Tab Bar ── */}
        {!loading && voucher && (
          <div className="flex border-b border-amazon-border px-6">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`inline-flex items-center gap-1.5 py-3 px-4 text-sm transition-colors border-b-2 ${
                activeTab === "details"
                  ? "border-amazon-focus text-amazon-focus font-medium"
                  : "border-transparent text-amazon-textMuted hover:text-amazon-text font-medium"
              }`}
            >
              <Info className="w-4 h-4" />
              {t("tabs.generalInformation")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center gap-1.5 py-3 px-4 text-sm transition-colors border-b-2 ${
                activeTab === "history"
                  ? "border-amazon-focus text-amazon-focus font-medium"
                  : "border-transparent text-amazon-textMuted hover:text-amazon-text font-medium"
              }`}
            >
              <History className="w-4 h-4" />
              {t("tabs.usageHistory")}
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-amazon-textMuted">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm font-medium">{t("loadingDetails")}</p>
            </div>
          ) : !voucher ? (
            <div className="flex flex-col items-center justify-center py-16 text-amazon-textMuted">
              <Ticket className="w-10 h-10 opacity-20 mb-3" />
              <p className="text-sm font-medium">{t("notFound")}</p>
            </div>
          ) : (
            <>
              {/* ── Details Tab ── */}
              {activeTab === "details" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-neutral-50 rounded-sm p-4 border border-amazon-border">
                    <h4 className="text-[11px] font-medium text-amazon-textMuted mb-3">
                      {t("sections.identification")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <div className="sm:col-span-2">
                        <CopiableField
                          label={t("labels.id")}
                          value={voucher.id}
                          copyTitle={t("copy")}
                          mono
                        />
                      </div>
                      <CopiableField
                        label={t("labels.voucherCode")}
                        value={voucher.code}
                        copyTitle={t("copy")}
                        mono
                      />
                      <DetailRow label={t("labels.name")}>
                        {voucher.name}
                      </DetailRow>
                      <DetailRow label={t("labels.type")}>
                        <span
                          className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium ${typeColor(voucher.type)}`}
                        >
                          {getTypeLabel(voucher.type)}
                        </span>
                      </DetailRow>
                      <DetailRow label={t("labels.creator")}>
                        {voucher.creatorName}
                      </DetailRow>
                      {voucher.targetUserId && (
                        <div className="sm:col-span-2">
                          <CopiableField
                            label={t("labels.designatedRecipient")}
                            value={voucher.targetUserId}
                            copyTitle={t("copy")}
                            mono
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-sm p-4 border border-amazon-border">
                    <h4 className="text-[11px] font-medium text-amazon-textMuted mb-3">
                      {t("sections.valueConditions")}
                    </h4>
                    {voucher.description && (
                      <p className="text-[13px] text-amazon-text leading-relaxed mb-3">
                        {voucher.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                      <DetailRow label={t("labels.discountType")}>
                        {getDiscountTypeLabel(voucher.discountType)}
                      </DetailRow>
                      <DetailRow label={t("labels.discount")}>
                        {voucher.discountType === "Percentage" ? (
                          <span className="text-base font-bold text-amazon-text">
                            {voucher.value}%
                          </span>
                        ) : (
                          <span className="text-base font-bold text-amazon-text">
                            {fmtVND(voucher.value)}
                          </span>
                        )}
                      </DetailRow>
                      {voucher.maxDiscountAmount != null && (
                        <DetailRow label={t("labels.maxDiscount")}>
                          {fmtVND(voucher.maxDiscountAmount)}
                        </DetailRow>
                      )}
                      <DetailRow label={t("labels.minimumOrder")}>
                        {fmtVND(voucher.minOrderValue)}
                      </DetailRow>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-sm p-4 border border-amazon-border">
                    <h4 className="text-[11px] font-medium text-amazon-textMuted mb-3">
                      {t("sections.timeLimit")}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                      <DetailRow label={t("labels.startDate")}>
                        {fmtDate(voucher.startDate)}
                      </DetailRow>
                      <DetailRow label={t("labels.endDate")}>
                        {fmtDate(voucher.endDate)}
                      </DetailRow>
                      <DetailRow label={t("labels.maxUsesPerUser")}>
                        {voucher.maxUsesPerUser ? (
                          voucher.maxUsesPerUser
                        ) : (
                          <span className="text-amazon-textMuted italic">
                            {t("unlimited")}
                          </span>
                        )}
                      </DetailRow>
                      <DetailRow label={t("labels.status")}>
                        <span
                          className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium ${statusColor(voucher.status)}`}
                        >
                          {getStatusLabel(voucher.status)}
                        </span>
                      </DetailRow>
                    </div>
                    <div className="mt-4">
                      <p className="text-[11px] text-amazon-textMuted mb-2">
                        {t("labels.usageProgress")}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amazon-focus rounded-full transition-all"
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                        <span className="text-[13px] font-medium text-amazon-text shrink-0">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-sm p-4 border border-amazon-border">
                    <h4 className="text-[11px] font-medium text-amazon-textMuted mb-3">
                      {t("sections.stackingPolicy")}
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <DetailRow label={t("labels.stackable")}>
                        {voucher.isStackable ? (
                          <span className="text-amazon-text font-medium">
                            {t("stacking.yes")}
                          </span>
                        ) : (
                          <span className="text-amazon-textMuted font-medium">
                            {t("stacking.no")}
                          </span>
                        )}
                      </DetailRow>
                      <DetailRow label={t("labels.policy")}>
                        {getStackingPolicyLabel(voucher.stackingPolicy)}
                      </DetailRow>
                    </div>
                  </div>
                </div>
              )}

              {/* ── History Tab ── */}
              {activeTab === "history" && (
                <div className="animate-in fade-in duration-300">
                  {isFetchingUsage ? (
                    <div className="flex items-center justify-center py-8 text-amazon-textMuted">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm font-medium">
                        {t("loadingUsage")}
                      </span>
                    </div>
                  ) : usageHistory.length === 0 ? (
                    <p className="text-[13px] text-amazon-textMuted text-center py-6 font-medium">
                      {t("noUsage")}
                    </p>
                  ) : (
                    <>
                      <div className="rounded-sm border border-amazon-border overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-neutral-50 text-[11px] font-medium text-amazon-textMuted">
                            <tr>
                              <th className="px-4 py-3 w-[170px]">
                                {t("historyTable.usedDate")}
                              </th>
                              <th className="px-4 py-3">
                                {t("historyTable.customer")}
                              </th>
                              <th className="px-4 py-3">
                                {t("historyTable.orderCode")}
                              </th>
                              <th className="px-4 py-3 text-right">
                                {t("historyTable.orderValue")}
                              </th>
                              <th className="px-4 py-3 text-right">
                                {t("historyTable.discountApplied")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amazon-border">
                            {usageHistory.map((item, idx) => (
                              <tr
                                key={`${item.orderId}-${idx}`}
                                className="hover:bg-neutral-50 transition"
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-[13px] text-amazon-textMuted">
                                  {fmtDate(item.appliedAt)}
                                </td>
                                <td className="px-4 py-3 text-amazon-text font-medium text-[13px]">
                                  {item.customerName}
                                </td>
                                <td className="px-4 py-3 font-mono text-amazon-textMuted text-xs">
                                  <div className="flex items-center gap-1">
                                    <span>
                                      {item.orderId.length > 12
                                        ? `${item.orderId.slice(0, 12)}…`
                                        : item.orderId}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          item.orderId,
                                        )
                                      }
                                      className="shrink-0 p-0.5 rounded-sm hover:bg-neutral-200 text-amazon-textMuted hover:text-amazon-text transition"
                                      title={t("copyOrderCode")}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right text-[13px] text-amazon-text">
                                  {fmtVND(item.orderTotalAmount)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-[13px] text-amazon-text">
                                  -{fmtVND(item.discountApplied)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Usage pagination */}
                      {usagePagination && usagePagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 text-[11px] font-medium text-amazon-textMuted">
                          <span>
                            {t("pagination.page")}{" "}
                            <strong className="text-amazon-text">
                              {usagePagination.currentPage}
                            </strong>{" "}
                            / {usagePagination.totalPages}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={!usagePagination.hasPreviousPage}
                              onClick={() =>
                                handleUsagePageChange(
                                  usagePagination.currentPage - 1,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-3 py-1.5 transition hover:bg-neutral-50 hover:text-amazon-text disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-3 w-3" />{" "}
                              {t("pagination.previous")}
                            </button>
                            <button
                              type="button"
                              disabled={!usagePagination.hasNextPage}
                              onClick={() =>
                                handleUsagePageChange(
                                  usagePagination.currentPage + 1,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-sm border border-amazon-border bg-white px-3 py-1.5 transition hover:bg-neutral-50 hover:text-amazon-text disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {t("pagination.next")}{" "}
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-amazon-border bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-medium rounded-sm border border-amazon-border text-amazon-textMuted hover:bg-neutral-50 hover:text-amazon-text transition-colors"
          >
            {tCommon("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetailsModal;
