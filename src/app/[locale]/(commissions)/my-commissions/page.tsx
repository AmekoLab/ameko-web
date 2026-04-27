"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  fetchMyRequests,
  publishCommissionToPool,
} from "@/src/store/slices/commissionSlice";
import { CreateCommissionModal } from "@/src/components/Profile/CreateCommissionModal";
import {
  FileText,
  Store,
  Calendar,
  Hash,
  Banknote,
  Inbox,
  PlusCircle,
  Loader2,
  ChevronRight,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; labelKey: string }
> = {
  Draft: {
    bg: "bg-neutral-100",
    border: "border-neutral-200",
    text: "text-neutral-600",
    labelKey: "draft",
  },
  PendingTarget: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    labelKey: "pendingTarget",
  },
  OpenPool: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    labelKey: "openPool",
  },
  Completed: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    labelKey: "completed",
  },
  Canceled: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "canceled",
  },
  Quoted: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    labelKey: "quoted",
  },
  RejectedByShop: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    labelKey: "rejectedByShop",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-neutral-100",
  border: "border-neutral-200",
  text: "text-neutral-600",
  labelKey: "unknown",
};

// ─── Helpers ───────────────────────────────────────────────
const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(amount) + "₫";

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

// ─── Skeleton ──────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden animate-pulse shadow-sm">
    <div className="h-48 bg-neutral-100 border-b border-neutral-100" />
    <div className="p-5 space-y-4">
      <div className="flex justify-between">
        <div className="h-5 w-40 bg-neutral-100 rounded-md" />
        <div className="h-5 w-20 bg-neutral-100 rounded-md" />
      </div>
      <div className="h-4 w-32 bg-neutral-100 rounded-md" />
      <div className="h-4 w-48 bg-neutral-100 rounded-md" />
      <div className="h-4 w-24 bg-neutral-100 rounded-md" />
      <div className="h-11 w-full bg-neutral-100 rounded-lg mt-5" />
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────
export default function MyCommissionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations("MyCommissionsPage");
  const tCommon = useTranslations("Common");
  const { myRequests, loadingMyRequests, isPublishingToPool } = useSelector(
    (state: RootState) => state.commission,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRequests = myRequests.filter((req) =>
    filterStatus === "All" ? true : req.status === filterStatus,
  );

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  return (
    <div className="bg-neutral-50 text-neutral-900 min-h-[calc(100vh-4rem)] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              {t("title")}
            </h1>
            <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">
              {t("description")}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-neutral-900 text-white font-medium text-sm rounded-xl px-6 py-3 hover:bg-neutral-800 transition-all shadow-sm flex items-center gap-2 shrink-0 active:scale-[0.98] w-full sm:w-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            {t("createRequest")}
          </button>
        </div>

        {/* Loading */}
        {loadingMyRequests && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingMyRequests && myRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-neutral-200 bg-white rounded-2xl shadow-sm mt-4">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-5 border border-neutral-100">
              <Inbox className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              {t("noRequestsFound")}
            </h2>
            <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
              {t("noRequestsDescription")}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-neutral-400" />
              {t("createNewRequest")}
            </button>
          </div>
        )}

        {/* Filter & Cards Grid */}
        {!loadingMyRequests && myRequests.length > 0 && (
          <div className="space-y-6">
            {/* Filter Controls */}
            <div className="flex sm:justify-end items-center">
              <div className="relative w-full sm:w-auto" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between gap-3 bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl px-4 py-2.5 shadow-sm w-full sm:w-[220px] transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="text-sm font-semibold text-neutral-700">
                      {filterStatus === "All"
                        ? t("filterAll")
                        : t(`status.${STATUS_STYLES[filterStatus]?.labelKey || "unknown"}`)}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Custom Dropdown Menu */}
                {isFilterOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white border border-neutral-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setFilterStatus("All");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${
                        filterStatus === "All"
                          ? "bg-blue-50 text-blue-700"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="truncate pr-2">{t("filterAll")}</span>
                      {filterStatus === "All" && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                    <div className="h-px w-full bg-neutral-100 my-1" />
                    {Object.entries(STATUS_STYLES).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setFilterStatus(key);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between group ${
                          filterStatus === key
                            ? "bg-blue-50 text-blue-700"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <span className={`w-2 h-2 shrink-0 rounded-full ${style.bg} border ${style.border}`} />
                          <span className="truncate">{t(`status.${style.labelKey}`)}</span>
                        </div>
                        {filterStatus === key && <Check className="w-4 h-4 shrink-0 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((req) => {
              const statusStyle = STATUS_STYLES[req.status] || DEFAULT_STATUS;
              const isDraft = req.status === "Draft";

              return (
                <div
                  key={req.commissionRequestId}
                  className="bg-white border border-neutral-100 hover:border-neutral-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group/card"
                >
                  {/* Thumbnail */}
                  {req.referenceImages && (
                    <div className="relative h-48 w-full bg-neutral-50 border-b border-neutral-100">
                      <Image
                        src={req.referenceImages}
                        alt={req.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Title + Badge */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <h3 className="font-semibold text-neutral-900 text-base line-clamp-2 leading-snug group-hover/card:text-blue-600 transition-colors">
                        {req.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2.5 py-1 box-border rounded-md border text-xs font-semibold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {t(`status.${statusStyle.labelKey}`)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm font-medium text-neutral-500 flex-1">
                      {/* Shop target */}
                      <div className="flex items-center gap-2.5">
                        <Store className="w-4 h-4 text-neutral-400" />
                        {req.targetedShopId ? (
                          <span>
                            {t("target")}:{" "}
                            <span className="text-neutral-900">
                              {req.targetedShopName || tCommon("shop")}
                            </span>
                          </span>
                        ) : (
                          <span>
                            {t("target")}:{" "}
                            <span className="text-neutral-900">
                              {t("publicMarket")}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Budget */}
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-4 h-4 text-neutral-400" />
                        <span>
                          {tCommon("budget")}:{" "}
                          <span className="text-green-600 font-semibold">
                            {formatVND(req.minBudget)} -{" "}
                            {formatVND(req.maxBudget)}
                          </span>
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2.5">
                        <Hash className="w-4 h-4 text-neutral-400" />
                        <span>
                          {tCommon("quantity")}:{" "}
                          <span className="text-neutral-900">
                            {req.quantity}
                          </span>
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    {isDraft ? (
                      <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-neutral-100">
                        <button
                          onClick={async () => {
                            try {
                              await dispatch(
                                publishCommissionToPool(
                                  req.commissionRequestId,
                                ),
                              ).unwrap();
                              dispatch(fetchMyRequests());
                            } catch {
                              // Errors are already handled by the thunk's toast notifications
                            }
                          }}
                          disabled={isPublishingToPool}
                          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm active:scale-[0.98]"
                        >
                          {isPublishingToPool ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            tCommon("publish")
                          )}
                        </button>
                        <Link
                          href={`/my-commissions/${req.commissionRequestId}`}
                          className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-lg transition-colors flex items-center justify-center text-center shadow-sm active:scale-[0.98]"
                        >
                          {t("viewEdit")}
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-6 pt-5 border-t border-neutral-100">
                        <Link
                          href={`/my-commissions/${req.commissionRequestId}`}
                          className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-medium text-sm rounded-lg transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                        >
                          {tCommon("viewDetails")}{" "}
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-200 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-5 border border-neutral-100">
                  <Filter className="w-8 h-8 text-neutral-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2 bg-red-100">
                  {t("noRequestsByStatus", {
                    status: t(`status.${STATUS_STYLES[filterStatus]?.labelKey || "unknown"}`),
                  })}
                </h2>
                <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
                  {t("noRequestsByStatusDescription")}
                </p>
                <button
                  onClick={() => setFilterStatus("All")}
                  className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
                >
                  {t("filterAll")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Commission Modal (public - no targetedShopId) */}
      <CreateCommissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => dispatch(fetchMyRequests())}
      />
    </div>
  );
}
