import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import { Header } from "../../components/Header/Header";
import "../globals.css";
import { ReactNode } from "react";
import { Footer } from "@/src/components/Footer/Footer";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Inter, Oswald } from "next/font/google";
import Sidebar from "@/src/components/Sidebar";

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
  title: "AMEKO - Shop Dashboard",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function WalletLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <AuthWrapper allowedRoles={["Customer", "Shop"]}>
        <div
          className={`flex flex-col min-h-screen bg-black ${inter.className} ${oswald.variable}`}
        >
          <div className={`${oswald.className} sticky top-0 z-50 w-full`}>
            <Header />
          </div>

          <div className="flex flex-1 min-h-0">
      
            <main className="flex-1 p-6 bg-black overflow-auto">
              {children}
            </main>
          </div>

          {/* <Footer /> */}
        </div>
      </AuthWrapper>
    </LayoutWrapper>
  );
}
