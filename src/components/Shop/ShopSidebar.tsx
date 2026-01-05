"use client";

import { FC, useState, useCallback, useMemo, memo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

// Constants
const AVAILABILITY_STATUS = {
  IN_STOCK: "IN_STOCK",
  PRE_ORDER: "PRE_ORDER",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

const PRODUCT_CATEGORIES = {
  CUSTOM_KITS: "Custom Kits",
  KEYBOARDS: "Keyboards",
  MICE: "Mice",
  AUDIO: "Audio",
  KEYCAPS: "Keycaps",
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
      <div className="border-b border-gray-200 py-6">
        <button
          onClick={toggleOpen}
          className="flex items-center justify-between w-full text-left mb-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ce2a32] focus-visible:ring-offset-2 rounded"
          aria-expanded={isOpen}
          aria-controls={`filter-${title}`}
        >
          <span className="font-bold text-sm uppercase tracking-widest text-gray-900 group-hover:text-[#ce2a32] transition-colors">
            {title}
            {selectedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#ce2a32] rounded-full">
                {selectedCount}
              </span>
            )}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform" />
          )}
        </button>

        {isOpen && (
          <div
            id={`filter-${title}`}
            className="space-y-3 animate-fadeIn"
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
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border border-gray-300 rounded-sm checked:bg-[#ce2a32] checked:border-[#ce2a32] transition-all focus:ring-2 focus:ring-[#ce2a32] focus:ring-offset-1 disabled:cursor-not-allowed"
                      checked={isChecked}
                      onChange={() => onChange(opt.value)}
                      disabled={isDisabled}
                      aria-label={`Filter by ${opt.label}`}
                    />
                    <svg
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
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
                      isChecked ? "text-black font-medium" : "text-gray-600"
                    } ${!isDisabled && "group-hover/item:text-black"}`}
                  >
                    {opt.label}
                  </span>
                  {opt.count !== undefined && (
                    <span className="ml-auto text-xs text-gray-400">
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
  }
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
}

export const ShopSidebar: FC<ShopSidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  productCounts = {},
}) => {
  // Memoized callbacks
  const handleCategoryChange = useCallback(
    (value: string) => onFilterChange("categories", value),
    [onFilterChange]
  );

  const handleAvailabilityChange = useCallback(
    (value: string) => onFilterChange("availability", value),
    [onFilterChange]
  );

  // Memoized options with counts
  const availabilityOptions = useMemo<FilterOption[]>(
    () => [
      {
        label: "In Stock",
        value: AVAILABILITY_STATUS.IN_STOCK,
        count: productCounts[AVAILABILITY_STATUS.IN_STOCK],
      },
      {
        label: "Pre Order",
        value: AVAILABILITY_STATUS.PRE_ORDER,
        count: productCounts[AVAILABILITY_STATUS.PRE_ORDER],
      },
      {
        label: "Out of Stock",
        value: AVAILABILITY_STATUS.OUT_OF_STOCK,
        count: productCounts[AVAILABILITY_STATUS.OUT_OF_STOCK],
      },
    ],
    [productCounts]
  );

  const categoryOptions = useMemo<FilterOption[]>(
    () => [
      {
        label: "Custom Kits",
        value: PRODUCT_CATEGORIES.CUSTOM_KITS,
        count: productCounts[PRODUCT_CATEGORIES.CUSTOM_KITS],
      },
      {
        label: "Keyboards",
        value: PRODUCT_CATEGORIES.KEYBOARDS,
        count: productCounts[PRODUCT_CATEGORIES.KEYBOARDS],
      },
      {
        label: "Mice",
        value: PRODUCT_CATEGORIES.MICE,
        count: productCounts[PRODUCT_CATEGORIES.MICE],
      },
      {
        label: "Audio",
        value: PRODUCT_CATEGORIES.AUDIO,
        count: productCounts[PRODUCT_CATEGORIES.AUDIO],
      },
      {
        label: "Keycaps",
        value: PRODUCT_CATEGORIES.KEYCAPS,
        count: productCounts[PRODUCT_CATEGORIES.KEYCAPS],
      },
    ],
    [productCounts]
  );

  // Check if any filters are active
  const hasActiveFilters =
    filters.categories.length > 0 || filters.availability.length > 0;

  return (
    <aside
      className="w-full pr-0 md:pr-8"
      role="complementary"
      aria-label="Product filters"
    >
      {/* Clear All Button */}
      {hasActiveFilters && onClearAll && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 text-sm font-medium text-[#ce2a32] hover:text-[#a82229] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ce2a32] focus-visible:ring-offset-2 rounded px-2 py-1"
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4" />
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

// CSS for animations (add to your global CSS)
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(-4px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
