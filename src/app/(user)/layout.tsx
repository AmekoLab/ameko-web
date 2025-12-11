import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import { Header } from "../../components/Header/Header";

import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper allowedRoles={["User", "Collector"]}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 min-h-0">
          <main className="flex-1 p-6 bg-gray-100 overflow-auto mt-16">
            {children}
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
}
