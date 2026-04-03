"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
    <div className="bg-[#1a1a1a] border border-[#2a2d35] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2 font-medium">
        {label ? new Date(label).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : ""}
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
            <span className="text-gray-300">{entry.name}</span>
          </span>
          <span className="font-bold text-white">
            {entry.dataKey === "revenue"
              ? formatVND(entry.value)
              : entry.value}
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

export default function CustomerTrendChart({ filters }: CustomerTrendChartProps) {
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
    <div className="bg-[#111111] border border-[#1e2126] rounded-xl p-6 mt-6 w-full">
      <h3 className="text-lg font-bold text-white mb-6"> Trend Customers</h3>

      {isLoading ? (
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#f5d800]" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[350px] text-gray-500 text-sm">
          Không có dữ liệu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
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
              stroke="#2a2d35"
              vertical={false}
            />

            <XAxis
              dataKey="bucketStartUtc"
              stroke="#888888"
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
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => compactNumber(val)}
            />

            {/* Right Y-Axis: Orders / Customers */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#888888"
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
              name="Revenue"
              fill="url(#colorRevenue)"
              stroke="#22c55e"
              strokeWidth={2}
            />

            {/* Orders Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#f5d800"
              strokeWidth={2}
              dot={{ r: 4, fill: "#f5d800", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#f5d800", strokeWidth: 2, stroke: "#111" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
