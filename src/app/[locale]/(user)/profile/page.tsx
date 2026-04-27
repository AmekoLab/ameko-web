"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logoutUser } from "@/src/store/action/authActions";
import { EditProfileModal } from "@/src/components/Profile/EditProfileModal";
import { ChangePasswordModal } from "@/src/components/Profile/ChangePasswordModal";
import {
  ArrowRight,
  Store,
  ShoppingBag,
  Clock,
  AlertCircle,
  Eye,
  Ban,
  Pencil,
  LogOut,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { ShopStatus } from "@/src/types/shop.types";
import { ShopApplicationModal } from "@/src/components/Profile/ShopApplicationModal";
import { UpdateShopApplicationModal } from "@/src/components/Profile/UpdateShopApplicationModal";
import { fetchCurrentShop } from "@/src/store/slices/shopSlice";

export default function ProfilePage() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const { currentShop } = useAppSelector((state) => state.shop);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isUpdateShopModalOpen, setIsUpdateShopModalOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    // Gọi fetchCurrentShop cho mọi user (trừ Admin) khi chưa có dữ liệu
    // "User" role cũng cần fetch vì có thể đã nộp đơn đăng ký Shop (PendingApproval/Rejected)
    if (user && user.role !== "Admin" && !currentShop) {
      dispatch(fetchCurrentShop());
    }
  }, [user, currentShop, dispatch]);

  // 1. Loading State
  if (!isInitialized || !user) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white border border-neutral-100 shadow-sm rounded-xl p-8 flex items-center gap-6">
          <div className="w-32 h-32 bg-neutral-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logic hiển thị dữ liệu
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

  const avatarSrc = user.image
    ? user.image
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName,
      )}&background=random&size=256`;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/login");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900">
        My Profile
      </h1>

      <div className="bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden border border-neutral-100 relative">
        {/* Header Background */}
        <div className="h-32 bg-neutral-100 border-b border-neutral-200 relative overflow-hidden">
           {/* Abstract pattern for banner */}
           <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-200/60 via-neutral-100/10 to-transparent"></div>
        </div>

        <div className="px-6 sm:px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-14 mb-8">
            {/* Avatar */}
            <div className="relative w-[120px] h-[120px] rounded-full border-4 border-white shadow-md bg-white overflow-hidden shrink-0">
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName,
                  )}&background=random`;
                }}
              />
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white border border-neutral-200 text-neutral-600 px-4 py-2 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors shadow-sm font-medium text-sm flex items-center gap-2 mb-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* User Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">{fullName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-md border border-neutral-200 flex items-center gap-1">
                {user.role}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${user.emailConfirmed ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
              >
                {user.emailConfirmed ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>

          {user.role !== "Admin" && (
            <div className="mt-8 mb-8">
              {/* TRƯỜNG HỢP 1: PENDING */}
              {currentShop &&
                currentShop.status === ShopStatus.PendingApproval && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <div className="w-12 h-12 bg-white text-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="font-semibold text-sm text-neutral-900">
                        Application in Review
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        Please wait for the review process to complete. This usually takes 24-48 hours.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2 bg-white text-neutral-700 font-medium hover:bg-neutral-50 text-sm rounded-lg border border-neutral-200 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-neutral-400" /> View Application
                    </button>
                  </div>
                )}

              {/* TRƯỜNG HỢP 2: CHƯA CÓ SHOP */}
              {!currentShop && (
                <div className="bg-gradient-to-r from-neutral-50 to-white border border-neutral-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-neutral-100 shadow-sm rounded-full flex items-center justify-center text-neutral-400 shrink-0">
                      <Store className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900">
                        Want to start selling on Ameko?
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Upgrade your account to a seller to reach millions of custom keyboard enthusiasts.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile/register"
                    className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    Open a Shop <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 2B: REJECTED → CẬP NHẬT LẠI HỒ SƠ */}
              {currentShop && currentShop.status === ShopStatus.Rejected && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full border border-red-100 flex items-center justify-center shadow-sm shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-neutral-900">
                        Application Rejected
                      </h3>
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        {currentShop.adminNote
                          ? `Reason: ${currentShop.adminNote}`
                          : "Please review your information and resubmit."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 text-neutral-400" /> View Original
                    </button>
                    <button
                      onClick={() => setIsUpdateShopModalOpen(true)}
                      className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-[0.98]"
                    >
                      Resubmit <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP 3: ACTIVE */}
              {currentShop && currentShop.status === ShopStatus.Active && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-all">
                   <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-blue-100 shadow-sm rounded-full flex items-center justify-center text-blue-600 shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-neutral-900">
                        Manage Your Store
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        Access your merchant dashboard to manage products, view analytics, and fulfill orders.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/shop/dashboard"
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap active:scale-[0.98]"
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 4: BANNED */}
              {currentShop && currentShop.status === ShopStatus.Banned && (
                <div className="bg-white border border-red-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="font-semibold text-sm text-neutral-900">
                      Store Banned
                    </h3>
                    <p className="text-sm text-red-600 font-medium mt-1">
                      Your shop has been suspended due to policy violations. Contact support for details.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="px-4 py-2 bg-red-50 text-red-700 font-medium hover:bg-red-100 border border-red-100 text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              )}
            </div>
          )}
          {/* ============================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="p-6 sm:p-8 bg-neutral-50 rounded-xl border border-neutral-100">
              <h3 className="font-semibold text-neutral-900 mb-6 text-sm flex items-center gap-2 border-b border-neutral-200 pb-3">
                Contact Information
              </h3>
              <div className="space-y-4 text-sm mt-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 font-medium">Email</span>
                  <span className="font-medium text-neutral-800 break-all text-right ml-4">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 font-medium">Phone</span>
                  <span className="font-medium text-neutral-800">
                    {user.phoneNumber || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 font-medium">Username</span>
                  <span className="font-medium text-neutral-800">
                    @{user.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Details (CHỈ HIỆN NẾU KHÔNG PHẢI ADMIN) */}
            {user.role !== "Admin" && (
              <div className="p-6 sm:p-8 bg-neutral-50 rounded-xl border border-neutral-100">
                <h3 className="font-semibold text-neutral-900 mb-6 text-sm flex items-center gap-2 border-b border-neutral-200 pb-3">
                  Store Abstract
                </h3>
                <div className="space-y-4 text-sm mt-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-100">
                    <span className="text-neutral-500 font-medium">Address</span>
                    <span className="font-medium text-neutral-800 text-right max-w-[60%] truncate ml-4">
                      {user.storeAddress || "No address provided"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-neutral-100">
                    <span className="text-neutral-500 font-medium">Bio</span>
                    <p className="font-medium text-neutral-700 leading-relaxed text-[13px]">
                      {user.storeDescription ? `"${user.storeDescription}"` : "No description available."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout & Change Password */}
          <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-wrap justify-end gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-neutral-600 font-medium hover:text-neutral-900 hover:bg-neutral-50 bg-white border border-neutral-200 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-neutral-400" />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium hover:bg-red-50 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm border border-red-200 bg-white shadow-sm"
            >
              <LogOut className="w-4 h-4 text-red-500" />
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

      {/* Modal View Application */}
      <ShopApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        shopData={currentShop}
      />

      {/* Modal Update Shop Application (for rejected) */}
      <UpdateShopApplicationModal
        isOpen={isUpdateShopModalOpen}
        onClose={() => setIsUpdateShopModalOpen(false)}
        shopData={currentShop}
      />
    </div>
  );
}
