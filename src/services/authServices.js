import api from "@/utils/api";
import { toast } from "react-toastify";

export const login = async ({ username, password, remember = false }) => {
  try {
    const response = await api.post("auth/login", { username, password });
    const { token } = response.data;
    if (remember) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
    toast.success("Đăng nhập thành công!");
    return response.data;
  } catch (error) {
    toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("users/profile");
    return response.data;
  } catch (error) {
    toast.error("Không thể lấy thông tin người dùng.");
  }
};

export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  toast.info("Đã đăng xuất.");
};

export const redirectByRole = (role) => {
  if (!role) return (window.location.href = "/login");

  const adminRoles = ["Collector"];
  const path = adminRoles.includes(role) ? "/dashboard" : "/profile";

  const currentPath = window.location.pathname;
  if (currentPath === "/login" || currentPath === "/") {
    window.location.href = path;
  }
};
