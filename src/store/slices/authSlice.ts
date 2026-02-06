import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserData } from "@/src/types/auth.types";

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  isInitialized: false, //Mặc định là false (Chưa check xong)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },

    updateProfileStart: (state) => {
      state.loading = true;
    },
    updateProfileSuccess: (state, action: PayloadAction<Partial<UserData>>) => {
      state.loading = false;
      state.error = null;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // THÊM ACTION NÀY ĐỂ BÁO ĐÃ CHECK TOKEN XONG
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setInitialized,
  updateProfileStart,
  updateProfileSuccess,
} = authSlice.actions;
export default authSlice.reducer;
