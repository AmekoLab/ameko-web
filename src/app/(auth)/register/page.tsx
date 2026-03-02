"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InputField } from "@/src/components/ui/InputField";
import { ArrowRight } from "lucide-react";
import { authService } from "@/src/services/authServices";
import { RegisterRequest } from "@/src/types/auth.types";
import { toast } from "react-toastify";

interface RegisterFormType {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1: Register, 2: OTP
  const [emailForOtp, setEmailForOtp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormType>();

  // --- XỬ LÝ BƯỚC 1: ĐĂNG KÝ ---
  const onRegisterSubmit = async (data: RegisterFormType) => {
    // Validate confirm password
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);

      // 1. Tách FullName thành First/Last Name
      const nameParts = data.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || nameParts[0];

      // 2. Chuẩn bị payload khớp chuẩn API (Không còn phoneNumber)
      const payload: RegisterRequest = {
        username: data.email.split("@")[0],
        email: data.email,
        password: data.password,
        firstName: firstName,
        lastName: lastName,
      };

      // 3. Gọi API Register
      const res = await authService.register(payload);

      if (res.success) {
        // 4. Gửi OTP và chuyển bước
        await authService.sendOtp(payload.email);
        setEmailForOtp(payload.email);
        setStep(2);
      }
    } catch (error: any) {
      setError("root", {
        message: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ BƯỚC 2: XÁC THỰC OTP ---
  const onOtpVerify = async () => {
    if (!otpCode) return;
    try {
      setLoading(true);
      const res = await authService.verifyOtp({
        email: emailForOtp,
        code: otpCode,
      });

      if (res.success) {
        toast.success("Register successful! Redirecting to Login...", {
          onClose: () => router.push("/login"), // Chuyển trang khi toast đóng
        });
      }
    } catch (error: any) {
      alert("Verification failed: " + (error.message || "Invalid Code"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white">
      {/* --- LEFT SIDE: LOGIC FORMS --- */}
      <div className="flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 h-full w-full relative z-10 bg-white">
        <div className="w-full max-w-md space-y-5">
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
                Ameko<span className="text-[#ce2a32]">.</span>
              </h2>
            </Link>

            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-1 font-oswald">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-500 text-sm">
              {step === 1
                ? "Join the community of creators & enthusiasts."
                : `We sent a code to ${emailForOtp}. Check your inbox.`}
            </p>
          </div>

          {/* --- STEP 1: REGISTER FORM --- */}
          {step === 1 && (
            <form
              onSubmit={handleSubmit(onRegisterSubmit)}
              className="space-y-3"
            >
              <InputField
                label="Full Name"
                placeholder="Ex: Dat Nguyen"
                registration={register("fullName", {
                  required: "Name is required",
                })}
                error={errors.fullName?.message}
              />

              <InputField
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                registration={register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                error={errors.email?.message}
              />

              {/* Đã xóa trường Phone Number ở đây */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  registration={register("password", {
                    required: "Required",
                    minLength: { value: 6, message: "Min 6 chars" },
                  })}
                  error={errors.password?.message}
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  registration={register("confirmPassword", {
                    required: "Required",
                  })}
                  error={errors.confirmPassword?.message}
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#ce2a32] focus:ring-[#ce2a32]"
                  />
                  <span className="text-xs text-gray-500 leading-tight">
                    I agree to Ameko&apos;s Terms of Service and Privacy Policy.
                  </span>
                </label>
              </div>

              {errors.root && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                  ⚠️ {errors.root.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="group w-full bg-black text-white py-3.5 rounded-sm hover:bg-[#ce2a32] transition-all duration-300 font-bold uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Get Started{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* --- STEP 2: OTP FORM (Giữ nguyên) --- */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Activation Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#ce2a32] focus:border-transparent transition-all placeholder:text-gray-400 text-center text-2xl tracking-[0.5em] font-bold"
                  maxLength={6}
                />
              </div>

              <button
                onClick={onOtpVerify}
                disabled={loading || otpCode.length < 4}
                className="w-full bg-[#ce2a32] text-white py-3.5 rounded-sm hover:bg-red-700 transition-all font-bold uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify Account"}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-black underline mt-2"
              >
                Back to Register
              </button>
            </div>
          )}

          {/* Footer Link (Chỉ hiện ở Step 1) */}
          {step === 1 && (
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Already a member?{" "}
                <Link
                  href="/login"
                  className="font-bold text-black hover:text-[#ce2a32] transition-colors uppercase tracking-wide ml-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT SIDE: VISUAL BANNER --- */}
      <div className="hidden lg:block relative h-full w-full overflow-hidden bg-black">
        <Image
          src="https://res.cloudinary.com/doezwafgz/image/upload/v1765602790/1944c8e7dce82db7f058944f88fb73d8_wnw1tb.jpg"
          alt="Ameko Register Banner"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 w-full max-w-xl z-20">
          <div className="h-1 w-12 bg-[#ce2a32] mb-6" />
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none font-oswald mb-4">
            Build Your <br /> Legacy Today.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Every switch click tells a story. <br /> Start your custom
            mechanical keyboard journey with thousands of builders worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
