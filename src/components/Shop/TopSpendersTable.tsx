"use client";

import { useState, useEffect, useRef } from "react";
import { Award, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { shopDashboardService } from "@/src/services/shopDashboard.service";
import type {
  TopSpendersResponse,
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

// ── Component ──

interface TopSpendersTableProps {
  filters?: CustomerOverviewParams;
}

export default function TopSpendersTable({ filters }: TopSpendersTableProps) {
  const [data, setData] = useState<TopSpendersResponse | null>(null);
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
        const result = await shopDashboardService.getTopSpenders({
          ...filters,
          PageNumber: page,
          PageSize: 10,
        });
        if (!cancelled) setData(result);
      } catch (error) {
        console.error("Top spenders fetch failed:", error);
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
    <div className="bg-[#111111] border border-[#1e2126] rounded-xl overflow-hidden mt-6 w-full">
      {/* Header */}
      <div className="p-6 border-b border-[#1e2126] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <Award className="w-4.5 h-4.5 text-yellow-500" />
        </div>
        <h3 className="text-lg font-bold text-white">Top VIP Customers</h3>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-[#f5d800]" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1a1a] text-xs uppercase text-gray-400 font-semibold border-b border-[#2a2d35]">
              <tr>
                <th className="px-6 py-3.5">#</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Orders</th>
                <th className="px-6 py-3.5">Total Spent</th>
                <th className="px-6 py-3.5">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {!data?.items?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-gray-500 text-sm"
                  >
                    No data available.
                  </td>
                </tr>
              ) : (
                data.items.map((item, idx) => (
                  <tr
                    key={item.customerId}
                    className="border-b border-[#1e2126] hover:bg-[#1a1a1a]/50 transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          (data.currentPage - 1) * data.pageSize + idx === 0
                            ? "bg-yellow-500/20 text-yellow-500"
                            : (data.currentPage - 1) * data.pageSize + idx === 1
                              ? "bg-gray-400/20 text-gray-300"
                              : (data.currentPage - 1) * data.pageSize + idx === 2
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-[#1a1a1a] text-gray-500"
                        }`}
                      >
                        {(data.currentPage - 1) * data.pageSize + idx + 1}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {item.customerName}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {item.email}
                        </p>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4 text-sm text-white tabular-nums">
                      {item.orders}
                    </td>

                    {/* Total Spent */}
                    <td className="px-6 py-4 text-sm font-semibold text-green-400 tabular-nums">
                      {formatVND(item.totalSpent)}
                    </td>

                    {/* Last Order */}
                    <td className="px-6 py-4 text-sm text-gray-400 tabular-nums">
                      {formatDate(item.lastOrderAtUtc)}
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
