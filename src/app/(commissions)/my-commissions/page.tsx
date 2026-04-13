"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  Draft: { bg: "bg-neutral-100", border: "border-neutral-200", text: "text-neutral-600", label: "Draft" },
  PendingTarget: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    label: "Waiting for Shop",
  },
  OpenPool: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", label: "Open" },
  Completed: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    label: "Completed",
  },
  Canceled: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    label: "Canceled",
  },
  Quoted: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    label: "Quoted",
  },
  RejectedByShop: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    label: "Shop rejected",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-neutral-100",
  border: "border-neutral-200",
  text: "text-neutral-600",
  label: "Unknown",
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
  const { myRequests, loadingMyRequests, isPublishingToPool } = useSelector(
    (state: RootState) => state.commission,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
              My Requests
            </h1>
            <p className="text-neutral-500 mt-2 text-sm max-w-xl leading-relaxed">
              Manage your custom keyboard build requests, track their status, and review merchant quotations.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-neutral-900 text-white font-medium text-sm rounded-xl px-6 py-3 hover:bg-neutral-800 transition-all shadow-sm flex items-center gap-2 shrink-0 active:scale-[0.98] w-full sm:w-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            Create Request
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
              No requests found
            </h2>
            <p className="text-sm text-neutral-500 max-w-md mb-6 leading-relaxed">
              You haven't made any custom keyboard build requests yet. Create your first request to receive quotations from verified builders.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-neutral-400" />
              Create New Request
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loadingMyRequests && myRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRequests.map((req) => {
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
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm font-medium text-neutral-500 flex-1">
                      {/* Shop target */}
                      <div className="flex items-center gap-2.5">
                        <Store className="w-4 h-4 text-neutral-400" />
                        {req.targetedShopId ? (
                          <span>
                            Target:{" "}
                            <span className="text-neutral-900">
                              {req.targetedShopName || "Shop"}
                            </span>
                          </span>
                        ) : (
                          <span>
                            Target:{" "}
                            <span className="text-neutral-900">Public Market</span>
                          </span>
                        )}
                      </div>

                      {/* Budget */}
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-4 h-4 text-neutral-400" />
                        <span>
                          Budget:{" "}
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
                          Quantity: <span className="text-neutral-900">{req.quantity}</span>
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
                            "Publish"
                          )}
                        </button>
                        <Link
                          href={`/my-commissions/${req.commissionRequestId}`}
                          className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-sm rounded-lg transition-colors flex items-center justify-center text-center shadow-sm active:scale-[0.98]"
                        >
                          View / Edit
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-6 pt-5 border-t border-neutral-100">
                        <Link
                          href={`/my-commissions/${req.commissionRequestId}`}
                          className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-medium text-sm rounded-lg transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                        >
                          View Details <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
