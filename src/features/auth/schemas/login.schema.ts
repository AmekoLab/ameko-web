import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập email hoac tên đăng nhập"),

  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional(),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
