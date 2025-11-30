import {
  login as loginAPI,
  getProfile,
  redirectByRole,
} from "@/services/authServices";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "@/store/slices/authSlice";

export const loginAndFetchProfile =
  ({ username, password, remember }) =>
  async (dispatch) => {
    dispatch(loginStart());
    try {
      await loginAPI({ username, password, remember });

      const profile = await getProfile();
      dispatch(loginSuccess(profile));
      redirectByRole(profile.role);
    } catch (err) {
      dispatch(loginFailure(err?.message || "Login thất bại"));
    }
  };

export const checkTokenAndFetchProfile = () => async (dispatch) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return;

  dispatch(loginStart());
  try {
    const profile = await getProfile();
    dispatch(loginSuccess(profile));
    redirectByRole(profile.role);
  } catch (err) {
    dispatch(logoutAction());
  }
};
