"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  CustomerOverviewData,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Helpers ──

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

// ── Metric Card ──

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <div className="bg-white border border-amazon-border shadow-sm rounded-md px-3 py-1.5 flex flex-col gap-0.5 relative overflow-hidden transition-colors hover:bg-neutral-50">
      {/* Label nhỏ, không còn flex với icon */}
      <div className="text-[11px] font-medium text-amazon-textMuted leading-tight truncate">
        {label}
      </div>

      {/* Value chính, ép leading-none để sát với nhãn */}
      <div className="text-base font-bold text-amazon-text leading-none ">
        {value}
      </div>

      {/* Subtext siêu nhỏ gọn */}
      {subtext && (
        <div className="text-[10px] text-amazon-textMuted leading-tight truncate">
          {subtext}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

interface CustomerOverviewSectionProps {
  filters?: CustomerOverviewParams;
}

export default function CustomerOverviewSection({
  filters,
}: CustomerOverviewSectionProps) {
  const t = useTranslations("CustomerOverviewSection");
  const [data, setData] = useState<CustomerOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch when filters change
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await shopDashboardService.getCustomerOverview(filters);
        if (!cancelled) setData(result);
      } catch (error: any) {
        const msg = error?.message || t("fetchFailed");
        if (!cancelled) toast.error(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // Metric cards config - Đã xóa toàn bộ cấu hình Icon
  const cards = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: t("totalRevenue"),
        value: formatVND(data.totalRevenue),
      },
      {
        label: t("averageOrderValue"),
        value: formatVND(data.averageOrderValue),
      },
      {
        label: t("customers"),
        value: formatNumber(data.totalCustomers),
        // subtext: t("newReturning", {
        //   newCount: formatNumber(data.newCustomers),
        //   returningCount: formatNumber(data.returningCustomers),
        // }),
      },
      {
        label: t("retention"),
        value: `${data.repeatRate.toFixed(1)}%`,
        subtext: t("repeatShort", {
          count: formatNumber(data.repeatCustomers),
        }), // Rút gọn chữ để chống tràn
      },
      {
        label: t("orders"),
        value: formatNumber(data.totalOrders),
        subtext: t("freqShort", { frequency: data.purchaseFrequency }), // Rút gọn chữ để chống tràn
      },
    ];
  }, [data, t]);

  return (
    <section>
      {data && !isLoading && (
        <p className="text-[12px] text-amazon-textMuted text-right">
          {t("dataRange", {
            from: new Date(data.fromUtc).toLocaleDateString("vi-VN"),
            to: new Date(data.toUtc).toLocaleDateString("vi-VN"),
          })}
        </p>
      )}
      {/* Metric Cards Grid - Thu nhỏ gap từ gap-4 xuống gap-2 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-amazon-border shadow-sm rounded-md px-1 py-1.5 flex flex-col gap-1 animate-pulse"
            >
              {/* Skeleton gọn gàng hơn, không còn khối vuông icon */}
              <div className="h-3 w-16 bg-neutral-200 rounded" />
              <div className="h-4 w-24 bg-neutral-200 rounded" />
              <div className="h-2 w-32 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {cards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-amazon-textMuted bg-white border border-amazon-border shadow-sm rounded-md">
          <p className="text-sm font-medium">{t("noData")}</p>
        </div>
      )}

      {/* Date Range Footer - Ép sát lên trên với mt-1.5 và chữ text-[10px] */}
    </section>
  );
}
