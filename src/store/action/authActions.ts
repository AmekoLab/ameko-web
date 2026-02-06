import { AppDispatch } from "@/src/store/index";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  setInitialized,
  updateProfileStart,
  updateProfileSuccess,
} from "@/src/store/slices/authSlice";

import { authService } from "@/src/services/authServices";
import {
  ChangePasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from "@/src/types/auth.types";

// --- THUNK 1: LOGIN & FETCH PROFILE ---
export const loginAndFetchProfile =
  (credentials: LoginPayload) => async (dispatch: AppDispatch) => {
    dispatch(loginStart());

    try {
      // BƯỚC 1: Gọi Login
      const loginRes = await authService.login(credentials);

      if (!loginRes.success || !loginRes.data) {
        throw new Error(loginRes.message || "Login failed");
      }

      // Lấy ID và Token từ kết quả Login
      const { token, refreshToken, id, role } = loginRes.data;

      // Lưu Token ngay lập tức
      if (token) {
        localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      } else {
        throw new Error("Missing access token");
      }

      // BƯỚC 2: Gọi Profile bằng ID
      const profileRes = await authService.getProfile(id);

      if (!profileRes.success || !profileRes.data) {
        throw new Error("Failed to fetch user profile");
      }

      // BƯỚC 3: Ghép dữ liệu
      const fullUserData = {
        ...profileRes.data,
        role: role, // Ghép role từ Login
        token: token,
      };

      // Lưu thông tin cơ bản (ID & Role) để dùng cho Auto Login
      localStorage.setItem("user", JSON.stringify({ id, role }));

      dispatch(loginSuccess(fullUserData));
      return fullUserData;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

// --- THUNK 2: CHECK TOKEN  ---
export const checkTokenAndFetchProfile =
  () => async (dispatch: AppDispatch) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    // Trường hợp 1: Không có token
    if (!token || !userStr) {
      dispatch(logoutAction());
      dispatch(setInitialized());
      return;
    }

    // Trường hợp 2: Có token, đi check API
    try {
      const userObj = JSON.parse(userStr);
      dispatch(loginStart());

      const profileRes = await authService.getProfile(userObj.id);

      if (profileRes.success && profileRes.data) {
        const fullUserData = {
          ...profileRes.data,
          role: userObj.role,
          token: token,
        };
        dispatch(loginSuccess(fullUserData));
      } else {
        throw new Error("Invalid");
      }
    } catch (error) {
      dispatch(logoutAction());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      // Trường hợp 3: Dù API thành công hay lỗi, cuối cùng cũng phải báo là ĐÃ KHỞI TẠO XONG
      dispatch(setInitialized());
    }
  };

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    // 1. Gọi API Logout (nếu Backend có hỗ trợ) để hủy token trên server
    // Nếu API lỗi cũng không sao, vẫn tiếp tục logout ở client
    await authService.logout();
  } catch (error) {
    console.warn("Logout API warning:", error);
  } finally {
    // 2. Xóa sạch dữ liệu trong LocalStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }

    // 3. Dispatch action để reset state trong Redux về null
    dispatch(logoutAction());
  }
};

export const updateUserProfile =
  (userId: string, data: UpdateProfilePayload) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateProfileStart());

    try {
      const res = await authService.updateProfile(userId, data);

      if (res.success && res.data) {
        // Update Redux với dữ liệu mới trả về từ Server
        dispatch(updateProfileSuccess(res.data));

        // Cập nhật cả LocalStorage để F5 không bị mất dữ liệu mới
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        // Lưu ý: LocalStorage của bạn chỉ lưu {id, role} nên có thể không cần update dòng này,
        // nhưng nếu bạn có lưu full info thì cần merge vào.

        return res.data;
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Update failed";
      dispatch(loginFailure(errorMessage)); // Tạm dùng loginFailure để hiện lỗi
      throw error;
    }
  };

// --- THUNK 5: CHANGE PASSWORD ---
export const changeUserPassword =
  (userId: string, data: ChangePasswordPayload) =>
  async (dispatch: AppDispatch) => {
    try {
      const res = await authService.changePassword(userId, data);

      if (res.success) {
        return res; // Trả về thành công
      } else {
        throw new Error(res.message || "Password change failed");
      }
    } catch (error: any) {
      // Nếu muốn handle loading global thì dispatch action loadingStart/End ở đây
      // Nhưng với modal nhỏ thì handle local loading ở component tiện hơn
      throw error;
    }
  };

// --- THUNK 6: FORGOT PASSWORD (SEND OTP) ---
export const requestForgotPassword =
  (email: string) => async (dispatch: AppDispatch) => {
    dispatch(loginStart()); // Tận dụng state loading có sẵn
    try {
      const res = await authService.forgotPassword(email);

      if (res.success) {
        dispatch(loginFailure(""));
        return res;
      } else {
        throw new Error(res.message || "Sending OTP failed");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || "Error System";
      dispatch(loginFailure(msg));
      throw error;
    }
  };

// --- THUNK 7: RESET PASSWORD (CONFIRM OTP) ---
export const confirmResetPassword =
  (data: ResetPasswordPayload) => async (dispatch: AppDispatch) => {
    dispatch(loginStart());
    try {
      const res = await authService.resetPassword(data);

      if (res.success) {
        dispatch(loginFailure(""));
        return res;
      } else {
        throw new Error(res.message || "Password reset failed");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || "Error System";
      dispatch(loginFailure(msg));
      throw error;
    }
  };
