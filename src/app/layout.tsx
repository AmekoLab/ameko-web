import { Oswald } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../wrapper/LayoutWrapper"; // Đổi tên thành Providers.tsx thì hay hơn
import { Header } from "../components/Header/Header";

// Cấu hình font
const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald", // (Option) Thêm variable để dùng trong Tailwind cho tiện
});

export const metadata = {
  title: "Cherry Xtrfy - Gaming Gear",
  description: "Bàn phím, chuột và phụ kiện gaming cao cấp",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={font.className}>
        {/* QUAN TRỌNG: 
          LayoutWrapper (chứa Redux Provider) phải bọc TẤT CẢ mọi thứ
          bao gồm cả Header và Children
        */}
        <LayoutWrapper>
          <div className="flex flex-col min-h-screen">
            {/* Header nằm trong này mới lấy được User từ Redux */}
            <Header />

            {/* Phần nội dung chính đẩy xuống dưới */}
            <main className="flex-grow">{children}</main>

            {/* (Gợi ý) Footer nên để ở đây luôn */}
            {/* <Footer /> */}
          </div>
        </LayoutWrapper>
      </body>
    </html>
  );
}
