"use client";

import { useState, useEffect, useRef } from "react";
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
  }); // Bỏ bớt giờ phút để cột gọn hơn
};

// ── Component ──

interface TopSpendersTableProps {
  filters?: CustomerOverviewParams;
}

export default function TopSpendersTable({ filters }: TopSpendersTableProps) {
  const [data, setData] = useState<TopSpendersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const prevFilters = useRef(filters);
  useEffect(() => {
    if (prevFilters.current !== filters) {
      setPage(1);
      prevFilters.current = filters;
    }
  }, [filters]);

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
    "border border-amazon-border bg-white hover:bg-neutral-50 text-[11px] font-medium text-amazon-text px-2 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white border border-amazon-border shadow-sm rounded-md overflow-hidden">
      {/* Header - Siêu mỏng, không Icon */}
      <div className="px-3 py-2.5 border-b border-amazon-border bg-neutral-50 shrink-0">
        <h3 className="text-sm font-bold text-amazon-text">Top VIP Customers</h3>
      </div>

      {/* Table Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-0">
          <p className="text-xs text-amazon-textMuted">Loading...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-neutral-50 text-[11px] text-amazon-textMuted font-medium border-b border-amazon-border shadow-sm">
              <tr>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">#</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">Customer</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">Orders</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">Spent</th>
                <th className="px-2 py-1.5 font-medium whitespace-nowrap">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {!data?.items?.length ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-amazon-textMuted text-xs">
                    No data available.
                  </td>
                </tr>
              ) : (
                data.items.map((item, idx) => (
                  <tr key={item.customerId} className="border-b border-amazon-border hover:bg-neutral-50 transition-colors">
                    {/* Rank */}
                    <td className="px-2 py-1.5 w-8">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
                        {(data.currentPage - 1) * data.pageSize + idx + 1}
                      </span>
                    </td>
                    {/* Customer */}
                    <td className="px-2 py-1.5 min-w-[120px]">
                      <p className="text-amazon-text font-medium text-[11px] leading-tight truncate">
                        {item.customerName}
                      </p>
                      <p className="text-amazon-textMuted text-[10px] leading-tight truncate mt-0.5">
                        {item.email}
                      </p>
                    </td>
                    {/* Orders */}
                    <td className="px-2 py-1.5 text-[11px] text-amazon-text tabular-nums">
                      {item.orders}
                    </td>
                    {/* Total Spent */}
                    <td className="px-2 py-1.5 text-[11px] font-semibold text-amazon-price tabular-nums whitespace-nowrap">
                      {formatVND(item.totalSpent)}
                    </td>
                    {/* Last Order */}
                    <td className="px-2 py-1.5 text-[11px] text-amazon-textMuted tabular-nums whitespace-nowrap">
                      {formatDate(item.lastOrderAtUtc)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination - Ép mỏng */}
      {data && data.totalPages > 0 && (
        <div className="px-3 py-1.5 flex items-center justify-between border-t border-amazon-border bg-white shrink-0">
          <span className="text-[10px] text-amazon-textMuted">
            Page <span className="font-medium text-amazon-text">{data.currentPage}</span>/{data.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.hasPreviousPage}
              className={btnClass}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.hasNextPage}
              className={btnClass}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}