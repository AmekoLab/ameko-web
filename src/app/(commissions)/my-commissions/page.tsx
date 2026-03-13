"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import { fetchMyRequests } from "@/src/store/slices/commissionSlice";
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
  { bg: string; text: string; label: string }
> = {
  PendingTarget: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Waiting for Shop",
  },
  OpenPool: { bg: "bg-blue-100", text: "text-blue-700", label: "Open" },
  Completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completed",
  },
  Canceled: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Canceled",
  },
  Quoted: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Quoted",
  },
};

const DEFAULT_STATUS = {
  bg: "bg-gray-100",
  text: "text-gray-700",
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
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-48 bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-9 w-full bg-gray-200 rounded-lg mt-2" />
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────
export default function MyCommissionsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { myRequests, loadingMyRequests } = useSelector(
    (state: RootState) => state.commission,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#ce2a32]" />
            <h1 className="text-2xl font-black text-gray-900">
              My Quotation Requests
            </h1>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Create new request
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              You have no custom requests
            </h2>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Create your first request to receive quotations from Shops.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Create new request
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loadingMyRequests && myRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myRequests.map((req) => {
              const statusStyle = STATUS_STYLES[req.status] || DEFAULT_STATUS;

              return (
                <div
                  key={req.commissionRequestId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Thumbnail */}
                  {req.referenceImages && (
                    <div className="relative h-40 w-full bg-gray-100">
                      <Image
                        src={req.referenceImages}
                        alt={req.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title + Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-gray-900 text-[15px] line-clamp-2">
                        {req.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-sm text-gray-600 flex-1">
                      {/* Shop target */}
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        {req.targetedShopId ? (
                          <span>
                            Sent to:{" "}
                            <span className="font-medium text-gray-800">
                              {req.targetedShopName || "Shop"}
                            </span>
                          </span>
                        ) : (
                          <span>Sent to: Public Market</span>
                        )}
                      </div>

                      {/* Budget */}
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          Budget:{" "}
                          <span className="font-medium text-gray-800">
                            {formatVND(req.minBudget)} -{" "}
                            {formatVND(req.maxBudget)}
                          </span>
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        <span>Quantity: {req.quantity}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <Link
                      href={`/my-commissions/${req.commissionRequestId}`}
                      className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-lg transition-colors text-center block"
                    >
                      View Details
                    </Link>
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
