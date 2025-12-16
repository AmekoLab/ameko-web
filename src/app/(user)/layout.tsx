import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import { Header } from "../../components/Header/Header";

import { ReactNode } from "react";
import { Footer } from "@/src/components/Footer/Footer";
import LayoutWrapper from "@/src/wrapper/LayoutWrapper";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <AuthWrapper allowedRoles={["User", "Collector"]}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 p-6 bg-gray-100 overflow-auto mt-16">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </AuthWrapper>
    </LayoutWrapper>
  );
}
