import { Header } from "@/src/components/Header/Header";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Oswald } from "next/font/google";

// Cấu hình Font Oswald (Giữ lại dạng biến phòng trường hợp cần dùng cho điểm nhấn)
const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO - Community",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      // Đổi sang nền xám nhạt, chữ đen và dùng font Amazon Ember
      className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
    >
      <LayoutWrapper>
        {/* Đã gỡ oswald.className để Header đồng bộ font với toàn trang */}
        <div className="sticky top-0 z-40">
          <Header />
        </div>

        <main className="flex-grow">{children}</main>
      </LayoutWrapper>
    </div>
  );
}