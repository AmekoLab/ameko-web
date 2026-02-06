"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logoutUser } from "@/src/store/action/authActions";
import { EditProfileModal } from "@/src/components/Profile/EditProfileModal";
import { ChangePasswordModal } from "@/src/components/Profile/ChangePasswordModal";

export default function ProfilePage() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  // 1. Loading State (Skeleton)
  if (!isInitialized || !user) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white shadow-card rounded-xl p-6 flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logic hiển thị dữ liệu (Mapping field đúng với API)
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

  // URL Avatar: Ưu tiên ảnh user -> Ảnh UI Avatar theo tên
  const avatarSrc = user.image
    ? user.image
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=256`;

  // 3. Xử lý Logout
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/login");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-12">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8 font-oswald text-black">
        My Profile
      </h1>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 relative">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-700"></div>

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden">
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
                }}
              />
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-black hover:text-white transition shadow-sm font-medium text-sm flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded">
                {user.role}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${user.emailConfirmed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {user.emailConfirmed ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 break-all">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">
                    {user.phoneNumber || "Not updated"}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Username</span>
                  <span className="font-medium text-gray-900">
                    @{user.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Info (Nếu có) */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide">
                Store Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
                    {user.storeAddress || "No address provided"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-gray-500">Description</span>
                  <p className="font-medium text-gray-900 italic text-xs">
                    "{user.storeDescription || "No description available."}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            {/* Nút Change Password */}
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-gray-600 font-bold hover:text-black hover:bg-gray-100 px-4 py-2 rounded transition flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded transition flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
}
