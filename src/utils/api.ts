import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ErrorResponse } from "@/src/types/auth.types";

// 1. Khởi tạo instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 2. REQUEST INTERCEPTOR: Tự động gắn Token vào Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // Cú pháp chuẩn để gắn header
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 3. RESPONSE INTERCEPTOR: Xử lý kết quả trả về & Refresh Token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 👇 QUAN TRỌNG: Trả về response.data để khớp với code cũ của bạn
    return response.data;
  },
  async (error: AxiosError) => {
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      return Promise.reject({
        success: false,
        message: "Network is unstable or server is not responding. Please try again later!",
        errors: "TIMEOUT"
      });
    }

    if (error.message === 'Network Error') {
      return Promise.reject({
        success: false,
        message: "Disconnected from network! Please check your connection!",
        errors: "NETWORK_ERROR"
      });
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // A. Bỏ qua các API Auth (Login/Register...) để tránh vòng lặp
    if (
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register")
    ) {
      return Promise.reject(error.response?.data || error);
    }

    // B. Xử lý Refresh Token khi lỗi 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        originalRequest._retry = true;

        // Helper: Clear auth storage & conditionally redirect
        const handleAuthFailure = (reason: unknown) => {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          const publicPaths = ["/", "/shop", "/assembled-product", "/about"];
          const currentPath = window.location.pathname;

          const isPublicPage = publicPaths.some((p) =>
            p === "/"
              ? currentPath === "/"
              : currentPath === p || currentPath.startsWith(p + "/"),
          );

          // Only redirect if NOT on a public page and NOT already on /login
          if (!isPublicPage && !currentPath.startsWith("/login")) {
            window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
          }

          return Promise.reject(reason);
        };

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const userStr = localStorage.getItem("user");
          const userObj = userStr ? JSON.parse(userStr) : null;
          const userId = userObj?.id;

          if (!refreshToken || !userId) {
            return handleAuthFailure(new Error("Missing credentials"));
          }

          // Gọi Refresh Token (Dùng axios gốc để tránh interceptor này)
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1"}/Users/refresh-token/${userId}`,
            { refreshToken: refreshToken },
          );

          // Kiểm tra kết quả refresh
          if (res.data.success) {
            const { token: newAccessToken, refreshToken: newRefreshToken } =
              res.data.data;

            // Lưu token mới
            localStorage.setItem("token", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // Cập nhật header cho request cũ và gọi lại
            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`,
            );

            // Cập nhật mặc định cho các request sau
            api.defaults.headers.common["Authorization"] =
              `Bearer ${newAccessToken}`;

            return api(originalRequest);
          }
        } catch (refreshError) {
          return handleAuthFailure(refreshError);
        }
      }
    }

    // Trả về lỗi chuẩn
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
