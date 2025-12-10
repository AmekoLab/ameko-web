import { LoginPayload, LoginResponse } from "@/src/types/auth.types";
import { UserProfile } from "@/src/types/user.types";

import { toast } from "react-toastify";
import api from "../utils/api";

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    username: data.username,
    password: data.password,
  });

  const { token } = response.data;

  if (data.remember) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }

  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  toast.success("Đăng nhập thành công!");

  return response.data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/profile");
  return response.data;
};

// --- GET TOKEN (Helper) ---
export const getToken = () => {
  if (typeof window === "undefined") return null; // Check SSR
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// --- LOGOUT ---
export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  toast.info("Đã đăng xuất.");

  window.location.href = "/login";
};

export const getRedirectPath = (role: string | null | undefined): string => {
  if (!role) return "/login";

  const adminRoles = ["Collector", "Admin"]; // Mở rộng thêm role nếu cần

  // Logic phân quyền đường dẫn
  if (adminRoles.includes(role)) {
    return "/dashboard";
  }

  return "/profile";
};
