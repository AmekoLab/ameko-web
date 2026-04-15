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
  "bg-white text-amazon-text border border-amazon-border rounded-md px-2 py-1 text-xs placeholder-gray-400 focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus outline-none transition-colors";

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
    <div className="w-full flex flex-col p-4 md:p-6 gap-5 bg-amazon-bgSecondary min-h-screen">
      {/* Row 1: Header & Filter Bar */}
      <div className="shrink-0 flex flex-col xl:flex-row xl:items-end justify-between gap-1">
        <div>
          <h1 className="text-2xl font-bold text-amazon-text tracking-tight">
            Shop Dashboard
          </h1>
          <p className="text-[11px] text-amazon-textMuted mt-1">
            Monitor your shop performance and customer insights.
          </p>
        </div>

        {/* ── Global Filter Bar ── */}
        <div className="flex flex-wrap items-end gap-1 p-1 bg-white border border-amazon-border shadow-sm rounded-md">
          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amazon-textMuted">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || TODAY}
              className={inputClass}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amazon-textMuted">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              max={TODAY}
              className={inputClass}
            />
          </div>

          {/* Granularity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amazon-textMuted">
              Granularity
            </label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className={inputClass}
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
            </select>
          </div>

          {/* Churn Days */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amazon-textMuted">
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
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amazon-link hover:underline transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

      </div>

      {/* Row 2: High-Level Metrics */}
      <div className="shrink-0">
        <CustomerOverviewSection filters={currentFilters} />
      </div>

      {/* Row 3: Chart & Conversion (Split 2/1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col h-[320px] bg-white border border-amazon-border rounded-md shadow-sm">
          <CustomerTrendChart filters={currentFilters} />
        </div>
        <div className="lg:col-span-1 flex flex-col h-[320px]">
          <ConversionSummarySection filters={currentFilters} />
        </div>
      </div>

      {/* Row 4: Purchase Frequency */}
      <PurchaseFrequencyCards filters={currentFilters} />

      {/* Row 5: Tables (Split 1/1 with fixed height) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-[350px]">
          <TopSpendersTable filters={currentFilters} />
        </div>
        <div className="h-[350px]">
          <ChurnRiskTable filters={currentFilters} />
        </div>
      </div>
    </div>
  );
}
