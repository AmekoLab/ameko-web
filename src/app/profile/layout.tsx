import { Oswald } from "next/font/google";
import "../globals.css";
import { Header } from "@/src/components/Header/Header";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

const font = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

export const metadata = {
  title: "Cherry Xtrfy - Profile",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-[#f0f2f5] ${font.className}`}
    >
      <LayoutWrapper>
        <Header />
        <main className="flex-grow">{children}</main>
      </LayoutWrapper>
    </div>
  );
}
