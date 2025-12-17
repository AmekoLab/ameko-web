import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

// 1. Cấu hình Font
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ameko - Mechanical Keyboard Marketplace",
  description: "Cộng đồng bàn phím cơ Việt Nam",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${oswald.variable} font-oswald`}>
        {/* LayoutWrapper (Chứa Redux Provider) sẽ bọc toàn bộ ứng dụng */}
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
