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
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    fullName,
                  )}&background=random`;
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

          {user.role !== "Admin" && (
            <div className="mt-8">
              {/* TRƯỜNG HỢP 1: PENDING */}
              {currentShop &&
                currentShop.status === ShopStatus.PendingApproval && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <div className="w-12 h-12 bg-gray-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-bold text-lg text-gray-900">
                        The application is being reviewed
                      </h3>
                      <p className="text-sm text-gray-700">
                        Please wait for the review process to complete. This
                        usually takes 24 hours.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2 text-gray-600 font-bold hover:text-black hover:bg-gray-100 text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" /> View Application
                    </button>
                  </div>
                )}

              {/* TRƯỜNG HỢP 2: CHƯA CÓ SHOP */}
              {!currentShop && (
                <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-black/30 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 group-hover:bg-[#ce2a32] group-hover:text-white group-hover:border-[#ce2a32] transition-colors shadow-sm shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#ce2a32] transition-colors">
                        Bạn muốn bán hàng trên Ameko?
                      </h3>
                      <p className="text-sm text-gray-500">
                        Nâng cấp tài khoản để mở Shop và bắt đầu kinh doanh ngay
                        hôm nay.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/shop/register"
                    className="px-5 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-[#ce2a32] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Đăng ký Shop <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 2B: REJECTED → CẬP NHẬT LẠI HỒ SƠ */}
              {currentShop && currentShop.status === ShopStatus.Rejected && (
                <div className="bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-red-300 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Your application was rejected
                      </h3>
                      <p className="text-sm text-gray-500">
                        {currentShop.adminNote
                          ? `Reason: ${currentShop.adminNote}`
                          : "Please review your information and resubmit."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" /> View Application
                    </button>
                    <button
                      onClick={() => setIsUpdateShopModalOpen(true)}
                      className="px-5 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-[#ce2a32] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Update & Resubmit <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TRƯỜNG HỢP 3: ACTIVE */}
              {currentShop && currentShop.status === ShopStatus.Active && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">
                        Manage Your Shop Dashboard
                      </h3>
                      <p className="text-sm text-blue-600">
                        Access your shop's dashboard to manage products, orders,
                        and view analytics.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/shop/dashboard"
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Vào Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TRƯỜNG HỢP 4: BANNED */}
              {currentShop && currentShop.status === ShopStatus.Banned && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-lg text-red-800">
                      Your shop has been banned
                    </h3>
                    <p className="text-sm text-red-600">
                      Your shop has been suspended due to a policy violation.
                      Please contact support for more information.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="px-4 py-2 text-red-600 font-bold hover:text-red-800 hover:bg-red-100 text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
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
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wide flex items-center gap-2">
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

            {/* Store Details (CHỈ HIỆN NẾU KHÔNG PHẢI ADMIN) */}
            {/* Vì Admin không có shop nên phần này sẽ trống rỗng, ẩn luôn cho đẹp */}
            {user.role !== "Admin" && (
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
                    <p className="font-medium text-gray-900 italic text-xs leading-relaxed">
                      "{user.storeDescription || "No description available."}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout & Change Password */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-end gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-gray-600 font-bold hover:text-black hover:bg-gray-100 px-4 py-2 rounded transition flex items-center gap-2 text-sm"
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
              className="text-red-600 font-bold hover:bg-gray-100 px-4 py-2 rounded transition flex items-center gap-2 text-sm border border-red-100"
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
