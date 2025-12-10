"use client";

import React, { useEffect } from "react";
import { useAppSelector } from "@/src/store/hook";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const AuthWrapper = ({ allowedRoles, children }: AuthWrapperProps) => {
  const router = useRouter();

  const { user, isInitialized, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isInitialized) return;

    const checkPermission = () => {
      if (!isAuthenticated || !user) {
        router.replace("/login");
        return;
      }

      if (user.role && !allowedRoles.includes(user.role)) {
        if (user.role === "Collector") {
          router.replace("/dashboard");
        } else {
          router.replace("/");
        }
      }
    };

    checkPermission();
  }, [isInitialized, isAuthenticated, user, allowedRoles, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Đang kiểm tra quyền...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role || "")) {
    return null;
  }

  return <>{children}</>;
};
