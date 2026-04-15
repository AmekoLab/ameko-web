import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ErrorResponse } from "@/src/types/auth.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1";

const LOCALE_PREFIX_REGEX = /^\/(en|vi)(?=\/|$)/;
const PUBLIC_PATHS = ["/", "/shop", "/assembled-product", "/about"];

const stripLocalePrefix = (path: string): string => {
  const stripped = path.replace(LOCALE_PREFIX_REGEX, "");
  return stripped === "" ? "/" : stripped;
};

const getLocalePrefix = (path: string): string => {
  const match = path.match(LOCALE_PREFIX_REGEX);
  return match ? `/${match[1]}` : "";
};

const isPublicPath = (path: string): boolean =>
  PUBLIC_PATHS.some((p) =>
    p === "/" ? path === "/" : path === p || path.startsWith(`${p}/`),
  );

const extractErrorMessage = (error: AxiosError): string => {
  const responseData = error.response?.data as
    | ErrorResponse
    | { message?: string }
    | undefined;

  return responseData?.message || error.message || "";
};

const handleAuthFailure = (reason: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    const rawPathname = window.location.pathname;
    const rawPathWithQuery = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const currentPath = stripLocalePrefix(rawPathname);
    const localePrefix = getLocalePrefix(rawPathname);
    const loginPath = `${localePrefix}/login`;
    const isPublicPage = isPublicPath(currentPath);
    const isLoginPage =
      currentPath === "/login" || currentPath.startsWith("/login/");

    if (!isPublicPage && !isLoginPage) {
      window.location.href = `${loginPath}?callbackUrl=${encodeURIComponent(rawPathWithQuery)}`;
    }
  }

  return Promise.reject(reason);
};

// 1. Khởi tạo instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
    if (
      error.code === "ECONNABORTED" ||
      (error.message && error.message.includes("timeout"))
    ) {
      return Promise.reject({
        success: false,
        message:
          "Network is unstable or server is not responding. Please try again later!",
        errors: "TIMEOUT",
      });
    }

    if (error.message === "Network Error") {
      return Promise.reject({
        success: false,
        message: "Disconnected from network! Please check your connection!",
        errors: "NETWORK_ERROR",
      });
    }

    const status = error.response?.status;
    const errorMessage = extractErrorMessage(error);

    if (status === 403) {
      // KHÔNG gọi handleAuthFailure() để giữ nguyên Token và trạng thái đăng nhập.
      // Chỉ trả về Promise.reject để giao diện (Component) tự bắt lỗi và hiện Toast.
      return Promise.reject({
        success: false,
        message: "ERROR_FORBIDDEN",
        errors: "FORBIDDEN",
      });
    }

    // 2. Xử lý lỗi Token hỏng (Mất User ID)
    if (errorMessage.toLowerCase().includes("user id not found in token")) {
      // Lỗi này bắt buộc phải xóa Token và đăng nhập lại
      return handleAuthFailure(error.response?.data || error);
    }

    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error.response?.data || error);
    } // A. Bỏ qua các API Auth (Login/Register...) để tránh vòng lặp

    if (
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register")
    ) {
      return Promise.reject(error.response?.data || error);
    } // B. Xử lý Refresh Token khi lỗi 401

    if (status === 401 && !originalRequest._retry) {
      if (typeof window !== "undefined") {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const userStr = localStorage.getItem("user");
          const userObj = userStr ? JSON.parse(userStr) : null;
          const userId = userObj?.id;

          if (!refreshToken || !userId) {
            return handleAuthFailure(new Error("Missing credentials"));
          } // Gọi Refresh Token (Dùng axios gốc để tránh interceptor này)

          const res = await axios.post(
            `${API_BASE_URL}/Users/refresh-token/${userId}`,
            { refreshToken: refreshToken },
          ); // Kiểm tra kết quả refresh

          if (res.data.success) {
            const { token: newAccessToken, refreshToken: newRefreshToken } =
              res.data.data; // Lưu token mới

            localStorage.setItem("token", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken); // Cập nhật header cho request cũ và gọi lại

            originalRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`,
            ); // Cập nhật mặc định cho các request sau

            api.defaults.headers.common["Authorization"] =
              `Bearer ${newAccessToken}`;

            return api(originalRequest);
          }
        } catch (refreshError) {
          return handleAuthFailure(refreshError);
        }
      }
    } // Trả về lỗi chuẩn

    return Promise.reject(error.response?.data || error);
  },
);

export default api;
