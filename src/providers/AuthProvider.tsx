"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { checkTokenAndFetchProfile } from "@/src/store/action/authActions";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  // Lấy trạng thái khởi tạo từ Redux
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    dispatch(checkTokenAndFetchProfile());
  }, [dispatch]);

  // Nếu chưa khởi tạo xong -> Hiện màn hình Loading toàn trang
  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm font-medium">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  // Khi đã check xong (dù thành công hay thất bại) mới hiện nội dung app
  return <>{children}</>;
}
