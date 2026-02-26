import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { followsApi } from "@/src/services/follows.service";

export interface FollowsState {
  followingIds: string[];
  isLoading: boolean;
  error: string | null;
  followersCount: number;
}

const initialState: FollowsState = {
  followingIds: [],
  isLoading: false,
  error: null,
  followersCount: 0,
};

// --- 1. Thunk: Lấy toàn bộ danh sách đang theo dõi ---
export const fetchFollowingList = createAsyncThunk(
  "follows/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await followsApi.getFollowingList();
      if (response.success && response.data) {
        // Map từ [{ userId: "..." }] sang mảng string ["..."]
        return response.data.map((item: any) => item.userId);
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách follow",
      );
    }
  },
);

// --- 2. Thunk: Toggle Follow ---
export const toggleFollowUser = createAsyncThunk(
  "follows/toggleFollow",
  async (followedId: string, { rejectWithValue }) => {
    try {
      const response = await followsApi.toggleFollow({ followedId });
      if (response.success) {
        return followedId;
      }
      return rejectWithValue(response.errors);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi kết nối");
    }
  },
);

const followsSlice = createSlice({
  name: "follows",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Xử lý Fetch Danh Sách ---
      .addCase(fetchFollowingList.pending, (state) => {
        state.error = null;
      })
      .addCase(
        fetchFollowingList.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.followingIds = action.payload;
        },
      )
      .addCase(fetchFollowingList.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // --- Xử lý Toggle (Optimistic Update với mảng) ---
      .addCase(toggleFollowUser.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;

        const targetId = action.meta.arg;

        // Optimistic Update: Thêm hoặc xóa ID khỏi mảng ngay lập tức
        if (state.followingIds.includes(targetId)) {
          state.followingIds = state.followingIds.filter(
            (id) => id !== targetId,
          );
        } else {
          state.followingIds.push(targetId);
        }
      })
      .addCase(toggleFollowUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(toggleFollowUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;

        // Hoàn tác (Rollback) nếu gọi API lỗi
        const targetId = action.meta.arg;
        if (state.followingIds.includes(targetId)) {
          state.followingIds = state.followingIds.filter(
            (id) => id !== targetId,
          );
        } else {
          state.followingIds.push(targetId);
        }
      });
  },
});

export default followsSlice.reducer;
