import { Oswald } from "next/font/google";
import "../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

import { Footer } from "@/src/components/Footer/Footer";
import { Header } from "@/src/components/Header/Header";

// ─── IMPORT THÊM 2 DÒNG NÀY ───
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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

// 1. Thêm "async" vào function
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Lấy "messages" (từ điển) từ server
  const messages = await getMessages();

  return (
    // 3. Bọc toàn bộ bằng NextIntlClientProvider
    <NextIntlClientProvider messages={messages}>
      <div
        className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${font.variable}`}
      >
        <LayoutWrapper>
          <Header />

          {/* Phần main chứa nội dung các trang con */}
          <main className="flex-grow">{children}</main>

          <Footer />
        </LayoutWrapper>
      </div>
    </NextIntlClientProvider>
  );
}