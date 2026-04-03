"use client";

import { useState, useCallback, useMemo } from "react";
import { FilterX } from "lucide-react";
import { toast } from "react-toastify";
import type { CustomerOverviewParams } from "@/src/types/shop-dashboard.types";

import CustomerOverviewSection from "@/src/components/Shop/CustomerOverviewSection";
import CustomerTrendChart from "@/src/components/Shop/CustomerTrendChart";
import PurchaseFrequencyCards from "@/src/components/Shop/PurchaseFrequencyCards";
import TopSpendersTable from "@/src/components/Shop/TopSpendersTable";
import ChurnRiskTable from "@/src/components/Shop/ChurnRiskTable";
import ConversionSummarySection from "@/src/components/Shop/ConversionSummarySection";

// Today's date (YYYY-MM-DD) for max constraint
const TODAY = new Date().toISOString().split("T")[0];

const inputClass =
  "bg-[#1a1a1a] text-white border border-[#2a2d35] rounded-md p-2 text-sm focus:border-[#f5d800] outline-none transition-colors";

export default function DashboardPage() {
  // ── Shared filter state ──
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [granularity, setGranularity] = useState("Day");
  const [churnDays, setChurnDays] = useState(30);

  const hasActiveFilters =
    startDate || endDate || granularity !== "Day" || churnDays !== 30;

  // ── Derived filters object (memoized to avoid unnecessary re-renders) ──
  const currentFilters: CustomerOverviewParams = useMemo(() => {
    // JS validation – prevent invalid date range from reaching children
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be later than end date.");
      return {};
    }

    return {
      StartDate: startDate ? `${startDate}T00:00:00Z` : undefined,
      EndDate: endDate ? `${endDate}T23:59:59Z` : undefined,
      Granularity: granularity,
      ChurnDays: churnDays,
    };
  }, [startDate, endDate, granularity, churnDays]);

  // ── Clear filters ──
  const handleClearFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setGranularity("Day");
    setChurnDays(30);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-[1800px] mx-auto px-6 md:px-10 py-8 space-y-10">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Shop Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor your shop performance and customer insights.
          </p>
        </div>

        {/* ── Global Filter Bar ── */}
        <div className="flex flex-wrap items-end gap-4 p-4 bg-[#111111] border border-[#1e2126] rounded-xl">
          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || TODAY}
              className={inputClass}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              max={TODAY}
              className={inputClass}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Granularity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Granularity
            </label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className={inputClass}
              style={{ colorScheme: "dark" }}
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
            </select>
          </div>

          {/* Churn Days */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Churn Days
            </label>
            <input
              type="number"
              min={1}
              value={churnDays}
              onChange={(e) => setChurnDays(Number(e.target.value) || 30)}
              className={`${inputClass} w-24`}
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#f5d800] hover:text-[#ffe500] uppercase tracking-wider transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* ── Dashboard Sections ── */}

        {/* Customer Overview Cards */}
        <CustomerOverviewSection filters={currentFilters} />

        {/* Customer Trend Chart */}
        <CustomerTrendChart filters={currentFilters} />

        {/* Purchase Frequency */}
        <PurchaseFrequencyCards filters={currentFilters} />

        {/* Top VIP & Churn Risk – side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSpendersTable filters={currentFilters} />
          <ChurnRiskTable filters={currentFilters} />
        </div>

        {/* Order Conversion */}
        <ConversionSummarySection filters={currentFilters} />
      </main>
    </div>
  );
}
