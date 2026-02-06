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

  // Lấy trạng thái isInitialized từ Redux
  const { isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Nếu chưa khởi tạo thì gọi API check token ngay
    if (!isInitialized) {
      dispatch(checkTokenAndFetchProfile());
    }
  }, [dispatch, isInitialized]);

  // Hiện ra khi mới F5 trang web
  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-white fixed inset-0 z-50">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner Animation */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-t-[#ce2a32] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black font-oswald">
              Ameko<span className="text-[#ce2a32]">.</span>
            </h2>
            <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mt-1 animate-pulse">
              Initializing...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
