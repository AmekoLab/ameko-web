import { Header } from "@/src/components/Header/Header";
import "../../../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Footer } from "@/src/components/Footer/Footer";
import { Oswald } from "next/font/google";

// Cấu hình Font Oswald (Giữ lại dạng biến phòng trường hợp cần dùng cho điểm nhấn)
const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

// Đã xóa font Inter vì dự án giờ dùng Amazon Ember làm mặc định

export const metadata = {
  title: "AMEKO - Community",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
    >
      <LayoutWrapper>
        <div className="sticky top-0 z-40">
          <Header />
        </div>

        <main className="flex-grow">{children}</main>

        <Footer />
      </LayoutWrapper>
    </div>
  );
}