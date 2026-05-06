import { Header } from "@/src/components/Header/Header";
import "../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

import { Oswald } from "next/font/google";

const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "AMEKO ",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-[#f0f2f5] ${font.className}`}
    >
      <LayoutWrapper>
        <main className="flex-grow">{children}</main>
      </LayoutWrapper>
    </div>
  );
}
