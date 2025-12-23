"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserProfile, Product } from "@/src/types/profile";
import { Post } from "@/src/types/community";
import { ProfileSidebar } from "./ProfileSidebar";
import FeedClient from "../Community/FeedClient";
import { ProfileService } from "@/src/services/profile.service";
import { ProductCard } from "./ProductCard";
import { Review, ReviewStats as IReviewStats } from "@/src/types/profile";
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
  profile: UserProfile;
  initialPosts: Post[];
}> = ({ profile, initialPosts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as TabType) || "posts";

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingShop, setLoadingShop] = useState(false);
  const [hasFetchedShop, setHasFetchedShop] = useState(false); // Đánh dấu đã fetch chưa để không fetch lại thừa

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<IReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [hasFetchedReviews, setHasFetchedReviews] = useState(false);

  const handleChangeTab = useCallback(
    (tab: TabType) => {
      // Dùng router.replace để đổi URL mà không reload trang (shallow routing)
      // scroll: false để không bị nhảy trang lên đầu
      router.replace(`?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  // Lazy load products
  useEffect(() => {
    // Biến cờ để ngăn chặn Race Condition (khi user bấm chuyển tab liên tục)
    let ignore = false;

    const fetchShopData = async () => {
      // Chỉ fetch nếu tab là shop và chưa từng fetch trước đó
      if (currentTab === "shop" && !hasFetchedShop) {
        setLoadingShop(true);

        try {
          const data = await ProfileService.getShopProducts(profile.id);
          // Chỉ update state nếu component còn mounted và chưa bị hủy
          if (!ignore) {
            setProducts(data);
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

    // Cleanup function: Chạy khi component unmount hoặc dependency thay đổi
    return () => {
      ignore = true;
    };
  }, [currentTab, profile.id, hasFetchedShop]);

  const ProductSkeleton = () => (
    <div className="bg-white rounded-sm border border-gray-100 p-3 space-y-3">
      <div className="bg-gray-200 animate-pulse aspect-square w-full rounded-sm" />
      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
    </div>
  );

  useEffect(() => {
    let ignore = false;
    const fetchReviewsData = async () => {
      if (currentTab === "reviews" && !hasFetchedReviews) {
        setLoadingReviews(true);
        try {
          // Gọi song song cả stats và list review
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

  // Skeleton Reviews
  const ReviewSkeleton = () => (
    <div className="bg-white p-6 rounded-sm border border-gray-100 mb-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/4 h-4 bg-gray-200 rounded" />
          <div className="w-3/4 h-4 bg-gray-200 rounded" />
          <div className="w-full h-16 bg-gray-200 rounded mt-2" />
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
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-6  top-[70px] z-30">
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
                    ? "border-[#ce2a32] text-[#ce2a32]"
                    : "border-transparent text-gray-500 hover:text-black hover:bg-gray-50"
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
          {currentTab === "posts" && <FeedClient initialPosts={initialPosts} />}

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
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-sm border border-dashed border-gray-300">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <PackageOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Chưa có sản phẩm nào đang bán.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentTab === "showcase" && (
            <div className="bg-white p-16 text-center rounded-sm border border-dashed border-gray-300">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                Bộ sưu tập đang được cập nhật...
              </p>
            </div>
          )}

          {currentTab === "reviews" && (
            <div>
              {loadingReviews ? (
                <>
                  <div className="h-32 bg-white mb-6 rounded-sm border border-gray-100 animate-pulse" />{" "}
                  {/* Stats Skeleton */}
                  <ReviewSkeleton />
                  <ReviewSkeleton />
                </>
              ) : reviewStats ? (
                <>
                  {/* 1. Bảng thống kê */}
                  <ReviewStats stats={reviewStats} />

                  {/* 2. Danh sách review */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewItem key={review.id} review={review} />
                    ))}
                  </div>

                  {/* Empty State */}
                  {reviews.length === 0 && (
                    <div className="bg-white p-16 text-center rounded-sm border border-dashed border-gray-300">
                      <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">
                        Chưa có đánh giá nào.
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
