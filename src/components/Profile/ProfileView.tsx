"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
import ShopFeedbackList from "../Shop/Profile/ShopFeedbackList";

type TabType = "posts" | "shop" | "feedback";

export const ProfileView: FC<{
  profile: ShopPublicProfile;
  initialPosts: Post[];
}> = ({ profile, initialPosts }) => {
  const t = useTranslations("ProfileView");
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as TabType) || "posts";

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingShop, setLoadingShop] = useState(false);
  const [hasFetchedShop, setHasFetchedShop] = useState(false);



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
            name: item.name || t("untitledProduct"),
            price: item.price
              ? `${item.price.toLocaleString("vi-VN")}₫`
              : t("contact"),
            image: item.image1 || item.image2 || item.image3 || "",
            category: item.layout || t("defaultCategory"),
            status: (item.quantity != null && item.quantity > 0
              ? t("inStock")
              : t("soldOut")) as Product["status"],
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
    <div className="bg-white rounded-sm border border-amazon-border p-3 space-y-3">
      <div className="bg-neutral-200 animate-pulse aspect-square w-full rounded-sm" />
      <div className="h-4 bg-neutral-200 animate-pulse rounded w-3/4" />
      <div className="h-4 bg-neutral-200 animate-pulse rounded w-1/2" />
    </div>
  );



  const ReviewSkeleton = () => (
    <div className="bg-white p-6 rounded-sm border border-amazon-border mb-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-neutral-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-1/4 h-4 bg-neutral-200 rounded" />
          <div className="w-3/4 h-4 bg-neutral-200 rounded" />
          <div className="w-full h-16 bg-neutral-200 rounded mt-2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* SIDEBAR */}
      <div className="lg:col-span-4 xl:col-span-3">
        <div>
          <ProfileSidebar profile={profile} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="lg:col-span-8 xl:col-span-9">
        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-sm shadow-sm border border-amazon-border mb-3  top-[70px] z-30">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { id: "posts", label: t("tabPosts"), icon: List },
              { id: "shop", label: t("tabShop"), icon: ShoppingBag },
              { id: "feedback", label: t("feedback"), icon: Star },
              // { id: "reviews", label: t("tabReviews"), icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleChangeTab(tab.id as TabType)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors outline-none",
                  currentTab === tab.id
                    ? "border-amazon-focus text-amazon-focus"
                    : "border-transparent text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50",
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
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-sm border border-amazon-border">
                  <div className="bg-neutral-50 p-4 rounded-full mb-3">
                    <PackageOpen className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-amazon-textMuted font-medium">
                    {t("noProducts")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* {currentTab === "showcase" && (
            <div className="bg-white p-16 text-center rounded-sm border border-amazon-border">
              <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-amazon-textMuted font-medium">
                {t("showcaseUpdating")}
              </p>
            </div>
          )} */}

          {currentTab === "feedback" && (
            <div className="bg-white rounded-sm border border-amazon-border p-6">
              <ShopFeedbackList shopId={profile.id} />
            </div>
          )}

        
        </div>
      </div>
    </div>
  );
};
