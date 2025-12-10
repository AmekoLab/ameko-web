import { AxiosError } from "axios";
import { LoginPayload } from "@/src/types/auth.types";
import { login as loginAPI, getProfile } from "@/src/services/authServices";

import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "@/src/store/slices/authSlice";
import { AppDispatch } from "@/src/store/index";
import api from "@/src/utils/api";

interface BackendErrorResponse {
  message: string;
}

export const loginAndFetchProfile =
  (data: LoginPayload) => async (dispatch: AppDispatch) => {
    dispatch(loginStart());
    try {
      // Gọi API Login
      const loginRes = await loginAPI(data);

      if (!loginRes) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      // Gọi API lấy Profile
      const profile = await getProfile();

      if (!profile) {
        throw new Error("Không thể lấy thông tin người dùng");
      }

      // Cập nhật Redux Store
      dispatch(loginSuccess(profile));

      return profile;
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      dispatch(loginFailure(errorMessage));

      throw err;
    }
  };

/**
 * THUNK: Tự động đăng nhập lại khi F5 (Check Token)
 * Tối ưu: Xử lý mượt mà cả trường hợp có token và không có token
 */
export const checkTokenAndFetchProfile =
  () => async (dispatch: AppDispatch) => {
    if (typeof window === "undefined") return;

    // 2. Lấy token từ storage ra
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    // Nếu không có token -> Logout
    if (!token) {
      dispatch(logoutAction());
      return;
    }

    // 🔥 QUAN TRỌNG: Gán lại Token vào Header ngay lập tức (Giống hệt lúc Login)
    // Để đảm bảo request getProfile ở dưới không bị 401
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    dispatch(loginStart());
    try {
      const profile = await getProfile();

      if (profile) {
        dispatch(loginSuccess(profile));
      } else {
        dispatch(logoutAction());
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"]; // Xóa header nếu lỗi
      }
    } catch (error) {
      dispatch(logoutAction());
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"]; // Xóa header nếu lỗi
    }
  };
