import { Header } from "@/src/components/Header/Header";
import "../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Footer } from "@/src/components/Footer/Footer";
import { Oswald } from "next/font/google";

// Giữ lại cấu hình Oswald dưới dạng biến phòng khi cần dùng
const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO - My Orders",
  description: "Quản lý đơn hàng của bạn",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      // Đổi nền xám nhạt, chữ đen, dùng font Amazon Ember
      className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
    >
      <LayoutWrapper>
        {/* Đã gỡ class oswald cứng để Header tự đồng bộ font */}
        <div className="sticky top-0 z-40">
          <Header />
        </div>

        <main className="flex-grow">{children}</main>
        <Footer />
      </LayoutWrapper>
    </div>
  );
}