import {
  ApiResponse,
  ChangePasswordPayload,
  LoginRequest,
  RegisterRequest,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserData,
  VerifyOtpRequest,
} from "../types/auth.types";
import api from "../utils/api";

export const authService = {
  register: async (
    payload: RegisterRequest,
  ): Promise<ApiResponse<UserData>> => {
    return api.post("/Users/register", payload);
  },

  sendOtp: async (email: string): Promise<ApiResponse<{ email: string }>> => {
    return api.post("/Users/send-activation-code", JSON.stringify(email));
  },

  // API 3: Xác thực OTP
  verifyOtp: async (
    payload: VerifyOtpRequest,
  ): Promise<ApiResponse<{ email: string }>> => {
    return api.post("/Users/verify-activation-code", payload);
  },

  login: async (payload: LoginRequest): Promise<ApiResponse<UserData>> => {
    return api.post("/Users/login", payload);
  },

  logout: async () => {
    return Promise.resolve(); // Không làm gì cả, chỉ trả về thành công
  },

  // Hàm lấy profile
  getProfile: async (userId: string): Promise<ApiResponse<UserData>> => {
    return api.get(`/Users/profile/${userId}`);
  },

  updateProfile: async (userId: string, data: UpdateProfilePayload) => {
    return api.put<any, ApiResponse<UserData>>(
      `/Users/profile/${userId}`,
      data,
    );
  },

  changePassword: async (userId: string, data: ChangePasswordPayload) => {
    // Return type là any hoặc generic vì data trả về chỉ có userId
    return api.post<any, ApiResponse<any>>(
      `/Users/change-password/${userId}`,
      data,
    );
  },

  forgotPassword: async (email: string) => {
    return api.post<any, ApiResponse<any>>("/Users/forgot-password", { email });
  },

  resetPassword: async (data: ResetPasswordPayload) => {
    return api.post<any, ApiResponse<any>>("/Users/reset-password", data);
  },
};
