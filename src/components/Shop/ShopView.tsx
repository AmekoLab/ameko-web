"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/src/components/Product/ProductCard";
import { MOCK_PRODUCTS } from "@/src/data/product";
import { ShopSidebar } from "./ShopSidebar";
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

/*
  CONSTANTS
 */
const ITEMS_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 5;
const SCROLL_OFFSET = 100; // Offset from top when scrolling

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

/*
  TYPES
 */
interface Filters {
  categories: string[];
  availability: string[];
}

/*
 HELPER FUNCTIONS
 */

/* Parse URL search params to initial state
 */
const parseSearchParams = (searchParams: URLSearchParams) => {
  return {
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
    availability:
      searchParams.get("availability")?.split(",").filter(Boolean) || [],
    sort: (searchParams.get("sort") as SortOption) || "featured",
    page: parseInt(searchParams.get("page") || "1", 10),
  };
};

/*
 * Build URL search params from state
 */
const buildSearchParams = (
  categories: string[],
  availability: string[],
  sort: SortOption,
  page: number
) => {
  const params = new URLSearchParams();
  if (categories.length > 0) params.set("categories", categories.join(","));
  if (availability.length > 0)
    params.set("availability", availability.join(","));
  if (sort !== "featured") params.set("sort", sort);
  if (page > 1) params.set("page", page.toString());
  return params.toString();
};

/*
  MAIN COMPONENT
 */
export default function ShopView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize state from URL
  const initialState = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialState.categories
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    initialState.availability
  );
  const [sortBy, setSortBy] = useState<SortOption>(initialState.sort);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  /**
   * Sync URL with state
   */
  useEffect(() => {
    const params = buildSearchParams(
      selectedCategories,
      selectedAvailability,
      sortBy,
      currentPage
    );
    const baseUrl = "/shop/all-products";

    const newUrl = params ? `${baseUrl}?${params}` : baseUrl;

    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [selectedCategories, selectedAvailability, sortBy, currentPage, router]);

  /*
    Filter & Sort Products
   */
  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by availability
    if (selectedAvailability.length > 0) {
      result = result.filter((p) => selectedAvailability.includes(p.status));
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        result.sort(
          (a, b) => (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0)
        );
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategories, selectedAvailability, sortBy]);

  /*
    Pagination calculations
   */
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const currentProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredProducts, currentPage]
  );

  /*
    Scroll to top smoothly
   */
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: SCROLL_OFFSET,
      behavior: "smooth",
    });
  }, []);

  /*
   Handle filter changes
   */
  const handleFilterChange = useCallback(
    (type: "categories" | "availability", value: string) => {
      setCurrentPage(1); // Reset to page 1

      if (type === "categories") {
        setSelectedCategories((prev) =>
          prev.includes(value)
            ? prev.filter((c) => c !== value)
            : [...prev, value]
        );
      } else {
        setSelectedAvailability((prev) =>
          prev.includes(value)
            ? prev.filter((a) => a !== value)
            : [...prev, value]
        );
      }
    },
    []
  );

  /*
    Handle sort change
   */
  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  }, []);

  /*
   Handle page change
   */
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      scrollToTop();
    },
    [scrollToTop]
  );

  /*
    Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedAvailability([]);
    setSortBy("featured");
    setCurrentPage(1);
  }, []);

  /*
   Toggle mobile filter
   */
  const toggleMobileFilter = useCallback(() => {
    setIsMobileFilterOpen((prev) => !prev);
  }, []);

  /*
    Render page numbers
   */
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  /*
    Check if filters are active
   */
  const hasActiveFilters =
    selectedCategories.length > 0 || selectedAvailability.length > 0;

  return (
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-12">
      {/* PAGE HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase text-black mb-4 tracking-tight">
          All Products
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg">
          Browse our complete collection of premium mechanical keyboards, custom
          kits, switches, and accessories.
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-gray-200">
        {/* Mobile Filter Button */}
        <button
          onClick={toggleMobileFilter}
          className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm text-sm font-bold uppercase hover:bg-gray-50 transition-colors"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-black text-white text-xs rounded-full">
              {selectedCategories.length + selectedAvailability.length}
            </span>
          )}
        </button>

        {/* Results Count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </span>
          {isPending && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 uppercase font-bold hidden md:inline-block">
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="appearance-none bg-transparent pl-0 pr-8 py-2 text-sm font-bold text-black border-none focus:ring-0 cursor-pointer uppercase tracking-wide"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="newest">Date, new to old</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
            </select>
            <ArrowUpDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* LEFT SIDEBAR */}
        <aside
          className={`
            w-full lg:w-64 shrink-0 transition-all duration-300
            ${isMobileFilterOpen ? "block" : "hidden lg:block"}
          `}
          aria-label="Product filters"
        >
          <ShopSidebar
            filters={{
              categories: selectedCategories,
              availability: selectedAvailability,
            }}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* RIGHT PRODUCT GRID */}
        <main className="flex-1">
          {filteredProducts.length > 0 ? (
            <>
              {/* Product Grid */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 min-h-[600px]"
                role="list"
                aria-label="Products"
              >
                {currentProducts.map((product) => (
                  <div key={product.id} className="h-full" role="listitem">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-gray-100"
                  aria-label="Pagination"
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2" role="list">
                    {pageNumbers.map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`dots-${index}`}
                            className="px-2 text-gray-400"
                            aria-hidden="true"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`
                            min-w-[32px] h-8 flex items-center justify-center text-sm font-medium transition-colors rounded
                            ${
                              currentPage === page
                                ? "text-black border-b-2 border-black"
                                : "text-gray-500 hover:text-black hover:bg-gray-100"
                            }
                          `}
                          aria-label={`Page ${page}`}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </>
          ) : (
            // Empty State
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-sm bg-gray-50">
              <div className="max-w-md mx-auto">
                <p className="text-gray-500 font-medium mb-2">
                  No products match your filters.
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Try adjusting your filters or clearing them to see all
                  products.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-black text-white text-sm font-bold uppercase hover:bg-gray-800 transition-colors rounded"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
