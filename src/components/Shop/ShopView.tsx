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
import { ShopSidebar } from "./ShopSidebar";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { assembledProductService } from "@/src/services/assembledProduct.service";
import type { AssembledProductItem } from "@/src/types/assembledProduct.types";
import type { Product, ProductSpecs } from "@/src/types/product";

/*
  CONSTANTS
 */
const ITEMS_PER_PAGE = 12;
const SCROLL_OFFSET = 100;

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

/*
 HELPER FUNCTIONS
 */
const parseSearchParams = (searchParams: URLSearchParams) => {
  return {
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
    availability:
      searchParams.get("availability")?.split(",").filter(Boolean) || [],
    layout:
      searchParams.get("layout")?.split(",").filter(Boolean) || [],
    sort: (searchParams.get("sort") as SortOption) || "featured",
    page: parseInt(searchParams.get("page") || "1", 10),
  };
};

const buildSearchParams = (
  categories: string[],
  availability: string[],
  layout: string[],
  sort: SortOption,
  page: number,
) => {
  const params = new URLSearchParams();
  if (categories.length > 0) params.set("categories", categories.join(","));
  if (availability.length > 0)
    params.set("availability", availability.join(","));
  if (layout.length > 0) params.set("layout", layout.join(","));
  if (sort !== "featured") params.set("sort", sort);
  if (page > 1) params.set("page", page.toString());
  return params.toString();
};

/**
 * Map AssembledProductItem from API → Product type for reuse in ProductCard
 */
function mapToProduct(ap: AssembledProductItem): Product {
  const images = [ap.image1, ap.image2, ap.image3].filter(
    (img): img is string => Boolean(img),
  );

  const specs: ProductSpecs = {
    layout: ap.layout || "N/A",
    mounting: ap.mounting || "N/A",
    pcb: ap.pcb || "N/A",
    connection: ap.connection || "N/A",
    battery: ap.battery || undefined,
  };

  return {
    id: ap.id,
    slug: ap.id,
    name: ap.name,
    basePrice: ap.price,
    category: "Assembled Keyboard",
    status: (ap.quantity ?? 0) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    rating: 0,
    reviewsCount: 0,
    shortDesc: ap.description || "Custom assembled mechanical keyboard.",
    description: ap.description || undefined,
    features: [
      ap.layout ? `Layout: ${ap.layout}` : "",
      ap.mounting ? `Mounting: ${ap.mounting}` : "",
      ap.connection ? `Connection: ${ap.connection}` : "",
    ].filter(Boolean),
    images: images.length > 0 ? images : ["/placeholder.png"],
    model3dId: ap.id,
    specs,
    stockQuantity: ap.quantity ?? 0,
  };
}

/* Category showcase data */
// const CATEGORY_CARDS = [
//   { title: "Assembled Keyboards", sub: "75% · TKL · Full-Size" },
//   { title: "Custom Kits", sub: "Barebone builds" },
//   { title: "Switches", sub: "Linear · Tactile · Clicky" },
//   { title: "Keycaps", sub: "PBT · Doubleshot · Dye-sub" },
//   { title: "Accessories", sub: "Cables · Deskmats · Lubes" },
// ];

/*
  MAIN COMPONENT
 */
export default function ShopView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // API data
  const [apiProducts, setApiProducts] = useState<AssembledProductItem[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  // "Load More" page counter (replaces numbered pagination)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Fetch assembled products from API
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setApiLoading(true);
      try {
        const response = await assembledProductService.getAssembledProducts(
          1,
          50,
        );
        if (!cancelled) {
          setApiProducts(response.data?.items ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch assembled products:", err);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    };
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Map API items to Product type
  const allProducts = useMemo(
    () => apiProducts.map(mapToProduct),
    [apiProducts],
  );

  // Compute dynamic category list & product counts from actual data
  const categoryList = useMemo(
    () => [...new Set(allProducts.map((p) => p.category))],
    [allProducts],
  );

  // Compute dynamic layout list from actual product specs
  const layoutList = useMemo(
    () =>
      [
        ...new Set(
          allProducts
            .map((p) => p.specs?.layout)
            .filter((l): l is string => Boolean(l) && l !== "N/A"),
        ),
      ],
    [allProducts],
  );

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      counts[p.status] = (counts[p.status] || 0) + 1;
      // Layout counts (prefixed to avoid collision)
      const layout = p.specs?.layout;
      if (layout && layout !== "N/A") {
        counts[`layout:${layout}`] = (counts[`layout:${layout}`] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  // Initialize state from URL
  const initialState = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams],
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialState.categories,
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    initialState.availability,
  );
  const [selectedLayout, setSelectedLayout] = useState<string[]>(
    initialState.layout,
  );
  const [sortBy, setSortBy] = useState<SortOption>(initialState.sort);
  const [currentPage] = useState(initialState.page);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  /**
   * Sync URL with state
   */
  useEffect(() => {
    const params = buildSearchParams(
      selectedCategories,
      selectedAvailability,
      selectedLayout,
      sortBy,
      currentPage,
    );
    const baseUrl = "/shop/all-products";
    const newUrl = params ? `${baseUrl}?${params}` : baseUrl;
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  }, [selectedCategories, selectedAvailability, selectedLayout, sortBy, currentPage, router]);

  /*
    Filter & Sort Products
   */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }
    if (selectedAvailability.length > 0) {
      result = result.filter((p) => selectedAvailability.includes(p.status));
    }
    if (selectedLayout.length > 0) {
      result = result.filter(
        (p) => p.specs?.layout && selectedLayout.includes(p.specs.layout),
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        result.sort(
          (a, b) => (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0),
        );
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, selectedCategories, selectedAvailability, selectedLayout, sortBy]);

  // Products currently shown (load-more pattern)
  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  const hasMore = visibleCount < filteredProducts.length;

  /*
    Handlers
   */
  const handleFilterChange = useCallback(
    (type: "categories" | "availability" | "layout", value: string) => {
      setVisibleCount(ITEMS_PER_PAGE); // reset on filter change

      if (type === "categories") {
        setSelectedCategories((prev) =>
          prev.includes(value)
            ? prev.filter((c) => c !== value)
            : [...prev, value],
        );
      } else if (type === "availability") {
        setSelectedAvailability((prev) =>
          prev.includes(value)
            ? prev.filter((a) => a !== value)
            : [...prev, value],
        );
      } else {
        setSelectedLayout((prev) =>
          prev.includes(value)
            ? prev.filter((l) => l !== value)
            : [...prev, value],
        );
      }
    },
    [],
  );

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedAvailability([]);
    setSelectedLayout([]);
    setSortBy("featured");
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const toggleMobileFilter = useCallback(() => {
    setIsMobileFilterOpen((prev) => !prev);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    window.scrollTo({ top: window.scrollY + 300, behavior: "smooth" });
  }, []);

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedAvailability.length > 0 || selectedLayout.length > 0;

  return (
    <div className="w-full bg-black text-white min-h-screen">

      {/* ============================================================
          1A. HERO BANNER
      ============================================================ */}
      <div className="relative w-full bg-[#111111] overflow-hidden flex items-center justify-center py-20 md:py-32 border-b border-[#2a2d31]">
        {/* Grid SVG background */}
      <div
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/doezwafgz/image/upload/v1773335563/cherryblossom_ql7b5v.png')",
            backgroundSize: "cover", // Kéo giãn ảnh lấp đầy toàn màn hình
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
        {/* Left decorative image (hidden on mobile) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/4 hidden md:block pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, #111111 100%)",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/doezwafgz/image/upload/v1773335563/cherryblossom_ql7b5v.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.18,
              filter: "drop-shadow(0 0 60px rgba(0,0,0,0.9))",
            }}
          />
        </div>

        {/* Right decorative image (hidden on mobile) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/4 hidden md:block pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, transparent 0%, #111111 100%)",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/doezwafgz/image/upload/v1773335563/cherryblossom_ql7b5v.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.18,
              filter: "drop-shadow(0 0 60px rgba(0,0,0,0.9)) scaleX(-1)",
            }}
          />
        </div>

        {/* Center Text */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="text-[#f5d800] text-[11px] font-black uppercase tracking-[0.35em] mb-5">
            Keyboards Without Compromise
          </p>
          <h1
            className="text-5xl md:text-7xl  uppercase text-white tracking-[0.08em] leading-tight mb-6"
           
          >
            Gaming Keyboards
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Precision-crafted mechanical keyboards built for performance, comfort,
            and style. Find your perfect match.
          </p>
        </div>
      </div>

      {/* ============================================================
          1B. CATEGORY SHOWCASE (horizontal scroll)
      ============================================================ */}
      {/* <div
        className="flex gap-4 overflow-x-auto px-6 py-8 max-w-[1800px] mx-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {CATEGORY_CARDS.map((cat) => (
          <div
            key={cat.title}
            className="bg-[#1a1a1a] min-w-[220px] md:min-w-[280px] aspect-[4/3] p-6 flex flex-col items-center justify-between cursor-pointer border border-transparent hover:bg-[#222] hover:border-[#3a3d42] transition-all duration-200 shrink-0 rounded-none"
          >
            {/* Placeholder keyboard shape */}
            {/* <div className="w-full flex-1 flex items-center justify-center mb-4">
              <div className="w-20 h-10 rounded-sm bg-[#2a2d31] opacity-60" />
            </div>
            <div className="w-full text-center">
              <p className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                {cat.title}
              </p>
              <p className="text-gray-500 text-[11px] mb-3">{cat.sub}</p>
              <span className="text-[#f5d800] text-[11px] font-black uppercase tracking-widest hover:text-[#ffe500] transition-colors">
                SHOP NOW &gt;
              </span>
            </div>
          </div>
        ))} */}
      {/* </div> */}

      {/* ============================================================
          1C. MAIN GRID
      ============================================================ */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-12">

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-[#2a2d31]">
          {/* Mobile Filter Button */}
          <button
            onClick={toggleMobileFilter}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-[#2a2d31] text-sm font-bold uppercase text-white hover:border-[#f5d800] hover:text-[#f5d800] transition-colors"
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#f5d800] text-black text-xs font-black rounded-none">
                {selectedCategories.length + selectedAvailability.length}
              </span>
            )}
          </button>

          {/* Results Count */}
          {/* <div className="flex items-center gap-2 ml-auto p-10">
            <span className="text-sm font-medium text-gray-500">
              Showing{" "}
              <span className="text-white font-bold">
                {Math.min(visibleCount, filteredProducts.length)}
              </span>{" "}
              of{" "}
              <span className="text-white font-bold">
                {filteredProducts.length}
              </span>{" "}
              product{filteredProducts.length !== 1 ? "s" : ""}
            </span>
            {isPending && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            )}
          </div> */}

          {/* Sort Dropdown */}
          {/* <div className="flex items-center gap-2 ml-auto p-4">
            <span className="text-[11px] text-gray-500 uppercase font-black tracking-[0.2em] hidden md:inline-block">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="appearance-none bg-transparent pl-0 pr-8 py-2 text-sm font-bold text-white border-none focus:ring-0 cursor-pointer uppercase tracking-wide"
                aria-label="Sort products"
                style={{ colorScheme: "dark" }}
              >
                <option value="featured" className="bg-[#111] text-white">Featured</option>
                <option value="newest" className="bg-[#111] text-white">Date, new to old</option>
                <option value="price-asc" className="bg-[#111] text-white">Price, low to high</option>
                <option value="price-desc" className="bg-[#111] text-white">Price, high to low</option>
              </select>
              <ArrowUpDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div> */}
        </div>

        <div className="flex flex-col lg:flex-row gap-10 relative">
          {/* LEFT SIDEBAR */}
          <aside
            className={`
              lg:w-72 shrink-0 transition-all duration-300
              ${isMobileFilterOpen ? "block" : "hidden lg:block"}
            `}
            aria-label="Product filters"
          >
            <ShopSidebar
              filters={{
                categories: selectedCategories,
                availability: selectedAvailability,
                layout: selectedLayout,
              }}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearFilters}
              productCounts={productCounts}
              categoryList={categoryList}
              layoutList={layoutList}
            />
          </aside>

          {/* RIGHT PRODUCT GRID */}
          <main className="flex-1">
            {apiLoading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-10 min-h-[600px] animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col h-full bg-[#1a1d21]">
                    <div className="h-[280px] bg-[#22262c]" />
                    <div className="px-4 py-4 space-y-3">
                      <div className="h-4 w-full bg-[#22262c] rounded-none" />
                      <div className="h-5 w-24 bg-[#22262c] rounded-none" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                  {/* Product Grid */}
                  <div className="flex items-center gap-2 ml-auto p-4 justify-end">
            <span className="text-[11px] text-gray-500 uppercase font-black tracking-[0.2em] hidden md:inline-block">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="appearance-none bg-transparent pl-0 pr-8 py-2 text-sm font-bold text-white border-none focus:ring-0 cursor-pointer uppercase tracking-wide"
                aria-label="Sort products"
                style={{ colorScheme: "dark" }}
              >
                <option value="featured" className="bg-[#111] text-white">Featured</option>
                <option value="newest" className="bg-[#111] text-white">Date, new to old</option>
                <option value="price-asc" className="bg-[#111] text-white">Price, low to high</option>
                <option value="price-desc" className="bg-[#111] text-white">Price, high to low</option>
              </select>
              <ArrowUpDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-10 min-h-[600px]"
                  role="list"
                  aria-label="Products"
                >
                  {displayedProducts.map((product) => (
                    <div key={product.id} className="h-full" role="listitem">
                      <ProductCard
                        product={product}
                        href={`/shop/assembled-product/${product.id}`}
                      />
                    </div>
                  ))}
                  </div>
                  

                {/* LOAD MORE BUTTON */}
                {hasMore && (
                  <div className="flex justify-center mt-16 mb-24">
                    <button
                      onClick={handleLoadMore}
                      className="bg-[#f5d800] text-black font-black uppercase text-sm tracking-[0.12em] px-12 py-4 hover:bg-[#ffe500] transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Empty State
              <div className="py-20 text-center border border-dashed border-[#2a2d31]">
                <div className="max-w-md mx-auto">
                  <p className="text-gray-400 font-medium mb-2">
                    No products match your filters.
                  </p>
                  <p className="text-gray-600 text-sm mb-6">
                    Try adjusting your filters or clearing them to see all products.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-[#f5d800] text-black text-sm font-black uppercase tracking-widest hover:bg-[#ffe500] transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================
          SEO BLOCK
      ============================================================ */}
      <div className="w-full bg-[#0a0a0a] border-t border-[#2a2d31] py-24 text-gray-300">
  <div className="max-w-[1200px] mx-auto px-6 md:px-12">
    {/* Chuyển sang grid 2 cột trên màn hình vừa trở lên */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
      
      {/* Khối 1: Trải dài cả 2 cột (giống phần "Gaming Keyboards" trong ảnh) */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold text-white mb-4">
          About Our Keyboards
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          Every keyboard sold by AmekoLab is hand-assembled by our expert
          team using premium components sourced from trusted manufacturers.
          We specialize in custom mechanical keyboards for gamers,
          developers, and enthusiasts who demand precision.
        </p>
      </div>

      {/* Khối 2: Nằm ở cột trái */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Customization
        </h2>
        <p className="text-sm leading-relaxed">
          Can&apos;t find exactly what you&apos;re looking for? Use our
          Custom Lab to spec out your dream keyboard — choose your layout,
          switch, keycap set, and more. We build it, test it, and ship it
          directly to you.
        </p>
      </div>

      {/* Khối 3: Nằm ở cột phải */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Warranty & Support
        </h2>
        <p className="text-sm leading-relaxed">
          All keyboards come with a 1-year warranty covering manufacturing
          defects. Our support team is available 7 days a week to help
          with setup, troubleshooting, and any questions you might have.
        </p>
      </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">  What to look for in a gaming keyboard </h2>
              <p>Gaming keyboards come in all shapes, sizes, and feels, so when you’re considering yours, you’ll want to compare:</ p>
              <ul>
                <li>Switches and typing feel: Rubber dome, mechanical, or optical</li>
                <li>Size and layout: Full-sized, TKL, 60%, and more</li>
                <li>Design: Lots of RGB or artistic keycaps</li>
                <li>  Connectivity: Wired or wireless</li>
                <li>Extra features: Macro keys, media controls, wrist rest</li>
                <li>Price: From budget-friendly to premium custom builds</li> 
              </ul>
            </div>

    </div>
  </div>

      </div>
    </div>
  );
}
