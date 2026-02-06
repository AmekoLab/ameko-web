// Định nghĩa cấu trúc phản hồi chuẩn từ Backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T; // Bỏ null để đỡ phải check nhiều, nếu null thì backend trả về object rỗng hoặc handle riêng
  errors?: unknown; // Dùng unknown thay vì any để strict type hơn
}

// Định nghĩa cấu trúc lỗi trả về (để fix lỗi Unexpected any)
export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>; // Ví dụ: lỗi validate form thường trả về object key-value
}

// Dữ liệu gửi lên (Request)
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

// Thêm Type cho Login Request
export interface LoginRequest {
  email: string; // API dùng email để login
  password: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token?: string;
  refreshToken?: string;
  image?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  storeAddress?: string | null;
  storeDescription?: string | null;
  status?: number;
  emailConfirmed?: boolean;
  banner?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  gender?: number;
  dateOfBirth?: string; // YYYY-MM-DD
  phoneNumber?: string;
  image?: string;
  storeAddress?: string;
  storeDescription?: string;
  banner?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string; // Mã OTP
  newPassword: string;
  confirmPassword: string;
}
