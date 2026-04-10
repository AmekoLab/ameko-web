"use client";

import { useEffect, useState } from "react";
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
      <div className="flex flex-col h-full w-full gap-2 min-h-0">
        <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">
          Risk &amp; Dispute Overview
        </h2>
        <div className="flex items-center justify-center flex-1">
          <p className="text-amazon-textMuted text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col h-full w-full gap-2 min-h-0">
        <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0">
          Risk &amp; Dispute Overview
        </h2>
        <p className="text-amazon-textMuted text-sm">
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
      sub: (
        <span className="text-[11px] text-amazon-textMuted leading-tight mt-1">
          Refund Rate: {data.refundRate}% | Issue Rate: {data.issueRate}%
        </span>
      ),
    },
    {
      id: "active-requests",
      label: "Active Requests & Issues",
      value: data.openIssues,
      sub: (
        <span className="text-[11px] text-amazon-textMuted leading-tight mt-1">
          Cancel Req: {data.cancelRequests} | Refund Req:{" "}
          {data.refundRequests} | Disputes: {data.disputeRequests}
        </span>
      ),
    },
    {
      id: "order-impact",
      label: "Order Impact",
      value: data.cancelledOrders,
      sub: (
        <span className="text-[11px] text-amazon-textMuted leading-tight mt-1">
          Refunded: {data.refundedOrders} | Total Orders: {data.totalOrders}
        </span>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full gap-2 min-h-0">
      <h2 className="text-sm font-bold text-amazon-text mb-0 shrink-0 pt-4">
        Risk &amp; Dispute Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white border border-amazon-border shadow-sm rounded-md px-4 py-3 flex flex-col gap-0.5 h-fit transition-colors hover:bg-neutral-50"
            >
              <span className="text-xs font-medium text-amazon-textMuted">
                {card.label}
              </span>
              <p className="text-lg font-bold text-amazon-text leading-none mt-1">
                {card.value}
              </p>
              {card.sub}
            </div>
          );
        })}
      </div>
    </div>
  );
}
