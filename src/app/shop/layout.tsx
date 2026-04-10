import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import { Header } from "../../components/Header/Header";
import "../globals.css";
import { ReactNode } from "react";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Oswald } from "next/font/google";
import Sidebar from "@/src/components/Sidebar";

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO - Shop Dashboard",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <AuthWrapper allowedRoles={["Customer", "Shop"]}>
        <div
          // 1. Dùng h-screen và overflow-hidden để khóa chết chiều cao trang web
          className={`flex flex-col h-screen overflow-hidden bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
        >
          {/* 2. Gỡ bỏ sticky top-0, chỉ cần shrink-0 để Header không bị bóp méo */}
          <div className="w-full z-50 shrink-0 bg-white border-b border-amazon-border">
            {/* <Header /> */}
          </div>

          {/* 3. Vùng chứa Sidebar và Main (flex-1 để chiếm hết chiều cao còn lại) */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar role="shop" />
            
            {/* 4. CHỈ CHO PHÉP VÙNG MAIN NÀY CUỘN (overflow-y-auto) */}
            <main className="flex-1 p-6 bg-amazon-bgSecondary overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </AuthWrapper>
    </LayoutWrapper>
  );
}