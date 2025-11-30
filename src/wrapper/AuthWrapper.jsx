"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { getToken } from "@/services/authServices";



export const AuthWrapper = ({
    allowedRoles,
    children,
}) => {
    const { user, isLoading } = useSelector((state) => state.auth);
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkPermission = async () => {
            if (isLoading) {
                return;
            }
            if (!user && getToken()) {
                return;
            }
            if (!user && !getToken()) {
                router.replace("/login");
                return;
            }

            if (user && !allowedRoles.includes(user.role)) {

                if (user.role === "Collector") {
                    router.replace("/dashboard");
                } else {
                    router.replace("/");
                }
                return;
            }

            setIsChecking(false);
        };

        checkPermission();
    }, [user, isLoading, allowedRoles, router]);

    if (isLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
};
