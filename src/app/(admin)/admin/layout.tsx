import { AuthWrapper } from "@/src/wrapper/AuthWrapper";

import "../../globals.css";
import { ReactNode } from "react";
import { Footer } from "@/src/components/Footer/Footer";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Oswald } from "next/font/google";
import { Header } from "@/src/components/Header/Header";
import Sidebar from "@/src/components/Sidebar";

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});


export const metadata = {
  title: "AMEKO - Admin Dashboard",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <AuthWrapper allowedRoles={["Admin"]}>
        <div
className={`flex flex-col h-screen overflow-hidden bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
        >
          <div className="w-full z-50 shrink-0 bg-white border-b border-amazon-border">
            {/* <Header /> */}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <Sidebar role="admin" />
            <main className="flex-1 p-6 bg-amazon-bgSecondary overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>

          {/* <Footer /> */}
        </div>
      </AuthWrapper>
    </LayoutWrapper>
  );
}
