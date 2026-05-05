"use client";
import { FC, useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Star,
  MessageCircle,
  Settings,
  Wrench,
  ChevronDown,
  FileText,
  Award,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import { toggleFollowUser, fetchFollowingList } from "@/src/store/slices/followsSlice";
import { ShopPublicProfile } from "@/src/types/shop.types";
import { shopReputationService, ShopReputationCurrent } from "@/src/services/shopReputation.service";
import { ImageModal } from "../Community/ImageModal";

import { FollowsModal } from "./FollowModal";
import { CreateCommissionModal } from "./CreateCommissionModal";
import { startConversationThunk } from "@/src/store/slices/chatSlice";

interface ProfileHeaderProps {
  profile: ShopPublicProfile;
  kitCategoryId?: string;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({
  profile,
  kitCategoryId = "4a84738d-736c-4ab8-af97-b9db8df05ba3",
}) => {
  const t = useTranslations("ProfileHeader");
  const followersModalTitle = t("followersModalTitle") as "Followers";
  const followingModalTitle = t("followingModalTitle") as "Following";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const [followsModalState, setFollowsModalState] = useState<{
    isOpen: boolean;
    title: "Followers" | "Following";
  }>({
    isOpen: false,
    title: followersModalTitle,
  });

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const { followingIds, isLoading } = useSelector(
    (state: RootState) => state.follows,
  );

  // Reputation State
  const [shopReputation, setShopReputation] = useState<ShopReputationCurrent | null>(null);

  useEffect(() => {
    if (profile?.id) {
      shopReputationService.getPublicShopReputation(profile.id)
        .then((res) => {
          if (res.success && res.data) {
            setShopReputation(res.data);
          }
        })
        .catch((err) => console.error("Failed to fetch public shop reputation", err));
    }
  }, [profile?.id]);

  // 2. Logic kiểm tra quyền và trạng thái follow
  const isMe = isAuthenticated && user?.id === profile.userId;
  const isFollowing = followingIds.includes(profile.userId);

  // 3. Quản lý con số Followers cục bộ để UI nhảy số tức thì (Optimistic Update)
  const [localFollowersCount, setLocalFollowersCount] = useState(
    profile.followersCount || 0,
  );

  useEffect(() => {
    setLocalFollowersCount(profile.followersCount || 0);
  }, [profile.followersCount]);

  // Smart Sync: Track Redux followingIds and update local count automatically
  const prevFollowingIds = useRef<string[]>(followingIds);

  useEffect(() => {
    if (!profile?.userId) return;

    // Determine what changed
    const added = followingIds.filter(id => !prevFollowingIds.current.includes(id));
    const removed = prevFollowingIds.current.filter(id => !followingIds.includes(id));

    // Update count based on changes targetting this profile
    if (added.length === 1 && added[0] === profile.userId) {
      setLocalFollowersCount((prev) => prev + 1);
    } else if (removed.length === 1 && removed[0] === profile.userId) {
      setLocalFollowersCount((prev) => Math.max(0, prev - 1));
    }

    // Update ref for the next cycle
    prevFollowingIds.current = followingIds;
  }, [followingIds, profile?.userId]);

  // 4. Lấy danh sách đang theo dõi khi vào trang
  useEffect(() => {
    if (isAuthenticated && followingIds.length === 0) {
      dispatch(fetchFollowingList());
    }
  }, [dispatch, isAuthenticated, followingIds.length]);

  // --- THÊM: Hàm xử lý mở Popup ---
  // --- ADD: Open Popup Handler ---
  const openFollowsModal = (title: "Followers" | "Following") => {
    setFollowsModalState({
      isOpen: true,
      title: title,
    });
  };

  // --- THÊM: Hàm xử lý đóng Popup ---
  // --- ADD: Close Popup Handler ---
  const closeFollowsModal = () => {
    setFollowsModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleToggleFollow = () => {
    if (!profile.userId) return;

    // Sẽ tự động trigger useEffect Smart Sync ở trên để update số
    dispatch(toggleFollowUser(profile.userId));
  };

  return (
    <div className="bg-white rounded-b-md shadow-sm border-b border-amazon-border mb-6 relative">
      <ImageModal
        imgSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <FollowsModal
        isOpen={followsModalState.isOpen}
        onClose={closeFollowsModal}
        title={followsModalState.title}
        shopUserId={profile.userId}
      />

      <CreateCommissionModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        targetedShopId={profile.id}
      />

      {/* 1. Banner Image */}
      <div
        onClick={() => setSelectedImage(profile.bannerUrl)}
        className="relative h-48 md:h-64 lg:h-80 w-full bg-neutral-100 group cursor-zoom-in overflow-hidden"
      >
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* 2. Info Section */}
      <div className="px-4 pb-6 lg:px-8">
        <div className="relative flex flex-col items-center md:items-start md:flex-row md:gap-6">
          {/* Avatar / Logo */}
          <div className="relative -mt-16 md:-mt-20 mb-3 md:mb-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white shadow-md">
              <div
                onClick={() => setSelectedImage(profile.logoUrl)}
                className="relative w-full h-full rounded-full overflow-hidden bg-neutral-100 cursor-zoom-in"
              >
                {profile.logoUrl && (
                  <Image
                    src={profile.logoUrl}
                    alt={profile.shopName}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <div
              className="absolute bottom-4 right-4 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
              title={t("online")}
            ></div>
          </div>

          {/* Text Info */}
          <div className="flex-1 text-center md:text-left mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-amazon-text">
                {profile.shopName}
              </h1>
              
              {/* Dynamic Reputation Badge */}
             {shopReputation && (
                <span 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border cursor-help transition-all ${
                    shopReputation.badge === "Premium" 
                      ? "bg-gradient-to-r from-yellow-50 to-amber-100 text-amber-700 border-yellow-300 shadow-sm"
                      : shopReputation.badge === "Verified"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200"
                  }`}
                  title={t("reputation.tooltip", { score: shopReputation.currentQualityScore })}
                >
                  {shopReputation.badge === "Premium" ? (
                    <Award className="w-4 h-4 text-amber-600" />
                  ) : shopReputation.badge === "Verified" ? (
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-neutral-500" />
                  )}
                  {shopReputation.badge} Shop
                </span>
              )}

              {/* INACTIVE STATUS BADGE */}
              {profile.isActive === false && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-neutral-200 text-neutral-600 border border-neutral-300">
                  {t("inactiveShop") || "Tạm nghỉ"}
                </span>
              )}
            </div>

            <p className="text-sm text-amazon-textMuted font-medium mb-3">
              @{profile.id.slice(0, 8)}
            </p>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-[15px] mb-4">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-amazon-text">
                  {profile.rating}
                </span>
                <Star className="w-4 h-4 text-amazon-link fill-amazon-link" />
              </div>

              {/* Followers: Click to open Followers Modal */}
              <div
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => openFollowsModal(followersModalTitle)}
              >
                <span className="font-semibold text-amazon-text">
                  {localFollowersCount}
                </span>{" "}
                <span className="text-amazon-text">{t("followers")}</span>
              </div>

              {/* Following: Click to open Following Modal */}
              <div
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => openFollowsModal(followingModalTitle)}
              >
                <span className="font-semibold text-amazon-text">
                  {profile.followingCount || 0}
                </span>{" "}
                <span className="text-amazon-text">{t("following")}</span>
              </div>
            </div>

            {/* INACTIVE WARNING BANNER */}
            {profile.isActive === false && (
              <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-md flex items-start gap-2 text-left">
                <svg className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-neutral-700">{t("shopIsInactiveTitle") || "Cửa hàng đang tạm nghỉ"}</p>
                  <p className="text-xs text-neutral-500">{t("shopIsInactiveDesc") || "Cửa hàng này hiện không nhận đơn hàng mới hay yêu cầu báo giá. Bạn vẫn có thể xem các sản phẩm."}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 md:mt-10 items-center">
            {isMe ? (
              <Link
                href="/shop/profile"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 text-amazon-text font-bold text-sm rounded-sm transition-colors border border-amazon-border shadow-sm"
              >
                <Settings className="w-4 h-4" /> {t("editShopProfile")}
              </Link>
            ) : (
              <>
                {/* FOLLOW BUTTON */}
                <button
                  onClick={handleToggleFollow}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-6 py-2 font-semibold text-sm rounded-sm transition-colors shadow-sm disabled:opacity-70 ${
                    isFollowing
                      ? "bg-white text-amazon-text hover:bg-neutral-50 border border-amazon-border"
                      : "bg-amazon-btnPrimary text-amazon-text hover:brightness-95"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      {t("followingBtn")} <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    t("followBtn")
                  )}
                </button>

                {/* Dropdown: Set Custom Key */}
                <div className="relative">
                  <button
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      disabled={profile.isActive === false}
                    className="flex items-center gap-2 px-6 py-2 bg-amazon-btnPrimary text-amazon-text hover:brightness-95 font-black text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm"
                  >
                    {t("setCustomKey")} {profile.isActive === false ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-neutral-200 text-neutral-600 border border-neutral-300">
                  {t("inactiveShop") || "Tạm nghỉ"}
                </span>
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-xl border border-amazon-border py-1 z-50">
                      <Link
                        href={`/builder?shopId=${profile.id}&categoryId=${kitCategoryId}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-amazon-text hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Wrench className="w-4 h-4" />{" "}
                        {t("customizeConfiguration")}
                      </Link>
                      <button
                        onClick={() => {
                          if (profile.isActive === false) return; // Prevent action
                          setIsCommissionModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        disabled={profile.isActive === false}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left transition-colors ${
                          profile.isActive === false 
                            ? "text-neutral-400 bg-neutral-50 cursor-not-allowed" 
                            : "text-amazon-text hover:bg-neutral-50"
                        }`}
                        title={profile.isActive === false ? (t("shopIsInactiveTitle") || "Cửa hàng đang tạm nghỉ") : ""}
                      >
                        <FileText className="w-4 h-4" />{" "}
                        {t("sendQuotationRequest")}
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    dispatch(startConversationThunk(profile.userId))
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-amazon-border hover:bg-neutral-50 text-amazon-text font-bold text-sm rounded-sm transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" /> {t("chat")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
