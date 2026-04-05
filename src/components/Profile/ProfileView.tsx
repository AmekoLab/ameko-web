"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/src/types/profile";
import { ShopPublicProfile } from "@/src/types/shop.types";
import { Post } from "@/src/types/social.types";
import { ProfileSidebar } from "./ProfileSidebar";
import FeedClient from "../Community/FeedClient";
import { ProfileService } from "@/src/services/profile.service";
import { assembledProductService } from "@/src/services/assembledProduct.service";
import { ProductCard } from "./ProductCard";
import { Review, ReviewStats as IReviewStats } from "@/src/types/profile";
import { AssembledProductItem } from "@/src/types/assembledProduct.types";
import {
  List,
  Image as ImageIcon,
  Star,
  ShoppingBag,
  PackageOpen,
} from "lucide-react";
import clsx from "clsx";
import { ReviewStats } from "../Review/ReviewStats";
import { ReviewItem } from "../Review/ReviewItem";

type TabType = "posts" | "shop" | "showcase" | "reviews";

export const ProfileView: FC<{
  profile: ShopPublicProfile;
  initialPosts: Post[];
}> = ({ profile, initialPosts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as TabType) || "posts";

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingShop, setLoadingShop] = useState(false);
  const [hasFetchedShop, setHasFetchedShop] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<IReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);

  const handleChangeTab = useCallback(
    (tab: TabType) => {
      router.replace(`?tab=${tab}`, { scroll: false });
    },
    [router],
  );

  // Lazy load products
  useEffect(() => {
    let ignore = false;

    const fetchShopData = async () => {
      if (currentTab === "shop" && !hasFetchedShop) {
        setLoadingShop(true);

        try {
          const res = await assembledProductService.getAssembledProductsByShop(
            profile.id,
          );
          const items: AssembledProductItem[] = Array.isArray(res.data)
            ? res.data
            : [];
          const mapped = items.map((item) => ({
            id: item.id,
            name: item.name || "Untitled Product",
            price: item.price
              ? `${item.price.toLocaleString("vi-VN")}₫`
              : "Contact",
            image: item.image1 || item.image2 || item.image3 || "",
            category: item.layout || "Keyboard",
            status: (item.quantity != null && item.quantity > 0
              ? "In Stock"
              : "Sold Out") as Product["status"],
          }));

          if (!ignore) {
            setProducts(mapped);
            setHasFetchedShop(true);
          }
        } catch (error) {
          console.error("Failed to load shop products", error);
        } finally {
          if (!ignore) setLoadingShop(false);
        }
      }
    };

    fetchShopData();

    return () => {
      ignore = true;
    };
  }, [currentTab, profile.id, hasFetchedShop]);

  const ProductSkeleton = () => (
    <div className="bg-[#151515] rounded-sm border border-[#1e2126] p-3 space-y-3">
      <div className="bg-[#202030] animate-pulse aspect-square w-full rounded-sm" />
      <div className="h-4 bg-[#202030] animate-pulse rounded w-3/4" />
      <div className="h-4 bg-[#202030] animate-pulse rounded w-1/2" />
    </div>
  );

  useEffect(() => {
    let ignore = false;
    const fetchReviewsData = async () => {
      if (currentTab === "reviews" && !hasFetchedReviews) {
        setLoadingReviews(true);
        try {
          const [statsData, listData] = await Promise.all([
            ProfileService.getReviewStats(profile.id),
            ProfileService.getReviews(profile.id),
          ]);

          if (!ignore) {
            setReviewStats(statsData);
            setReviews(listData);
            setHasFetchedReviews(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (!ignore) setLoadingReviews(false);
        }
      }
    };
    fetchReviewsData();
    return () => {
      ignore = true;
    };
  }, [currentTab, profile.id, hasFetchedReviews]);

  const ReviewSkeleton = () => (
    <div className="bg-[#151515] p-6 rounded-sm border border-[#1e2126] mb-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-[#202030] rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/4 h-4 bg-[#202030] rounded" />
          <div className="w-3/4 h-4 bg-[#202030] rounded" />
          <div className="w-full h-16 bg-[#202030] rounded mt-2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* SIDEBAR */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div className="sticky top-28">
          <ProfileSidebar profile={profile} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="lg:col-span-8 xl:col-span-9">
        {/* TABS NAVIGATION */}
        <div className="bg-[#151515] rounded-sm shadow-sm border border-[#1e2126] mb-6  top-[70px] z-30">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { id: "posts", label: "Posts", icon: List },
              { id: "shop", label: "Shop", icon: ShoppingBag },
              { id: "showcase", label: "Showcase", icon: ImageIcon },
              { id: "reviews", label: "Reviews", icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleChangeTab(tab.id as TabType)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors outline-none",
                  currentTab === tab.id
                    ? "border-[#f5d800] text-[#f5d800]"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-[#202030]",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="min-h-[500px]">
          {currentTab === "posts" && (
            <FeedClient initialPosts={initialPosts} userId={profile.userId} />
          )}

          {currentTab === "shop" && (
            <div>
              {loadingShop ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-[#151515] rounded-sm border border-dashed border-white/10">
                  <div className="bg-[#202030] p-4 rounded-full mb-3">
                    <PackageOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 font-medium">
                    No products found.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentTab === "showcase" && (
            <div className="bg-[#151515] p-16 text-center rounded-sm border border-dashed border-white/10">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                Showcase is being updated...
              </p>
            </div>
          )}

          {currentTab === "reviews" && (
            <div>
              {loadingReviews ? (
                <>
                  <div className="h-32 bg-[#151515] mb-6 rounded-sm border border-[#1e2126] animate-pulse" />{" "}
                  <ReviewSkeleton />
                  <ReviewSkeleton />
                </>
              ) : reviewStats ? (
                <>
                  <ReviewStats stats={reviewStats} />
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewItem key={review.id} review={review} />
                    ))}
                  </div>
                  {reviews.length === 0 && (
                    <div className="bg-[#151515] p-16 text-center rounded-sm border border-dashed border-white/10">
                      <Star className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">
                        No reviews yet.
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
