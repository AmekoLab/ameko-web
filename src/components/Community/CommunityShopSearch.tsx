"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Store, Loader2, ShieldCheck, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { shopService } from "@/src/services/shopService"; 
import { ShopItem } from "@/src/types/shop.types";
import { useTranslations } from "next-intl";

export const CommunityShopSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("CommunitySidebar");

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce API call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsLoading(true);
        try {
          // Use getShops instead of searchShops
          const res = await shopService.getShops({ 
            searchTerm, 
            page: 1, 
            size: 5 
          }); 
          
          // Safely extract the items based on the ShopListResponse structure
          // Safely extract the items based on the ShopListResponse structure
          const responseData = (res as any).data || (res as any); 
          const items = responseData?.data?.items || responseData?.items || [];          
          setResults(items);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div ref={wrapperRef} className="relative w-full mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm shop..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border-transparent focus:bg-white focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus rounded-full text-sm outline-none transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-md shadow-lg overflow-hidden z-50">
          {results.map((shop) => (
            <Link 
              href={`/profile/shop/${shop.id}`} 
              key={shop.id}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {shop.logoUrl ? (
                  <Image src={shop.logoUrl} alt={shop.shopName} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <Store className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-neutral-900 truncate">{shop.shopName}</p>
                  {shop.badge === 1 && (
                    <span title="Verified" className="shrink-0 flex">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    </span>
                  )}
                  {shop.badge === 2 && (
                    <span title="Premium" className="shrink-0 flex">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    ⭐ {shop.rating > 0 ? shop.rating.toFixed(1) : "Mới"} ({shop.totalReviews || 0})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> {shop.qualityScore || 0}/100
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
