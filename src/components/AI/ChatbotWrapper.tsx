"use client";

import { usePathname } from "next/navigation";
import GlobalAIChatbot from "./GlobalAIChatbot";
import { useAppSelector } from "@/src/store/hook"; 

export default function ChatbotWrapper() {
  const pathname = usePathname();

  // Lấy trạng thái đăng nhập 
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Kiểm tra Route
  const isHomePage = pathname === "/" || pathname === "/vi" || pathname === "/en";
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/register");

  // 1. LUÔN ẨN ở trang Đăng nhập / Đăng ký (dù có lỗi hay cố tình vào lại)
  if (isAuthPage) {
    return null;
  }

  // 2. Ẩn ở trang chủ NẾU CHƯA ĐĂNG NHẬP
  if (isHomePage && !isAuthenticated) {
    return null;
  }

  // 3. Các trường hợp còn lại: Hiển thị AI Chatbot
  // (Bao gồm: Đã đăng nhập ở trang chủ, hoặc đang ở các trang khác như /shop, /community...)
  return <GlobalAIChatbot />;
}