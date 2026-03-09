"use client";

import { FC, useEffect, useState } from "react";
import { User, Store, Shield } from "lucide-react";
import {
  warrantyService,
  WarrantyHistoryItem,
} from "@/src/services/warranty.service";
import { format, parseISO } from "date-fns";

// ─── Mappings ──────────────────────────────────────────────
const ROLE_STYLES: Record<
  string,
  { bg: string; badge: string; icon: FC<{ className?: string }> }
> = {
  Customer: {
    bg: "bg-green-500",
    badge: "bg-green-100 text-green-800",
    icon: User,
  },
  Shop: {
    bg: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800",
    icon: Store,
  },
  Admin: {
    bg: "bg-purple-500",
    badge: "bg-purple-100 text-purple-800",
    icon: Shield,
  },
};

const ACTION_LABELS: Record<string, string> = {
  Create: "Tạo yêu cầu",
  ShopApprove: "Shop đã duyệt",
  ShopReject: "Shop đã từ chối",
  AdminDecision: "Admin phân xử",
  UserShippedReturn: "Khách đã gửi hàng",
  ShopReceivedReturn: "Shop đã nhận hàng",
  AutoCancel: "Tự động hủy",
  Completed: "Hoàn tất",
};

// ─── Helpers ───────────────────────────────────────────────
const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm");
  } catch {
    return dateStr;
  }
};

const getRoleStyle = (roleName: string) =>
  ROLE_STYLES[roleName] || ROLE_STYLES.Customer;

const getActionLabel = (actionName: string): string =>
  ACTION_LABELS[actionName] || actionName;

// ─── Skeleton ──────────────────────────────────────────────
const TimelineSkeleton: FC = () => (
  <div className="animate-pulse space-y-6 pl-8 relative">
    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="relative">
        <div className="absolute -left-5 w-6 h-6 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Component ─────────────────────────────────────────────
interface WarrantyTimelineProps {
  issueId: string;
}

const WarrantyTimeline: FC<WarrantyTimelineProps> = ({ issueId }) => {
  const [history, setHistory] = useState<WarrantyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await warrantyService.getWarrantyHistory(issueId);
        if (!cancelled && res.success) {
          setHistory(res.data);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  if (loading) return <TimelineSkeleton />;

  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic text-center py-6">
        Chưa có lịch sử thao tác
      </p>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" />

      <div className="space-y-5">
        {history.map((item) => {
          const role = getRoleStyle(item.actorRoleName);
          const Icon = role.icon;

          return (
            <div key={item.id} className="relative">
              {/* Node circle */}
              <div
                className={`absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center ${role.bg}`}
              >
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Content */}
              <div className="space-y-1">
                {/* Header: role badge + date */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${role.badge}`}
                  >
                    {item.actorRoleName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Action title */}
                <p className="text-sm font-semibold text-gray-900">
                  {getActionLabel(item.actionName)}
                </p>

                {/* Comment */}
                {item.comment && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-600">{item.comment}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarrantyTimeline;
