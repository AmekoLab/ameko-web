"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Flag,
  XCircle,
} from "lucide-react";
import { RiskOverviewData } from "@/src/types/admin.types";
import { adminService } from "@/src/services/admin.service";

// ── Component ──────────────────────────────────────────────────────────────────

export default function RiskOverviewSection() {
  const [data, setData] = useState<RiskOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const risk = await adminService.getRiskOverview();
        setData(risk);
      } catch (error) {
        console.error("Failed to load risk overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-yellow-500" />
          Risk &amp; Dispute Overview
        </h2>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-yellow-500" />
          Risk &amp; Dispute Overview
        </h2>
        <p className="text-gray-400 text-sm">
          Failed to load risk overview data.
        </p>
      </div>
    );
  }

  // ── Card definitions ─────────────────────────────────────────────────────────

  const cards = [
    {
      id: "risk-rates",
      label: "Risk Rates",
      value: `${data.cancelRate}%`,
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      sub: (
        <span className="text-xs text-gray-500">
          Refund Rate: {data.refundRate}% | Issue Rate: {data.issueRate}%
        </span>
      ),
    },
    {
      id: "active-requests",
      label: "Active Requests & Issues",
      value: data.openIssues,
      icon: Flag,
      iconColor: "text-orange-500",
      sub: (
        <span className="text-xs text-gray-500">
          Cancel Req: {data.cancelRequests} | Refund Req:{" "}
          {data.refundRequests} | Disputes: {data.disputeRequests}
        </span>
      ),
    },
    {
      id: "order-impact",
      label: "Order Impact",
      value: data.cancelledOrders,
      icon: XCircle,
      iconColor: "text-red-500",
      sub: (
        <span className="text-xs text-gray-500">
          Refunded: {data.refundedOrders} | Total Orders: {data.totalOrders}
        </span>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-yellow-500" />
        Risk &amp; Dispute Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-[#111111] border border-[#1e2126] rounded-xl p-5 shadow-sm flex flex-col gap-2 hover:border-[#f5d800]/50 transition-colors group"
            >
              {/* Icon + Label */}
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`p-2 rounded-lg bg-white/5 ${card.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {card.label}
                </span>
              </div>

              {/* Value */}
              <p className="text-2xl font-oswald font-black text-white tracking-wider">
                {card.value}
              </p>

              {/* Subtitle / Breakdown */}
              {card.sub}
            </div>
          );
        })}
      </div>
    </div>
  );
}
