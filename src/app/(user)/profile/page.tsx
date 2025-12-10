"use client";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { useRouter } from "next/navigation";
import { logout } from "@/src/services/authServices"; // Hàm logout service bạn đã viết
import { logout as logoutAction } from "@/src/store/slices/authSlice";

export default function ProfilePage() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // 1. Loading State (Skeleton): Hiện khung xương khi đang tải dữ liệu
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

  // 2. Fallback Avatar: Nếu không có avatar, dùng API tạo ảnh theo tên
  const avatarSrc = user.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=random`;

  const handleLogout = () => {
    // Gọi service logout (để xóa storage)
    logout();
    // Dispatch action để clear Redux (để UI cập nhật ngay)
    dispatch(logoutAction());
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary-800">
        Hồ sơ cá nhân
      </h1>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        {/* Header Background (Trang trí) */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-primary-600"></div>

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            {/* Avatar */}
            <img
              src={avatarSrc}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
              onError={(e) => {
                // Xử lý nếu ảnh avatar bị lỗi link -> chuyển về ảnh mặc định
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`;
              }}
            />

            {/* Edit Button */}
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium">
              Chỉnh sửa
            </button>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 font-medium">{user.role}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card thông tin chi tiết */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">
                Thông tin liên hệ
              </h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-900">
                    {user.email}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại:</span>
                  <span className="font-medium text-gray-900">
                    {user.phone || "Chưa cập nhật"}
                  </span>
                </p>
              </div>
            </div>

            {/* Card Điểm thưởng (Nếu user có trường points) */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-3">
                Điểm tích lũy
              </h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-full text-blue-700">
                  {/* Icon Cup/Star */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-bold text-blue-700">
                    {user.points || 0}
                  </span>
                  <span className="text-blue-600 text-sm ml-1">điểm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="text-red-600 font-medium hover:text-red-700 flex items-center gap-2"
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
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
