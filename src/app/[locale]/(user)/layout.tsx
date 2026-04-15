import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import { Header } from "@/src/components/Header/Header";

import { ReactNode } from "react";
import { Footer } from "@/src/components/Footer/Footer";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";
import { Inter, Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-oswald",
});


export const metadata = {
  title: "AMEKO - Profile",
  description: "Cộng đồng bàn phím cơ Việt Nam",
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <AuthWrapper allowedRoles={["Customer", "Shop", "Admin"]}>
        <div
          className={`flex flex-col min-h-screen bg-amazon-bgSecondary text-amazon-text font-sans ${oswald.variable}`}
        >
          <div className="sticky top-0 z-40">
            <Header />
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Main Content */}

            <main className="flex-grow">{children}</main>
          </div>

          {/* <Footer /> */}
        </div>
      </AuthWrapper>
    </LayoutWrapper>
  );
}
