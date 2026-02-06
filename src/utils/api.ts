import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ErrorResponse } from "@/src/types/auth.types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi xảy ra ở API Login, Register, Forgot Password... thì KHÔNG Refresh Token
    // Trả lỗi về ngay để Component hiển thị thông báo (ví dụ: "Sai mật khẩu")
    if (
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/forgot-password")
    ) {
      const errorData = error.response?.data as ErrorResponse | undefined;
      const errorMessage =
        errorData?.message || error.message || "Có lỗi xảy ra";
      return Promise.reject(errorData || { message: errorMessage });
    }

    // Nếu lỗi không phải 401 hoặc đã thử retry rồi thì trả lỗi luôn
    if (error.response?.status !== 401 || originalRequest._retry) {
      const errorData = error.response?.data as ErrorResponse | undefined;
      const errorMessage =
        errorData?.message || error.message || "Có lỗi xảy ra";
      return Promise.reject(errorData || { message: errorMessage });
    }

    // --- BẮT ĐẦU XỬ LÝ REFRESH TOKEN ---
    if (typeof window !== "undefined") {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        // 1. Lấy userId từ localStorage
        const userStr = localStorage.getItem("user");
        const userObj = userStr ? JSON.parse(userStr) : null;
        const userId = userObj?.id;

        // Nếu thiếu data quan trọng -> Logout luôn (tránh loop vô tận)
        if (!refreshToken || !userId) {
          throw new Error("Missing refresh token or user ID");
        }

        // 2. Gọi API Refresh Token
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/Users/refresh-token/${userId}`,
          { refreshToken: refreshToken },
        );

        if (res.data.success) {
          // 3. Lấy token mới từ response
          const { token: newAccessToken, refreshToken: newRefreshToken } =
            res.data.data;

          // 4. Lưu lại vào Storage
          localStorage.setItem("token", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // 5. Cập nhật header và gọi lại request cũ
          api.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session expired:", refreshError);

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Chỉ redirect về login nếu đang không ở trang login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
