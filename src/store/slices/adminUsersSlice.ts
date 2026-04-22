import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userManagementService } from "@/src/services/userManagement.service";
import {
  AdminUserItem,
  AdminUserPagination,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/src/types/admin.types";

// --- 1. THUNK: LẤY DANH SÁCH USER ---
export const fetchAdminUserList = createAsyncThunk(
  "adminUsers/fetchList",
  async (
    { currentPage, pageSize }: { currentPage: number; pageSize: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await userManagementService.getUserList(
        currentPage,
        pageSize,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to fetch user list",
      );
    }
  },
);

// --- 2. THUNK: TẠO USER MỚI ---
export const adminCreateUser = createAsyncThunk(
  "adminUsers/createUser",
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      const response = await userManagementService.createUser(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to create user",
      );
    }
  },
);

// --- 3. THUNK: CẬP NHẬT USER ---
export const adminUpdateUser = createAsyncThunk(
  "adminUsers/updateUser",
  async (
    { userId, payload }: { userId: string; payload: UpdateUserPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await userManagementService.updateUser(userId, payload);
      return { userId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to update user",
      );
    }
  },
);

// --- STATE ---
interface AdminUsersState {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
  userList: AdminUserItem[];
  pagination: AdminUserPagination | null;
}

const initialState: AdminUsersState = {
  loading: false,
  creating: false,
  updating: false,
  error: null,
  userList: [],
  pagination: null,
};

// --- SLICE ---
const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    resetAdminUsersState: (state) => {
      state.userList = [];
      state.pagination = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUserList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserList.fulfilled, (state, action) => {
        state.loading = false;
        state.userList = action.payload.items;
        state.pagination = {
          totalCount: action.payload.totalCount,
          currentPage: action.payload.currentPage,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          hasPreviousPage: action.payload.hasPreviousPage,
          hasNextPage: action.payload.hasNextPage,
        };
      })
      .addCase(fetchAdminUserList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- CREATE USER ---
      .addCase(adminCreateUser.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(adminCreateUser.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(adminCreateUser.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // --- UPDATE USER ---
      .addCase(adminUpdateUser.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(adminUpdateUser.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(adminUpdateUser.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAdminUsersState } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
