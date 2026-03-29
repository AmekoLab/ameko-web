import { Oswald } from "next/font/google";
import "../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

import { Footer } from "@/src/components/Footer/Footer";
import { Header } from "@/src/components/Header/Header";

// Cấu hình font
const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO - Gaming Gear",
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
      className={` flex flex-col min-h-screen bg-black ${font.className}`}
    >
      <LayoutWrapper>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </LayoutWrapper>
    </div>
  );
}
