import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/src/types/user.types";

interface AuthState {
  user: UserProfile | null;
  role: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserProfile>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.role = action.payload?.role || null;
      state.error = null;
      state.isAuthenticated = true;

      state.isInitialized = true;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;

      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = false;

      state.isInitialized = true;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;

export default authSlice.reducer;
