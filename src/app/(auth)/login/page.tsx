"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/src/store/hook";
import { loginAndFetchProfile } from "@/src/store/action/authActions";
import { useLoginForm } from "@/src/features/auth/hooks/useLoginForm";
import { LoginSchemaType } from "@/src/features/auth/schemas/login.schema";

import { InputField } from "@/src/components/ui/InputField";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Custom Hook xử lý Form & Error State
  const { register, handleSubmit, errors, isLoading, authError } =
    useLoginForm();

  // --- HANDLER: SUBMIT FORM ---
  const onSubmit = async (data: LoginSchemaType) => {
    try {
      // 1. Gọi Action đăng nhập
      // Lưu ý: Không dùng .unwrap() vì đây là Manual Thunk
      const profile: any = await dispatch(
        loginAndFetchProfile({
          email: data.username,
          password: data.password,
        }),
      );

      // 2. Kiểm tra kết quả trả về
      if (profile && profile.role) {
        // Hiển thị thông báo chào mừng
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>
              Welcome back, <strong>{profile.firstName || "User"}</strong>!
            </span>
          </div>,
        );

        // 3. Điều hướng dựa trên Role
        switch (profile.role) {
          case "Admin":
            router.push("/admin/dashboard");
            break;
          case "Shop":
            router.push("/");
            break;
          default:
            router.push("/");
            break;
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="h-screen w-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white">
      {/* --- LEFT SIDE: LOGIN FORM --- */}
      <div className="flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 h-full w-full relative z-10 animate-in fade-in slide-in-from-left-8 duration-500">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center lg:text-left space-y-2">
            <Link
              href="/"
              className="inline-block mb-4 hover:opacity-80 transition-opacity"
            >
              <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
                Ameko<span className="text-[#ce2a32]">.</span>
              </h2>
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 font-oswald">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Error Alert Box */}
          {authError && (
            <div className="p-4 bg-red-50 text-[#ce2a32] text-sm rounded-lg border border-red-100 font-medium flex items-center gap-3 animate-pulse">
              <span className="bg-[#ce2a32] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                !
              </span>
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className=" text-black space-y-5">
            <InputField
              label="Email Address"
              placeholder="name@example.com"
              registration={register("username")}
              error={errors.username?.message}
            />

            <div className="space-y-1">
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                registration={register("password")}
                error={errors.password?.message}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-gray-500 hover:text-[#ce2a32] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Checkbox & Submit Button */}
            <div className="pt-2 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    {...register("remember")}
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[#ce2a32] peer-checked:border-[#ce2a32] transition-all"></div>
                  <svg
                    className="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors font-medium">
                  Keep me logged in
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-black text-white py-4 rounded-lg hover:bg-[#ce2a32] transition-all duration-300 font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-black hover:text-[#ce2a32] transition-colors uppercase tracking-wide ml-1 underline decoration-gray-300 underline-offset-4 hover:decoration-[#ce2a32]"
              >
                Sign Up Now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: VISUAL BANNER --- */}
      <div className="hidden lg:block relative h-full w-full overflow-hidden bg-black">
        <Image
          src="https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY_-MX-101_frontpage-1_hwu37j.jpg"
          alt="Ameko Login Banner"
          fill
          className="object-cover opacity-60 hover:scale-105 transition-transform duration-[20s]"
          priority
          quality={90}
        />

        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Floating Content */}
        <div className="absolute bottom-0 left-0 p-16 w-full max-w-2xl z-20">
          <div className="h-1.5 w-16 bg-[#ce2a32] mb-8" />
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] font-oswald mb-6 drop-shadow-lg">
            Craft Your <br />
            Perfect Keystroke.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-md font-medium text-shadow-sm">
            Join the community of enthusiasts. Build, share, and discover the
            ultimate mechanical keyboard experience.
          </p>
        </div>
      </div>
    </div>
  );
}
