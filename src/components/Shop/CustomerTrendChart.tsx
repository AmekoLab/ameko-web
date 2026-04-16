"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  Line,
} from "recharts";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  CustomerTrendItem,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── VND Formatter ──

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const compactNumber = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

// ── Custom Tooltip ──

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-amazon-border rounded-md px-4 py-3 shadow-md">
      <p className="text-xs text-amazon-textMuted mb-2 font-medium">
        {label
          ? new Date(label).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : ""}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-6 text-sm"
        >
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-amazon-text">{entry.name}</span>
          </span>
          <span className="font-bold text-amazon-text">
            {entry.dataKey === "revenue" ? formatVND(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──

interface CustomerTrendChartProps {
  filters?: CustomerOverviewParams;
}

export default function CustomerTrendChart({
  filters,
}: CustomerTrendChartProps) {
  const t = useTranslations("CustomerTrendChart");
  const [data, setData] = useState<CustomerTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await shopDashboardService.getCustomerTrend(filters);
        if (!cancelled) setData(result ?? []);
      } catch (error) {
        console.error("Customer trend fetch failed:", error);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="h-full w-full flex flex-col p-4">
      <h3 className="text-base font-bold text-amazon-text mb-2">
        {" "}
        {t("title")}
      </h3>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-0">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-0 text-amazon-textMuted text-sm font-medium">
          {t("noData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            {/* Gradient definition */}
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="bucketStartUtc"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: string) =>
                new Date(val).toLocaleDateString("vi-VN")
              }
            />

            {/* Left Y-Axis: Revenue */}
            <YAxis
              yAxisId="left"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => compactNumber(val)}
            />

            {/* Right Y-Axis: Orders / Customers */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
            />

            {/* Revenue Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name={t("legendRevenue")}
              fill="url(#colorRevenue)"
              stroke="#22c55e"
              strokeWidth={2}
            />

            {/* Orders Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name={t("legendOrders")}
              stroke="#007185"
              strokeWidth={2}
              dot={{ r: 4, fill: "#007185", strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "#007185",
                strokeWidth: 2,
                stroke: "#fff",
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
