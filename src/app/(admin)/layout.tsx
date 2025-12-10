"use client";

import { AuthWrapper } from "@/src/wrapper/AuthWrapper";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthWrapper allowedRoles={["Collector"]}>
        <Header />
        <div className="flex flex-1 min-h-0">
          <Sidebar role="admin" />
          <main className="flex-1 p-6 bg-gray-100 overflow-auto mt-16">
            {children}
          </main>
        </div>
      </AuthWrapper>
    </div>
  );
}
