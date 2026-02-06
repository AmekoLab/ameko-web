"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { requestForgotPassword } from "@/src/store/action/authActions";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter the email!");
      return;
    }

    try {
      // 1. Gọi Action gửi OTP
      await dispatch(requestForgotPassword(email));

      toast.success("The confirmation code has been sent to your email!");

      // 2. Chuyển hướng sang trang Reset Password
      // Chúng ta truyền email qua URL để trang sau tự điền
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.message || "This email was not found in the system.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black font-oswald text-gray-900 uppercase">
            Forgot password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't worry, please enter your email to retrieve your password.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#ce2a32] focus:border-[#ce2a32] focus:z-10 sm:text-sm transition-colors"
                placeholder="Nhập địa chỉ email của bạn"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-black hover:bg-[#ce2a32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ce2a32] transition-colors uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                "Gửi mã xác nhận"
              )}
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="font-medium text-gray-600 hover:text-[#ce2a32] transition-colors text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
