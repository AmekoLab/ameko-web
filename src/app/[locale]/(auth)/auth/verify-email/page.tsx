"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "@/src/services/authServices";
import { Loader2, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

const RESEND_COOLDOWN = 60; // seconds

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  // States
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Handle OTP input – only allow digits, max 6
  const handleOtpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setOtpCode(value);
    },
    [],
  );

  // Handle verify OTP
  const handleVerify = useCallback(async () => {
    if (!email || otpCode.length !== 6) return;

    setIsLoading(true);
    try {
      const res = await authService.verifyOtp({ email, code: otpCode });

      if (res.success) {
        toast.success("Confirm email success please login again");
        router.push("/login");
      } else {
        toast.error(res.message || "Invalid OTP code.");
      }
    } catch (error: any) {
      // Interceptor already unwraps to error.message
      const errorMessage = error?.message || error?.response?.data?.message || "Confirm email failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, otpCode, router]);

  // Handle resend OTP
  const handleResend = useCallback(async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    try {
      const res = await authService.sendOtp(email);
      if (res.success) {
        toast.success("Resend OTP success");
        setCountdown(RESEND_COOLDOWN);
        setOtpCode("");
      } else {
        toast.error(res.message || "Resend OTP failed");
      }
    } catch (error: any) {
      // Interceptor already unwraps to error.message
      const errorMessage = error?.message || error?.response?.data?.message || "Resend OTP failed.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  }, [email, countdown]);

  // Enter key submits
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && otpCode.length === 6 && !isLoading) {
        handleVerify();
      }
    },
    [otpCode, isLoading, handleVerify],
  );

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Back to login */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-[#111111] border border-[#1e2126] rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f5d800]/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#f5d800]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            Confirm Email
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-center mb-8 text-sm leading-relaxed">
            6-digit OTP code has been sent to:
            <br />
            <span className="text-white font-semibold inline-flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-[#f5d800]" />
              {email}
            </span>
          </p>

          {/* OTP Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              OTP Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={handleOtpChange}
              onKeyDown={handleKeyDown}
              placeholder="000000"
              maxLength={6}
              className="text-center tracking-[0.5em] text-2xl font-bold bg-[#1a1a1a] text-white border border-[#2a2d35] rounded-lg p-4 w-full outline-none focus:border-[#f5d800] transition-colors placeholder:text-[#2a2d35] placeholder:tracking-[0.5em]"
              autoFocus
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || otpCode.length !== 6}
            className="w-full bg-[#f5d800] text-black font-bold py-3.5 rounded-lg mt-6 hover:bg-[#ffe500] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm"
            )}
          </button>

          {/* Divider */}
          <div className="my-6 border-t border-[#1e2126]" />

          {/* Resend Section */}
          <div className="text-center text-sm">
            {countdown > 0 ? (
              <p className="text-gray-500">
                Resend OTP after{" "}
                <span className="text-white font-bold tabular-nums">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-[#f5d800] font-bold hover:text-[#ffe500] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <Loader2 className="w-8 h-8 animate-spin text-[#f5d800]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
