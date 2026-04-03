"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  ChurnRiskResponse,
  CustomerOverviewParams,
} from "@/src/types/shop-dashboard.types";

// ── Helpers ──

const formatVND = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Inactive days severity ──

function InactiveBadge({ days }: { days: number }) {
  let colorClass = "text-yellow-400 bg-yellow-500/10";
  if (days >= 60) colorClass = "text-red-400 bg-red-500/15";
  else if (days >= 30) colorClass = "text-orange-400 bg-orange-500/10";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${colorClass}`}
    >
      {days} days
    </span>
  );
}

// ── Component ──

interface ChurnRiskTableProps {
  filters?: CustomerOverviewParams;
}

export default function ChurnRiskTable({ filters }: ChurnRiskTableProps) {
  const [data, setData] = useState<ChurnRiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Reset page when filters change
  const prevFilters = useRef(filters);
  useEffect(() => {
    if (prevFilters.current !== filters) {
      setPage(1);
      prevFilters.current = filters;
    }
  }, [filters]);

  // Fetch data
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await shopDashboardService.getChurnRisk({
          ...filters,
          PageNumber: page,
          PageSize: 10,
        });
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Churn risk fetch failed:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const btnClass =
    "flex items-center gap-1 border border-[#2a2d35] bg-[#1a1a1a] hover:bg-[#222222] text-sm text-white px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="bg-[#111111] border border-[#1e2126] rounded-xl overflow-hidden mt-6 w-full min-w-0">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2126] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            Churn Risk Customers
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Customers who haven&apos;t purchased recently
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-[#f5d800]" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1a1a] text-[11px] uppercase text-gray-400 font-semibold border-b border-[#2a2d35]">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Inactive</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!data?.items?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-gray-500 text-sm"
                  >
                    No churn risk customers found.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr
                    key={item.customerId}
                    className="border-b border-[#1e2126] hover:bg-[#1a1a1a]/50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {item.customerName}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">
                          {item.email}
                        </p>
                      </div>
                    </td>

                    {/* Inactive Days */}
                    <td className="px-4 py-3">
                      <InactiveBadge days={item.inactiveDays} />
                    </td>

                    {/* Lifetime Orders */}
                    <td className="px-4 py-3 text-sm text-white tabular-nums">
                      {item.lifetimeOrders}
                    </td>

                    {/* Lifetime Value */}
                    <td className="px-4 py-3 text-sm font-semibold text-green-400 tabular-nums whitespace-nowrap">
                      {formatVND(item.lifetimeValue)}
                    </td>

                    {/* Last Order */}
                    <td className="px-4 py-3 text-sm text-gray-400 tabular-nums whitespace-nowrap">
                      {formatDate(item.lastOrderAtUtc)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <button className="inline-flex items-center gap-1.5 text-xs bg-[#2a2d35] hover:bg-[#3a3b3c] text-white px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
                        <Mail className="w-3 h-3" />
                        Remind
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 0 && (
        <div className="p-4 flex items-center justify-between border-t border-[#1e2126]">
          <span className="text-xs text-gray-500">
            Page{" "}
            <span className="text-white font-semibold">{data.currentPage}</span>{" "}
            / {data.totalPages}
            <span className="ml-2 text-gray-600">
              ({data.totalCount} total)
            </span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.hasPreviousPage}
              className={btnClass}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.hasNextPage}
              className={btnClass}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
