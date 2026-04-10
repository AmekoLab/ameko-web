import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { UserData } from "@/src/types/auth.types";
import { authService } from "@/src/services/authServices";

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

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile(userId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch profile");
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching profile");
    }
  }
);

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
  extraReducers: (builder) => {
    builder.addCase(fetchProfileThunk.fulfilled, (state, action) => {
      // Update the user state with the latest profile data
      if (state.user && state.user.id === action.payload.id) {
         state.user = { ...state.user, ...action.payload };
      } else if (!state.user) {
         state.user = action.payload;
      }
    });
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
