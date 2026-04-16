"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { confirmResetPassword } from "@/src/store/action/authActions";
import { toast } from "react-toastify";

function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading } = useAppSelector((state) => state.auth);

  const emailFromUrl = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cập nhật lại state nếu email load chậm
  useEffect(() => {
    if (emailFromUrl) {
      setFormData((prev) => ({ ...prev, email: emailFromUrl }));
    }
  }, [emailFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Confirmation password does not match!");
      return;
    }
    if (!formData.code) {
      toast.error("Please enter the OTP code");
      return;
    }

    try {
      await dispatch(confirmResetPassword(formData));

      toast.success("Password reset successful! Sign in now.");

      // Chuyển về trang đăng nhập
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "The OTP code is incorrect or has expired.");
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-black font-oswald text-gray-900 uppercase">
          Reset password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the OTP code sent{" "}
          <span className="font-bold text-gray-800">{formData.email}</span>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className=" space-y-4">
          {/* Email (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none sm:text-sm"
            />
          </div>

          {/* OTP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP code (Check Email)
            </label>
            <input
              name="code"
              type="text"
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="Nhập mã code 6 số..."
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#ce2a32] focus:border-[#ce2a32] sm:text-sm font-mono tracking-widest text-center text-lg"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              name="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••"
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#ce2a32] focus:border-[#ce2a32] sm:text-sm"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••"
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#ce2a32] focus:border-[#ce2a32] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-black hover:bg-[#ce2a32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ce2a32] transition-colors uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Change password & Login"}
          </button>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/forgot-password"
            className="font-medium text-gray-600 hover:text-[#ce2a32] transition-colors text-sm"
          >
            Resend code?
          </Link>
        </div>
      </form>
    </div>
  );
}

// Main Page Component (Bắt buộc dùng Suspense vì có useSearchParams)
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
