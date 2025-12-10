"use client";

import { InputField } from "@/src/components/ui/InputField";
import { useLoginForm } from "@/src/features/auth/hooks/useLoginForm";
import { useRouter } from "next/navigation";
import { getRedirectPath } from "@/src/services/authServices";
import { loginAndFetchProfile } from "@/src/store/action/authActions";
import { useAppDispatch } from "@/src/store/hook";
import { LoginSchemaType } from "@/src/features/auth/schemas/login.schema";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary-900">
          Đăng Nhập
        </h1>

        {/* Hiển thị lỗi chung từ Redux (nếu có) */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Username Input */}
          <InputField
            label="Email / Username"
            placeholder="Nhập email..."
            registration={register("username")}
            error={errors.username?.message}
          />

          {/* Password Input */}
          <InputField
            label="Mật khẩu"
            type="password"
            placeholder="••••••"
            registration={register("password")}
            error={errors.password?.message}
          />

          {/* Remember Me */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-600 rounded"
              {...register("remember")}
            />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
