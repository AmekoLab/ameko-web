"use client";

import { FC, useState, useCallback, useMemo, memo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Constants
const AVAILABILITY_STATUS = {
  IN_STOCK: "IN_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

// Types
interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
  defaultOpen?: boolean;
}

// Memoized FilterGroup component
const FilterGroup: FC<FilterGroupProps> = memo(
  ({ title, options, selectedValues, onChange, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const selectedCount = selectedValues.length;

    return (
      <div className="border-b border-amazon-border py-5">
        <button
          onClick={toggleOpen}
          className="flex items-center justify-between w-full text-left mb-4 group focus:outline-none"
          aria-expanded={isOpen}
          aria-controls={`filter-${title}`}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amazon-textMuted group-hover:text-amazon-text transition-colors">
            {title}
            {selectedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-amazon-text bg-amazon-btnSecondary rounded-none">
                {selectedCount}
              </span>
            )}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-500 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 transition-transform" />
          )}
        </button>

        {isOpen && (
          <div
            id={`filter-${title}`}
            className="space-y-3"
            role="group"
            aria-label={`${title} filters`}
          >
            {options.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              const isDisabled = opt.count === 0;

              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 group/item ${
                    isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-4 h-4 border border-amazon-border bg-white rounded-none checked:bg-amazon-focus checked:border-amazon-focus transition-all focus:ring-1 focus:ring-amazon-focus focus:ring-offset-0 disabled:cursor-not-allowed"
                      checked={isChecked}
                      onChange={() => onChange(opt.value)}
                      disabled={isDisabled}
                      aria-label={`Filter by ${opt.label}`}
                    />
                    <svg
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isChecked ? "text-amazon-text font-bold" : "text-amazon-textMuted"
                    } ${!isDisabled && "group-hover/item:text-amazon-text"}`}
                  >
                    {opt.label}
                  </span>
                  {opt.count !== undefined && (
                    <span className="ml-auto text-xs text-amazon-textMuted">
                      ({opt.count})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

FilterGroup.displayName = "FilterGroup";

// Main Sidebar Props
interface ShopSidebarProps {
  filters: {
    categories: string[];
    availability: string[];
    layout: string[];
  };
  onFilterChange: (type: "categories" | "availability" | "layout", value: string) => void;
  onClearAll?: () => void;
  productCounts?: {
    [key: string]: number;
  };
  /** Dynamic category list derived from actual products */
  categoryList?: string[];
  /** Dynamic layout list derived from actual products */
  layoutList?: string[];
}

export const ShopSidebar: FC<ShopSidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  productCounts = {},
  categoryList = [],
  layoutList = [],
}) => {
  const t = useTranslations("ShopSidebar");
  const handleCategoryChange = useCallback(
    (value: string) => onFilterChange("categories", value),
    [onFilterChange],
  );

  const handleAvailabilityChange = useCallback(
    (value: string) => onFilterChange("availability", value),
    [onFilterChange],
  );

  const handleLayoutChange = useCallback(
    (value: string) => onFilterChange("layout", value),
    [onFilterChange],
  );

  const availabilityOptions = useMemo<FilterOption[]>(
    () => [
      {
        label: t("inStock"),
        value: AVAILABILITY_STATUS.IN_STOCK,
        count: productCounts[AVAILABILITY_STATUS.IN_STOCK],
      },
      {
        label: t("outOfStock"),
        value: AVAILABILITY_STATUS.OUT_OF_STOCK,
        count: productCounts[AVAILABILITY_STATUS.OUT_OF_STOCK],
      },
    ],
    [productCounts, t],
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      categoryList.map((cat) => ({
        label: cat,
        value: cat,
        count: productCounts[cat],
      })),
    [categoryList, productCounts],
  );

  const layoutOptions = useMemo<FilterOption[]>(
    () =>
      layoutList.map((layout) => ({
        label: layout,
        value: layout,
        count: productCounts[`layout:${layout}`],
      })),
    [layoutList, productCounts],
  );

  const hasActiveFilters =
    filters.categories.length > 0 || filters.availability.length > 0 || filters.layout.length > 0;

  return (
    <aside
      className="w-full lg:w-72 shrink-0 bg-amazon-bgSecondary text-amazon-text"
      role="complementary"
      aria-label="Product filters"
    >
      {/* Promo Box */}
      <div className="bg-amazon-bgSecondary border border-amazon-border p-5 mb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amazon-textMuted mb-1">
          {t("promoExclusive")}
        </p>
        <p className="text-sm font-bold uppercase tracking-wide text-amazon-text mb-1">
          {t("promoTitle")}
        </p>
        <p className="text-xs text-amazon-textMuted mb-4 leading-relaxed">
          {t("promoDesc")}
        </p>
        <Link href="/custom-build" className="text-amazon-link text-[11px] font-bold uppercase tracking-widest hover:text-amazon-focus transition-colors">
          {t("promoCta")}
        </Link>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && onClearAll && (
        <div className="mb-4 pb-4 border-b border-amazon-border">
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 text-xs font-bold text-amazon-link hover:text-amazon-focus uppercase tracking-wider transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
            {t("clearAllFilters")}
          </button>
        </div>
      )}

      {/* Availability Filter */}
      <FilterGroup
        title={t("filterAvailability")}
        selectedValues={filters.availability}
        onChange={handleAvailabilityChange}
        options={availabilityOptions}
      />

      {/* Category Filter */}
      <FilterGroup
        title={t("filterProductType")}
        selectedValues={filters.categories}
        onChange={handleCategoryChange}
        options={categoryOptions}
      />

      {/* Layout Filter */}
      {layoutOptions.length > 0 && (
        <FilterGroup
          title={t("filterLayout")}
          selectedValues={filters.layout}
          onChange={handleLayoutChange}
          options={layoutOptions}
        />
      )}
    </aside>
  );
};
