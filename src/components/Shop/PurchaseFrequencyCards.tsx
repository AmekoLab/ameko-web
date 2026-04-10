"use client";

import { useState, useEffect, useMemo } from "react";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  PurchaseFrequencyData,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Metric Card ──

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-white border border-amazon-border shadow-sm rounded-md px-3 py-1.5 flex flex-col gap-0.5 relative overflow-hidden hover:bg-neutral-50 transition-colors">
      {/* Label ép nhỏ, chống tràn dòng */}
      <span className="text-[11px] font-medium text-amazon-textMuted leading-tight truncate">
        {label}
      </span>
      {/* Value chính, ép leading-none để sát với nhãn */}
      <p className="text-base font-bold text-amazon-text leading-none mt-0.5">
        {value}
      </p>
    </div>
  );
}

// ── Main Component ──

interface PurchaseFrequencyCardsProps {
  filters?: CustomerOverviewParams;
}

export default function PurchaseFrequencyCards({
  filters,
}: PurchaseFrequencyCardsProps) {
  const [data, setData] = useState<PurchaseFrequencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result =
          await shopDashboardService.getPurchaseFrequency(filters);
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Purchase frequency fetch failed:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Orders / Customer",
        value: String(data.ordersPerCustomer),
      },
      {
        label: "Avg Repurchase Cycle",
        value: `${data.averageDaysBetweenOrders} days`,
      },
      {
        label: "Customers With Orders",
        value: new Intl.NumberFormat("vi-VN").format(data.customersWithOrders),
      },
      {
        label: "Total Orders",
        value: new Intl.NumberFormat("vi-VN").format(data.totalOrders),
      },
    ];
  }, [data]);

  return (
    <section className="shrink-0">
      {/* Header - Thu nhỏ margin bottom và cỡ chữ */}
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="text-sm font-bold text-amazon-text">Purchase Frequency</h3>
      </div>

      {/* Cards Grid - Thu hẹp gap từ 4 xuống 2 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-amazon-border shadow-sm rounded-md px-3 py-1.5 flex flex-col gap-1.5 animate-pulse"
            >
              {/* Skeleton siêu nhỏ gọn */}
              <div className="h-3 w-20 bg-neutral-200 rounded" />
              <div className="h-4 w-16 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-amazon-textMuted bg-white border border-amazon-border shadow-sm rounded-md">
          <p className="text-xs font-medium">No data.</p>
        </div>
      )}
    </section>
  );
}