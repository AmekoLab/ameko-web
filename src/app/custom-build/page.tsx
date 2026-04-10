"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/index";
import { shopService } from "@/src/services/shopService";
import { ShopItem, ShopListParams } from "@/src/types/shop.types";
import { Search, Star, Users, Store, Keyboard, Settings } from "lucide-react";

// ─── Constants ────────────────────────────────────────────
const DEBOUNCE_MS = 500;

// ─── Skeleton Card ────────────────────────────────────────
function ShopCardSkeleton() {
  return (
    <div className="rounded-sm overflow-hidden border border-amazon-border bg-white animate-pulse shadow-sm">
      <div className="h-[130px] bg-neutral-100" />
      <div className="relative px-5 pb-5 pt-10">
        <div className="absolute -top-8 left-5 w-16 h-16 rounded-full bg-neutral-100 border-4 border-white shadow-sm" />
        <div className="h-4 w-2/3 bg-neutral-200 rounded-sm mb-2" />
        <div className="h-3 w-full bg-neutral-100 rounded-sm mb-1" />
        <div className="h-3 w-1/2 bg-neutral-100 rounded-sm mb-4" />
        <div className="flex gap-4 mb-4">
          <div className="h-3 w-16 bg-neutral-200 rounded-sm" />
          <div className="h-3 w-16 bg-neutral-200 rounded-sm" />
        </div>
        <div className="h-10 w-full bg-neutral-200 rounded-sm" />
      </div>
    </div>
  );
}

// ─── Shop Card ────────────────────────────────────────────
function ShopCard({ shop, isMyShop }: { shop: ShopItem; isMyShop: boolean }) {
  const initial = shop.shopName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="group rounded-sm overflow-hidden border border-amazon-border bg-white transition-all duration-300 hover:border-amazon-focus hover:shadow-lg flex flex-col">
      {/* Banner */}
      <div className="relative h-[130px] overflow-hidden bg-gradient-to-br from-neutral-200 to-neutral-300">
        {shop.bannerUrl ? (
          <Image
            src={shop.bannerUrl}
            alt={`${shop.shopName} banner`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Avatar */}
      <div className="relative px-5 pb-5 pt-10 flex-1 flex flex-col">
        <div className="absolute -top-8 left-5">
          <div className="w-16 h-16 rounded-full border-[3px] border-white overflow-hidden shadow-sm bg-neutral-100 flex items-center justify-center">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt={shop.shopName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-black text-amazon-textMuted select-none">
                {initial}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-base font-black text-amazon-text uppercase tracking-wide truncate mb-1 group-hover:text-amazon-link transition-colors">
          {shop.shopName}
        </h3>

        <p className="text-[11px] text-amazon-textMuted leading-relaxed line-clamp-2 mb-4 min-h-[32px] font-bold">
          {shop.bio || "Premium keyboard shop on Ameko"}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amazon-text">
              {shop.rating > 0 ? shop.rating.toFixed(1) : "New"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amazon-textMuted" />
            <span className="text-xs font-bold text-amazon-textMuted">
              {shop.followersCount.toLocaleString()}
            </span>
          </div>
          {shop.totalSales > 0 && (
            <div className="flex items-center gap-1.5">
              <Store className="w-3 h-3 text-amazon-textMuted" />
              <span className="text-xs font-bold text-amazon-textMuted">
                {shop.totalSales.toLocaleString()} sold
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        {isMyShop ? (
          <Link
            href="/shop/profile"
            className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amazon-btnSecondary text-amazon-text text-[11px] font-black uppercase tracking-widest rounded-sm transition-all duration-200 hover:brightness-95 shadow-sm border border-amazon-border active:scale-[0.97]"
          >
            <Settings className="w-4 h-4" />
            Manage Your Shop
          </Link>
        ) : (
          <Link
            href={`/builder?shopId=${shop.id}`}
            className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amazon-btnPrimary text-amazon-text text-[11px] font-black uppercase tracking-widest rounded-sm transition-all duration-200 hover:brightness-95 shadow-sm border border-amazon-btnPrimary active:scale-[0.97]"
          >
            <Keyboard className="w-4 h-4" />
            Customize with this Shop
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function CustomBuildPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // ── State ───────────────────────────────────────────────
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  const [queryParams, setQueryParams] = useState<ShopListParams>({
    page: 1,
    size: 12,
    searchTerm: "",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounced search ────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQueryParams((prev) => ({
        ...prev,
        searchTerm: searchInput.trim() || undefined,
        page: 1,
      }));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  // ── Fetch shops ─────────────────────────────────────────
  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await shopService.getShops(queryParams);
      if (res.success && res.data) {
        setShops(res.data.items);
        setTotalCount(res.data.pagination.totalCount);
      }
    } catch {
      // silently fail — empty state will show
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // ── Pagination ──────────────────────────────────────────
  const currentPage = queryParams.page || 1;
  const pageSize = queryParams.size || 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amazon-bgSecondary text-amazon-text">
      {/* ── Hero Section ─────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-amazon-border">
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amazon-bgSecondary" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          {/* Title */}
          <div className="text-center mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amazon-textMuted mb-3">
              Ameko Custom Lab
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-oswald text-amazon-text uppercase tracking-tight mb-4">
              Choose Your Shop
            </h1>
            <p className="text-amazon-textMuted text-sm font-bold sm:text-base max-w-lg mx-auto leading-relaxed">
              Select a shop to start building your dream custom keyboard.
              Each shop offers unique kits and parts.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amazon-textMuted transition-colors group-focus-within:text-amazon-link" />
              <input
                id="shop-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search shops by name..."
                className="w-full pl-12 pr-4 py-3.5 rounded-sm bg-white border border-amazon-border shadow-sm text-[13px] font-bold text-amazon-text placeholder:text-amazon-textMuted placeholder:font-bold outline-none transition-all duration-200 focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus/30"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted hover:text-amazon-link transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-center mt-3 text-[10px] font-bold uppercase tracking-widest text-amazon-textMuted">
              {totalCount} shop{totalCount !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      </div>

      {/* ── Shop Grid ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <ShopCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : shops.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 border border-amazon-border flex items-center justify-center mb-6">
              <Store className="w-8 h-8 text-amazon-textMuted" />
            </div>
            <h3 className="text-lg font-black text-amazon-text uppercase tracking-wide mb-2">
              No shops found
            </h3>
            <p className="text-sm text-amazon-textMuted max-w-sm leading-relaxed font-bold">
              {searchInput
                ? `No shops matching "${searchInput}". Try a different search term.`
                : "There are no shops available at the moment."}
            </p>
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="mt-5 px-5 py-2 bg-amazon-btnPrimary text-amazon-text text-xs font-black uppercase tracking-widest rounded-sm shadow-sm hover:brightness-95 transition-all active:scale-[0.97]"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => {
                const isMyShop = isAuthenticated && user?.id === shop.userId;
                return <ShopCard key={shop.id} shop={shop} isMyShop={isMyShop} />;
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-sm border border-amazon-border bg-white text-xs font-black uppercase tracking-widest text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ‹ Prev
                </button>

                {(() => {
                  const maxVisible = 5;
                  let start = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2),
                  );
                  const end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  return Array.from(
                    { length: end - start + 1 },
                    (_, i) => start + i,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all ${
                        page === currentPage
                          ? "bg-amazon-btnPrimary text-amazon-text shadow-sm"
                          : "border border-amazon-border bg-white text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 shadow-sm"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-sm border border-amazon-border bg-white text-xs font-black uppercase tracking-widest text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
