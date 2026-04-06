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
        <div className="h-8 bg-[#1e2126] rounded-sm w-1/4 mb-6"></div>
        <div className="bg-[#151515] border border-[#1e2126] rounded-sm p-6 flex items-center gap-6">
          <div className="w-32 h-32 bg-[#1e2126] rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-[#1e2126] rounded-sm w-1/3"></div>
            <div className="h-4 bg-[#1e2126] rounded-sm w-1/2"></div>
            <div className="h-4 bg-[#1e2126] rounded-sm w-1/4"></div>
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
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8 font-oswald text-white">
        My Profile
      </h1>

      <div className="bg-[#151515] shadow-2xl rounded-sm overflow-hidden border border-[#1e2126] relative">
        {/* Header Background */}
        <div className="h-32 bg-[#1a1c20] border-b border-[#1e2126]"></div>

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full border-4 border-[#151515] shadow-md bg-[#1e2126] overflow-hidden">
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
              className="bg-[#1a1c20] border border-[#2a2d35] text-gray-300 px-4 py-2 hover:border-[#f5d800]/50 hover:text-[#f5d800] rounded-sm transition shadow-sm font-medium text-[11px] uppercase tracking-widest flex items-center gap-2"
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
            <h2 className="text-2xl font-bold text-white">{fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#1e2126] text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-sm border border-[#2a2d35]">
                {user.role}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-sm border ${user.emailConfirmed ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}`}
              >
                {user.emailConfirmed ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>

          {user.role !== "Admin" && (
            <div className="mt-8">
              {/* TRƯỜNG HỢP 1: PENDING */}
              {currentShop &&
                currentShop.status === ShopStatus.PendingApproval && (
                  <div className="bg-[#1a1c20] border border-[#2a2d35] rounded-sm p-6 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-bold text-[14px] uppercase tracking-wider text-white">
                        The application is being reviewed
                      </h3>
                      <p className="text-[12px] text-gray-400">
                        Please wait for the review process to complete. This
                        usually takes 24 hours.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2 text-gray-400 font-bold hover:text-[#f5d800] hover:bg-[#111111] text-[11px] uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2 whitespace-nowrap border border-transparent hover:border-[#2a2d35]"
                    >
                      <Eye className="w-4 h-4" /> View Application
                    </button>
                  </div>
                )}

              {/* TRƯỜNG HỢP 2: CHƯA CÓ SHOP */}
              {!currentShop && (
                <div className="bg-[#1a1c20] border border-[#2a2d35] rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-[#f5d800]/50 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#111111] border border-[#2a2d35] rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#f5d800]/10 group-hover:text-[#f5d800] group-hover:border-[#f5d800]/50 transition-colors shadow-sm shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] uppercase tracking-wider text-white group-hover:text-[#f5d800] transition-colors">
                        Bạn muốn bán hàng trên Ameko?
                      </h3>
                      <p className="text-[12px] text-gray-400">
                        Nâng cấp tài khoản để mở Shop và bắt đầu kinh doanh ngay
                        hôm nay.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/shop/register"
                    className="px-5 py-2.5 bg-[#f5d800] text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#e6cc00] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Đăng ký Shop <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 2B: REJECTED → CẬP NHẬT LẠI HỒ SƠ */}
              {currentShop && currentShop.status === ShopStatus.Rejected && (
                <div className="bg-[#1a1c20] border border-red-500/30 rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-red-500/50 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] uppercase tracking-wider text-white">
                        Your application was rejected
                      </h3>
                      <p className="text-[12px] text-gray-400">
                        {currentShop.adminNote
                          ? `Reason: ${currentShop.adminNote}`
                          : "Please review your information and resubmit."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2.5 bg-[#111111] border border-[#2a2d35] text-gray-300 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#252830] hover:text-white transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" /> View Application
                    </button>
                    <button
                      onClick={() => setIsUpdateShopModalOpen(true)}
                      className="px-5 py-2.5 bg-[#f5d800] text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-[#e6cc00] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Update & Resubmit <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP 3: ACTIVE */}
              {currentShop && currentShop.status === ShopStatus.Active && (
                <div className="bg-[#1a1c20] border border-blue-500/30 rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] uppercase tracking-wider text-white">
                        Manage Your Shop Dashboard
                      </h3>
                      <p className="text-[12px] text-gray-400">
                        Access your shop's dashboard to manage products, orders,
                        and view analytics.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/shop/dashboard"
                    className="px-5 py-2.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Vào Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 4: BANNED */}
              {currentShop && currentShop.status === ShopStatus.Banned && (
                <div className="bg-[#1a1c20] border border-red-500/30 rounded-sm p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center shrink-0">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-[14px] uppercase tracking-wider text-white">
                      Your shop has been banned
                    </h3>
                    <p className="text-[12px] text-red-400">
                      Your shop has been suspended due to a policy violation.
                      Please contact support for more information.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="px-4 py-2 text-red-400 font-bold hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-[11px] uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              )}
            </div>
          )}
          {/* ============================================================== */}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="p-6 bg-[#1a1c20] rounded-sm border border-[#1e2126]">
              <h3 className="font-black text-[#f5d800] mb-5 uppercase text-[11px] tracking-widest flex items-center gap-2">
                Contact Information
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-[#1e2126] pb-3">
                  <span className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">Email</span>
                  <span className="font-bold text-white break-all text-[12px]">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1e2126] pb-3">
                  <span className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">Phone</span>
                  <span className="font-bold text-white text-[12px]">
                    {user.phoneNumber || "Not updated"}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">Username</span>
                  <span className="font-bold text-white text-[12px]">
                    @{user.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Details (CHỈ HIỆN NẾU KHÔNG PHẢI ADMIN) */}
            {/* Vì Admin không có shop nên phần này sẽ trống rỗng, ẩn luôn cho đẹp */}
            {user.role !== "Admin" && (
              <div className="p-6 bg-[#1a1c20] rounded-sm border border-[#1e2126]">
                <h3 className="font-black text-[#f5d800] mb-5 uppercase text-[11px] tracking-widest">
                  Store Details
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#1e2126] pb-3">
                    <span className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">Address</span>
                    <span className="font-bold text-white text-[12px] text-right max-w-[60%] truncate">
                      {user.storeAddress || "No address provided"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">Description</span>
                    <p className="font-medium text-gray-300 italic text-[12px] leading-relaxed">
                      "{user.storeDescription || "No description available."}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout & Change Password */}
          <div className="mt-8 pt-6 border-t border-[#1e2126] flex flex-wrap justify-end gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-gray-400 font-bold hover:text-white hover:bg-[#1a1c20] border border-transparent hover:border-[#2a2d35] px-4 py-2 rounded-sm transition flex items-center gap-2 text-[11px] uppercase tracking-widest"
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="text-red-500 font-bold hover:bg-red-500/10 px-4 py-2 rounded-sm transition flex items-center gap-2 text-[11px] uppercase tracking-widest border border-red-500/30 hover:border-red-500/50"
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
