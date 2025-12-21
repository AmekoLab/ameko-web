"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { InputField } from "@/src/components/ui/InputField";
import { ArrowRight, User, Mail, Lock } from "lucide-react";

// đây là kiểu dữ liệu tạm thời
interface RegisterFormType {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormType>();

  const onSubmit = async (data: RegisterFormType) => {
    try {
      console.log("Register Data:", data);
      // TODO: Gọi API Register
      // await AuthService.register(data);

      // Thành công -> Chuyển về login hoặc trang chủ
      router.push("/login");
    } catch (error) {
      console.error("Đăng ký thất bại", error);
    }
  };

  return (
    <div className="h-screen w-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white">
      {/* --- LEFT SIDE: REGISTER FORM --- */}
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
              Create Account
            </h1>
            <p className="text-gray-500 text-sm">
              Join the community of creators & enthusiasts.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Full Name */}
            <InputField
              label="Display Name"
              placeholder="Ex: Tin Dev"
              registration={register("fullName", {
                required: "Name is required",
              })}
              error={errors.fullName?.message}
            />

            {/* Email */}
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

            {/* Phone Number */}
            <InputField
              label="Phone Number"
              type="tel"
              placeholder="Ex: +1234567890"
              registration={register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: "Invalid phone number",
                },
              })}
              error={errors.phoneNumber?.message}
            />

            {/* Password */}
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
                  // validate: (val) => val === password || "Passwords do not match"
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#ce2a32] focus:ring-[#ce2a32]"
                />
                <span className="text-xs text-gray-500 leading-tight">
                  I agree to Ameko&apos;s{" "}
                  <Link
                    href="/terms"
                    className="font-bold text-black hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-bold text-black hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full bg-black text-white py-3.5 rounded-sm hover:bg-[#ce2a32] transition-all duration-300 font-bold uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Get Started{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
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
        </div>
      </div>

      {/* --- RIGHT SIDE: VISUAL BANNER  */}
      <div className="hidden lg:block relative h-full w-full overflow-hidden bg-black">
        <Image
          src="https://res.cloudinary.com/doezwafgz/image/upload/v1765602790/1944c8e7dce82db7f058944f88fb73d8_wnw1tb.jpg"
          alt="Ameko Register Banner"
          fill
          className="object-cover opacity-70"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Floating Content */}
        <div className="absolute bottom-0 left-0 p-12 w-full max-w-xl z-20">
          <div className="h-1 w-12 bg-[#ce2a32] mb-6" />
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none font-oswald mb-4">
            Build Your <br />
            Legacy Today.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Every switch click tells a story. <br />
            Start your custom mechanical keyboard journey with thousands of
            builders worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
