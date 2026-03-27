import { Header } from "@/src/components/Header/Header";
import "../globals.css";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

import { Inter, Oswald } from "next/font/google";
import { Footer } from "@/src/components/Footer/Footer";

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "AMEKO - Community",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen bg-black ${inter.className} ${oswald.variable}`}
    >
      <LayoutWrapper>
        <div className={`${oswald.className} sticky top-0 z-40`}>
          <Header />
        </div>

        <main className="flex-grow">{children}</main>
        <Footer />
      </LayoutWrapper>
    </div>
  );
}
