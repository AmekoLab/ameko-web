import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const RegisterShopSchema = z.object({
  shopName: z.string().min(3, "Tên Shop tối thiểu 3 ký tự"),
  citizenId: z.string().min(9, "CCCD không hợp lệ"),
  bio: z.string().optional(),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  contactEmail: z.string().email("Email không hợp lệ"),

  // Thông tin ngân hàng
  bankName: z.string().min(1, "Vui lòng nhập tên ngân hàng"),
  bankAccountNumber: z.string().min(1, "Vui lòng nhập số tài khoản"),
  bankAccountName: z.string().min(1, "Vui lòng nhập tên chủ tài khoản"),
  taxCode: z.string().min(1, "Mã số thuế là bắt buộc"),

  // Validate File (FileList)
  logoImage: z
    .any()
    .refine((files) => files?.length > 0, "Vui lòng tải lên Logo"),
  bannerImage: z
    .any()
    .refine((files) => files?.length > 0, "Vui lòng tải lên Banner"),
});

export type RegisterShopSchemaType = z.infer<typeof RegisterShopSchema>;
