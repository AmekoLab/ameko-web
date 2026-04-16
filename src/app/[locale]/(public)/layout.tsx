import { Oswald } from "next/font/google";
import "../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

import { Footer } from "@/src/components/Footer/Footer";
import { Header } from "@/src/components/Header/Header";

// Vẫn giữ lại cấu hình Oswald phòng trường hợp bạn muốn dùng cho một vài điểm nhấn đặc biệt,
// nhưng KHÔNG áp dụng nó làm font mặc định cho toàn trang nữa.
const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO ",
  description: "Bàn phím, chuột và phụ kiện gaming cao cấp",
  icons: { icon: "/logo.png" },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      // 1. Xóa bỏ `bg-black` và `font.className`
      // 2. Thêm `bg-amazon-bgSecondary` làm nền tổng thể (màu xám nhạt rất nhẹ của Amazon)
      // 3. Thêm `text-amazon-text` để đảm bảo chữ mặc định luôn là màu đen nhánh
      // 4. `font-sans` sẽ tự động gọi font Amazon Ember từ tailwind.config.ts
      className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${font.variable}`}
    >
      <LayoutWrapper>
        <Header />

        {/* Phần main chứa nội dung các trang con */}
        <main className="flex-grow">{children}</main>

        <Footer />
      </LayoutWrapper>
    </div>
  );
}
