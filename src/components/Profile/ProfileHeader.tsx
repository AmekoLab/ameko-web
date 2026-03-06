"use client";
import { FC, useState, useEffect } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Star,
  MessageCircle,
  Settings,
  Wrench,
  ChevronDown,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/index";
import {
  toggleFollowUser,
  fetchFollowingList,
} from "@/src/store/slices/followsSlice";
import { ShopPublicProfile } from "@/src/types/shop.types";
import { ImageModal } from "../Community/ImageModal";

import { FollowsModal } from "./FollowModal";
import { CreateCommissionModal } from "./CreateCommissionModal";

interface ProfileHeaderProps {
  profile: ShopPublicProfile;
  kitCategoryId?: string;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({
  profile,
  kitCategoryId = "4a84738d-736c-4ab8-af97-b9db8df05ba3",
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const [followsModalState, setFollowsModalState] = useState<{
    isOpen: boolean;
    title: "Followers" | "Following";
  }>({
    isOpen: false,
    title: "Followers",
  });

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const { followingIds, isLoading } = useSelector(
    (state: RootState) => state.follows,
  );

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

  // 4. Lấy danh sách đang theo dõi khi vào trang
  useEffect(() => {
    if (isAuthenticated && followingIds.length === 0) {
      dispatch(fetchFollowingList());
    }
  }, [dispatch, isAuthenticated, followingIds.length]);

  // --- THÊM: Hàm xử lý mở Popup ---
  const openFollowsModal = (title: "Followers" | "Following") => {
    setFollowsModalState({
      isOpen: true,
      title: title,
    });
  };

  // --- THÊM: Hàm xử lý đóng Popup ---
  const closeFollowsModal = () => {
    setFollowsModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleToggleFollow = () => {
    if (!profile.userId) return;

    dispatch(toggleFollowUser(profile.userId));

    if (isFollowing) {
      setLocalFollowersCount((prev) => Math.max(0, prev - 1));
    } else {
      setLocalFollowersCount((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-b-md shadow-sm border-b border-gray-200 mb-6 relative">
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
        className="relative h-48 md:h-64 lg:h-80 w-full bg-gray-200 group cursor-zoom-in overflow-hidden"
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
                className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 cursor-zoom-in"
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
              title="Online"
            ></div>
          </div>

          {/* Text Info */}
          <div className="flex-1 text-center md:text-left mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">
                {profile.shopName}
              </h1>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                <CheckCircle className="w-3 h-3" /> Verified Shop
              </span>
            </div>

            <p className="text-sm text-gray-500 font-medium mb-3">
              @{profile.id.slice(0, 8)}
            </p>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-[15px] mb-4">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900">
                  {profile.rating}
                </span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>

              {/* Followers: Bấm vào mở Modal Followers */}
              <div
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => openFollowsModal("Followers")}
              >
                <span className="font-semibold text-gray-900">
                  {localFollowersCount}
                </span>{" "}
                <span className="text-gray-800">followers</span>
              </div>

              {/* Following: Bấm vào mở Modal Following */}
              <div
                className="cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => openFollowsModal("Following")}
              >
                <span className="font-semibold text-gray-900">
                  {profile.followingCount || 0}
                </span>{" "}
                <span className="text-gray-800">following</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 md:mt-10 items-center">
            {isMe ? (
              <Link
                href="/shop/profile"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-sm transition-colors border border-gray-200"
              >
                <Settings className="w-4 h-4" /> Edit Shop Profile
              </Link>
            ) : (
              <>
                {/* NÚT FOLLOW */}
                <button
                  onClick={handleToggleFollow}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-6 py-2 font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-70 ${
                    isFollowing
                      ? "bg-[#efefef] text-black hover:bg-gray-200"
                      : "bg-[#0095f6] text-white hover:bg-[#1877f2]"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      Following <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    "Follow"
                  )}
                </button>

                {/* Dropdown: Đặt Phím Custom */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-6 py-2 bg-[#ce2a32] text-white hover:bg-[#b02028] font-black text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm"
                  >
                    Đặt Phím Custom <ChevronDown className="w-4 h-4" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                      <Link
                        href={`/builder?shopId=${profile.id}&categoryId=${kitCategoryId}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Wrench className="w-4 h-4" /> Tự thiết kế cấu hình
                      </Link>
                      <button
                        onClick={() => {
                          setIsCommissionModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                      >
                        <FileText className="w-4 h-4" /> Gửi yêu cầu báo giá
                      </button>
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-black font-bold text-sm rounded-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
