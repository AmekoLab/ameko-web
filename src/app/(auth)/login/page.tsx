"use client";

import Link from "next/link";
import Image from "next/image";
import { useLoginForm } from "@/src/features/auth/hooks/useLoginForm";
import { useRouter } from "next/navigation";
import { getRedirectPath } from "@/src/services/authServices";
import { loginAndFetchProfile } from "@/src/store/action/authActions";
import { useAppDispatch } from "@/src/store/hook";
import { LoginSchemaType } from "@/src/features/auth/schemas/login.schema";
import { InputField } from "@/src/components/ui/InputField";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { register, handleSubmit, errors, isLoading, authError } =
    useLoginForm();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const profile = await dispatch(
        loginAndFetchProfile({
          username: data.username,
          password: data.password,
          remember: data.remember,
        })
      );

      if (profile) {
        const path = getRedirectPath(profile.role);
        router.push(path);
      }
    } catch (error) {
      console.error("Login thất bại", error);
    }
  };

  return (
    <div className="h-screen w-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white">
      {/* --- LEFT SIDE: LOGIN FORM --- */}

      <div className="flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 h-full w-full relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
                Ameko<span className="text-[#ce2a32]">.</span>
              </h2>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-1 font-oswald">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 bg-red-50 text-[#ce2a32] text-sm rounded-sm border-l-4 border-[#ce2a32] font-medium animate-pulse">
              ⚠️ {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Email or Username"
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

            {/* Remember & Submit */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none mb-4 group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#ce2a32] focus:ring-[#ce2a32]"
                  {...register("remember")}
                />
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                  Keep me logged in
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-black text-white py-3.5 rounded-sm hover:bg-[#ce2a32] transition-all duration-300 font-bold uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-black hover:text-[#ce2a32] transition-colors uppercase tracking-wide ml-1"
              >
                Sign Up
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
          className="object-cover opacity-60"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        {/* Floating Content */}
        <div className="absolute bottom-0 left-0 p-12 w-full max-w-xl z-20">
          <div className="h-1 w-12 bg-[#ce2a32] mb-6" />
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none font-oswald mb-4">
            Craft Your <br />
            Perfect Keystroke.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Join the community of enthusiasts. Build, share, and discover the
            ultimate mechanical keyboard experience.
          </p>
        </div>
      </div>
    </div>
  );
}
