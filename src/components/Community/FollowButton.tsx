"use client";

import { FC, useState, useCallback } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { toggleFollowUser } from "@/src/store/slices/followsSlice";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface FollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
  targetUserAvatar?: string;
}

const FollowButton: FC<FollowButtonProps> = ({
  targetUserId,
  targetUserName,
  targetUserAvatar,
}) => {
  const t = useTranslations("FollowButton");
  const dispatch = useAppDispatch();
  const followingIds = useAppSelector((state) => state.follows.followingIds);
  const isLoadingRedux = useAppSelector((state) => state.follows.isLoading);
  
  const isFollowing = followingIds.includes(targetUserId);
  const [showModal, setShowModal] = useState(false);

  // Use a local loading state to show spin animation only on the button being clicked
  const [isLocalToggling, setIsLocalToggling] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isLocalToggling || isLoadingRedux) return;

      if (isFollowing) {
        setShowModal(true);
        return;
      }

      setIsLocalToggling(true);
      await dispatch(toggleFollowUser(targetUserId));
      setIsLocalToggling(false);
    },
    [dispatch, isFollowing, isLocalToggling, isLoadingRedux, targetUserId],
  );

  const handleConfirmUnfollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setShowModal(false);
    if (isLocalToggling || isLoadingRedux) return;

    setIsLocalToggling(true);
    await dispatch(toggleFollowUser(targetUserId));
    setIsLocalToggling(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLocalToggling || isLoadingRedux}
        className={`
          font-semibold text-xs px-4 py-1.5 rounded-lg
          transition-colors duration-150 active:scale-95
          disabled:opacity-70 disabled:cursor-not-allowed
          ${
            isFollowing
              ? "bg-[#efefef] hover:bg-[#dbdbdb] text-neutral-900"
              : "bg-[#0095f6] hover:bg-[#1877f2] text-white"
          }
        `}
      >
        {isLocalToggling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
        ) : isFollowing ? (
          t("following")
        ) : (
          t("follow")
        )}
      </button>

      {/* Unfollow Confirmation Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div 
            className="bg-white rounded-xl w-[100%] max-w-sm flex flex-col overflow-hidden text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="p-6 flex flex-col items-center">
              {targetUserAvatar && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4">
                  <Image 
                    src={targetUserAvatar} 
                    alt={targetUserName || "User avatar"} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-[15px] text-neutral-900">
                {t("unfollowConfirm", { name: targetUserName || t("user") })}
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleConfirmUnfollow}
              className="w-full border-t border-gray-200 py-3.5 text-red-500 font-bold text-sm active:bg-gray-50 transition-colors"
            >
              {t("unfollow")}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(false);
              }}
              className="w-full border-t border-gray-200 py-3.5 text-neutral-900 text-sm active:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowButton;
