import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema, LoginSchemaType } from "../schemas/login.schema";
import { useAppSelector } from "@/src/store/hook";

export const useLoginForm = () => {
  const { loading: isLoading, error: authError } = useAppSelector(
    (state) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    authError, // Lỗi từ Server trả về (ví dụ: Sai mật khẩu)
  };
};
