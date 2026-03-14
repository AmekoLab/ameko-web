"use client";

import { FC, useState, useCallback, useMemo, memo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

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
      <div className="border-b border-[#2a2d31] py-5">
        <button
          onClick={toggleOpen}
          className="flex items-center justify-between w-full text-left mb-4 group focus:outline-none"
          aria-expanded={isOpen}
          aria-controls={`filter-${title}`}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-white transition-colors">
            {title}
            {selectedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-black bg-[#f5d800] rounded-none">
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
                      className="peer appearance-none w-4 h-4 border border-[#3a3d42] bg-[#111] rounded-none checked:bg-[#f5d800] checked:border-[#f5d800] transition-all focus:ring-1 focus:ring-[#f5d800] focus:ring-offset-0 disabled:cursor-not-allowed"
                      checked={isChecked}
                      onChange={() => onChange(opt.value)}
                      disabled={isDisabled}
                      aria-label={`Filter by ${opt.label}`}
                    />
                    <svg
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
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
                      isChecked ? "text-white font-medium" : "text-gray-400"
                    } ${!isDisabled && "group-hover/item:text-white"}`}
                  >
                    {opt.label}
                  </span>
                  {opt.count !== undefined && (
                    <span className="ml-auto text-xs text-[#3a3d42]">
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
  };
  onFilterChange: (type: "categories" | "availability", value: string) => void;
  onClearAll?: () => void;
  productCounts?: {
    [key: string]: number;
  };
  /** Dynamic category list derived from actual products */
  categoryList?: string[];
}

export const ShopSidebar: FC<ShopSidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  productCounts = {},
  categoryList = [],
}) => {
  const handleCategoryChange = useCallback(
    (value: string) => onFilterChange("categories", value),
    [onFilterChange],
  );

  const handleAvailabilityChange = useCallback(
    (value: string) => onFilterChange("availability", value),
    [onFilterChange],
  );

  const availabilityOptions = useMemo<FilterOption[]>(
    () => [
      {
        label: "In Stock",
        value: AVAILABILITY_STATUS.IN_STOCK,
        count: productCounts[AVAILABILITY_STATUS.IN_STOCK],
      },
      {
        label: "Out of Stock",
        value: AVAILABILITY_STATUS.OUT_OF_STOCK,
        count: productCounts[AVAILABILITY_STATUS.OUT_OF_STOCK],
      },
    ],
    [productCounts],
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

  const hasActiveFilters =
    filters.categories.length > 0 || filters.availability.length > 0;

  return (
    <aside
      className="w-full lg:w-72 shrink-0 bg-black text-white"
      role="complementary"
      aria-label="Product filters"
    >
      {/* Promo Box */}
      <div className="bg-gradient-to-r from-gray-900 to-black border border-[#2a2d31] p-5 mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">
          Exclusive
        </p>
        <p className="text-sm font-black uppercase tracking-wide text-white mb-1">
          AmekoLab Custom Lab
        </p>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Design your own custom keyboard from scratch — your layout, your switches, your way.
        </p>
        <button className="text-[#f5d800] text-[11px] font-black uppercase tracking-widest hover:text-[#ffe500] transition-colors">
          CUSTOMIZE NOW &gt;
        </button>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && onClearAll && (
        <div className="mb-4 pb-4 border-b border-[#2a2d31]">
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 text-xs font-bold text-[#f5d800] hover:text-[#ffe500] uppercase tracking-wider transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        </div>
      )}

      {/* Availability Filter */}
      <FilterGroup
        title="Availability"
        selectedValues={filters.availability}
        onChange={handleAvailabilityChange}
        options={availabilityOptions}
      />

      {/* Category Filter */}
      <FilterGroup
        title="Product Type"
        selectedValues={filters.categories}
        onChange={handleCategoryChange}
        options={categoryOptions}
      />
    </aside>
  );
};
