"use client";
import { FC, useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Star,
  MessageCircle,
  UserPlus,
  Settings,
  Wrench,
} from "lucide-react";
import { UserProfile } from "@/src/types/profile";
import { ImageModal } from "../Community/ImageModal";

export const ProfileHeader: FC<{ profile: UserProfile }> = ({ profile }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="bg-white rounded-b-md shadow-sm border-b border-gray-200 mb-6">
      <ImageModal
        imgSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      {/* 1. Cover Image */}
      <div
        onClick={() => setSelectedImage(profile.coverImage)}
        className="relative h-48 md:h-64 lg:h-80 w-full bg-gray-200 group cursor-zoom-in overflow-hidden"
      >
        <Image
          src={profile.coverImage}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        {/* TODO: [FEATURE] Nút đổi ảnh bìa chỉ hiện khi isMe = true */}
        {profile.isMe && (
          <button className="absolute bottom-4 right-4 bg-white/80 hover:bg-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
            Change Cover
          </button>
        )}
      </div>

      {/* 2. Info Section */}
      <div className="px-4 pb-6 lg:px-8">
        <div className="relative flex flex-col items-center md:items-start md:flex-row md:gap-6">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-20 mb-3 md:mb-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white shadow-md">
              <div
                onClick={() => setSelectedImage(profile.avatar)}
                className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 cursor-zoom-in"
              >
                <Image
                  src={profile.avatar}
                  alt={profile.displayName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {/* Status Online Indicator */}
            <div
              className="absolute bottom-4 right-4 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
              title="Online"
            ></div>
          </div>

          {/* Text Info */}
          <div className="flex-1 text-center md:text-left mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">
                {profile.displayName}
              </h1>
              {/* Role Badge */}
              {profile.role === "Verified Shop" && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                  <CheckCircle className="w-3 h-3" /> Verified Shop
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 font-medium mb-3">
              @{profile.username}
            </p>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-sm mb-4">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">
                  {profile.reputation}
                </span>
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-400 text-xs uppercase font-bold">
                  Rating
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-900">
                  {profile.followers}
                </span>
                <span className="text-gray-400 text-xs uppercase font-bold ml-1">
                  Followers
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-900">
                  {profile.following}
                </span>
                <span className="text-gray-400 text-xs uppercase font-bold ml-1">
                  Following
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 md:mt-10">
            {profile.isMe ? (
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-sm transition-colors">
                <Settings className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button className="flex items-center gap-2 px-6 py-2 bg-black text-white hover:bg-[#ce2a32] font-black text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm">
                  <UserPlus className="w-4 h-4" /> Follow
                  {/* TODO: [API] Gọi API Follow user */}
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#ce2a32] text-white hover:bg-[#b02028] font-black text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm">
                  <Wrench className="w-4 h-4" /> Customize
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-black font-bold text-sm rounded-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> Chat
                  {/* TODO: [ROUTING] Link tới trang chat /messages/{id} */}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
