import { z } from "zod";

export const UpdateShopSchema = z.object({
  shopName: z.string().min(3, "Tên Shop tối thiểu 3 ký tự"),
  bio: z.string().optional(),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  contactEmail: z.string().email("Email không hợp lệ"),
  bankName: z.string().min(1, "Vui lòng nhập tên ngân hàng"),
  bankAccountNumber: z.string().min(1, "Vui lòng nhập số tài khoản"),
  bankAccountName: z.string().min(1, "Vui lòng nhập tên chủ tài khoản"),
  logoImage: z.any().optional(),
  bannerImage: z.any().optional(),
});

export type UpdateShopSchemaType = z.infer<typeof UpdateShopSchema>;
