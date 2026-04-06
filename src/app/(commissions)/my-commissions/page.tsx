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
  Quote,
  PlusCircle,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────
const STATUS_STYLES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  Draft: { bg: "bg-[#202030]", border: "border-[#2a2d35]", text: "text-gray-300", label: "Draft" },
  PendingTarget: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    label: "Waiting for Shop",
  },
  OpenPool: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", label: "Open" },
  Completed: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    label: "Completed",
  },
  Canceled: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    label: "Canceled",
  },
  Quoted: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    label: "Quoted",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-[#202030]",
  border: "border-[#2a2d35]",
  text: "text-gray-400",
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
  <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-hidden animate-pulse">
    <div className="h-48 bg-[#1e2126] border-b border-[#1e2126]" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-40 bg-[#1e2126] rounded-sm" />
        <div className="h-5 w-20 bg-[#1e2126] rounded-sm" />
      </div>
      <div className="h-4 w-32 bg-[#1e2126] rounded-sm" />
      <div className="h-4 w-48 bg-[#1e2126] rounded-sm" />
      <div className="h-4 w-24 bg-[#1e2126] rounded-sm" />
      <div className="h-10 w-full bg-[#1e2126] rounded-sm mt-4" />
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
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#1e2126] pb-5">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#f5d800]" />
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-widest text-white">
              My Requests
            </h1>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#f5d800] hover:bg-[#e6ca00] text-black px-5 py-3 rounded-sm transition font-black text-[12px] uppercase tracking-widest shadow-md shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Create new
          </button>
        </div>

        {/* Loading */}
        {loadingMyRequests && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingMyRequests && myRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#1e2126] bg-[#151515] rounded-sm mx-4 lg:mx-0">
            <div className="w-16 h-16 rounded-full bg-[#202030] flex items-center justify-center mb-5 border border-[#2a2d35]">
              <Inbox className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-white mb-2">
              No requests found
            </h2>
            <p className="text-[13px] font-bold text-gray-400 max-w-sm mb-6">
              Create your first request to receive quotations from Shops.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#111111] border border-[#2a2d35] hover:border-[#f5d800]/50 hover:text-[#f5d800] text-white px-5 py-2.5 rounded-sm transition font-black text-[11px] uppercase tracking-widest"
            >
              <PlusCircle className="w-4 h-4" />
              Create new request
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loadingMyRequests && myRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myRequests.map((req) => {
              const statusStyle = STATUS_STYLES[req.status] || DEFAULT_STATUS;
              const isDraft = req.status === "Draft";

              return (
                <div
                  key={req.commissionRequestId}
                  className="bg-[#151515] border border-[#1e2126] hover:border-[#3a3f4a] rounded-sm overflow-hidden shadow-md transition-colors flex flex-col"
                >
                  {/* Thumbnail */}
                  {req.referenceImages && (
                    <div className="relative h-48 w-full bg-[#0f0f0f] border-b border-[#1e2126]">
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
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-black text-white text-[14px] uppercase tracking-wider line-clamp-2 leading-snug">
                        {req.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2.5 py-1 box-border rounded-sm border text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5 text-[12px] font-bold text-gray-400 flex-1">
                      {/* Shop target */}
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-gray-500" />
                        {req.targetedShopId ? (
                          <span>
                            Target:{" "}
                            <span className="text-white">
                              {req.targetedShopName || "Shop"}
                            </span>
                          </span>
                        ) : (
                          <span>
                            Target:{" "}
                            <span className="text-white">Public Market</span>
                          </span>
                        )}
                      </div>

                      {/* Budget */}
                      <div className="flex items-center gap-2">
                        <Banknote className="w-3.5 h-3.5 text-gray-500" />
                        <span>
                          Budget:{" "}
                          <span className="text-[#f5d800] font-black">
                            {formatVND(req.minBudget)} -{" "}
                            {formatVND(req.maxBudget)}
                          </span>
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-gray-500" />
                        <span>
                          Qty: <span className="text-white">{req.quantity}</span>
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    {isDraft ? (
                      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[#1e2126]">
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
                          className="w-full py-2.5 bg-[#f5d800] hover:bg-[#e6ca00] text-black font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                        >
                          Publish
                        </button>
                        <Link
                          href={`/my-commissions/${req.commissionRequestId}`}
                          className="w-full py-2.5 bg-[#111111] border border-[#2a2d35] hover:border-[#f5d800]/50 hover:text-[#f5d800] text-gray-300 font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center text-center shadow-sm"
                        >
                          View / Edit
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-5 pt-4 border-t border-[#1e2126]">
                        <Link
                          href={`/my-commissions/${req.commissionRequestId}`}
                          className="block w-full py-2.5 bg-[#111111] hover:bg-[#1a1c20] text-gray-300 hover:text-white font-black text-[11px] uppercase tracking-widest rounded-sm transition-colors text-center border border-[#2a2d35] hover:border-[#f5d800]/50 hover:shadow-md"
                        >
                          View Details
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
