import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import { Header } from "../../components/Header/Header";
import "../globals.css";
import { ReactNode } from "react";
import { Footer } from "@/src/components/Footer/Footer";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Oswald } from "next/font/google";
import Sidebar from "@/src/components/Sidebar";

// Giữ lại cấu hình Oswald dưới dạng biến phòng trường hợp cần dùng
const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

// Đã gỡ bỏ cấu hình font Inter

export const metadata = {
  title: "AMEKO - Shop Dashboard",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <AuthWrapper allowedRoles={["Customer", "Shop"]}>
        <div
          // Đổi nền đen thành xám nhạt, áp dụng màu chữ đen và font Amazon Ember
          className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
        >
          {/* Đã gỡ bỏ oswald.className để Header đồng bộ font với trang */}
          <div className="sticky top-0 z-50 w-full">
            <Header />
          </div>

          <div className="flex flex-1 min-h-0">
            <Sidebar role="shop" />
            
            {/* Nền của phần nội dung chính cũng được chuyển sang xám nhạt */}
            <main className="flex-1 p-6 bg-amazon-bgSecondary overflow-auto">
              {children}
            </main>
          </div>

          {/* <Footer /> */}
        </div>
      </AuthWrapper>
    </LayoutWrapper>
  );
}