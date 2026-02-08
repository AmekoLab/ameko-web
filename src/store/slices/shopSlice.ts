import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { shopService } from "@/src/services/shopService";
import {
  ApproveShopPayload,
  PaginationParams,
  RegisterShopFormValues,
  ShopResponse,
  AdminShopListResponse,
  UpdateShopFormValues,
} from "@/src/types/shop.types";

// --- 1. THUNK: LẤY SHOP HIỆN TẠI
export const fetchCurrentShop = createAsyncThunk(
  "shop/fetchCurrentShop",
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopService.getMyShop();
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || "Lỗi hệ thống");
    }
  },
);

// --- 2. THUNK: ĐĂNG KÝ SHOP ---
export const registerShop = createAsyncThunk(
  "shop/register",
  async (data: RegisterShopFormValues, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("ShopName", data.shopName);
      formData.append("CitizenId", data.citizenId);
      formData.append("BankName", data.bankName);
      formData.append("Bio", data.bio || "");
      formData.append("Address", data.address);
      formData.append("PhoneNumber", data.phoneNumber);
      formData.append("TaxCode", data.taxCode);
      formData.append("BankAccountNumber", data.bankAccountNumber);
      formData.append("BankAccountName", data.bankAccountName);
      formData.append("ContactEmail", data.contactEmail);

      if (data.bannerImage && data.bannerImage[0]) {
        formData.append("BannerImage", data.bannerImage[0]);
      }
      if (data.logoImage && data.logoImage[0]) {
        formData.append("LogoImage", data.logoImage[0]);
      }

      const response = await shopService.registerShop(formData);

      // Dispatch lấy lại thông tin shop để cập nhật UI
      dispatch(fetchCurrentShop());

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

// --- 3. THUNK: ADMIN DUYỆT SHOP ---
export const adminApproveShop = createAsyncThunk(
  "shop/adminApprove",
  async (data: ApproveShopPayload, { rejectWithValue }) => {
    try {
      const response = await shopService.approveShop(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

// --- 4. THUNK: ADMIN LẤY DANH SÁCH ---
export const fetchAdminShopList = createAsyncThunk(
  "shop/fetchAdminList",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await shopService.getAdminShopList(page, size);
      // Ép kiểu về AdminShopListResponse để TypeScript hiểu
      return response.data as unknown as AdminShopListResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách",
      );
    }
  },
);

// --- 5. THUNK: CẬP NHẬT SHOP PROFILE (RESUBMIT KHI BỊ REJECTED) ---
export const updateShopProfile = createAsyncThunk(
  "shop/updateProfile",
  async (data: UpdateShopFormValues, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("ShopName", data.shopName);
      formData.append("BankName", data.bankName);
      formData.append("Bio", data.bio || "");
      formData.append("Address", data.address);
      formData.append("PhoneNumber", data.phoneNumber);
      formData.append("BankAccountNumber", data.bankAccountNumber);
      formData.append("BankAccountName", data.bankAccountName);
      formData.append("ContactEmail", data.contactEmail);

      if (data.bannerImage && data.bannerImage.length > 0) {
        formData.append("BannerImage", data.bannerImage[0]);
      }
      if (data.logoImage && data.logoImage.length > 0) {
        formData.append("LogoImage", data.logoImage[0]);
      }

      const response = await shopService.updateShopProfile(formData);

      // Lấy lại thông tin shop mới nhất sau khi update
      await dispatch(fetchCurrentShop());

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

// --- 6. THUNK: BAN SHOP ---
export const adminBanShop = createAsyncThunk(
  "shop/adminBan",
  async (shopId: string, { rejectWithValue }) => {
    try {
      await shopService.banShop(shopId);
      return shopId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

// --- 7. THUNK: UNBAN SHOP ---
export const adminUnbanShop = createAsyncThunk(
  "shop/adminUnban",
  async (shopId: string, { rejectWithValue }) => {
    try {
      await shopService.unbanShop(shopId);
      return shopId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

// --- STATE ---
interface ShopState {
  loading: boolean;
  error: string | null;
  currentShop: ShopResponse | null;
  adminShopList: ShopResponse[];
  adminPagination: PaginationParams | null;
}

const initialState: ShopState = {
  loading: false,
  error: null,
  currentShop: null,
  adminShopList: [],
  adminPagination: null,
};

// --- SLICE ---
const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    resetShopState: (state) => {
      state.currentShop = null;
      state.loading = false;
      state.error = null;
      state.adminShopList = [];
      state.adminPagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Fetch Current Shop
      .addCase(fetchCurrentShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentShop.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShop = action.payload;
      })
      .addCase(fetchCurrentShop.rejected, (state, action) => {
        state.loading = false;
        state.currentShop = null;
        if (action.payload) {
          state.error = action.payload as string;
        }
      })

      // 2. Fetch Admin Shop List
      .addCase(fetchAdminShopList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminShopList.fulfilled, (state, action) => {
        state.loading = false;
        state.adminShopList = action.payload.items;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminShopList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 3. Register Shop
      .addCase(registerShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerShop.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerShop.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Đăng ký Shop thất bại";
      })

      // 4. Admin Approve Shop
      .addCase(adminApproveShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminApproveShop.fulfilled, (state, action) => {
        state.loading = false;
        // Optimistic Update: Cập nhật status trong list ngay lập tức
        const { shopId, status } = action.meta.arg;
        const shopIndex = state.adminShopList.findIndex((s) => s.id === shopId);
        if (shopIndex !== -1) {
          state.adminShopList[shopIndex].status = status;
        }
      })
      .addCase(
        adminApproveShop.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Duyệt đơn thất bại";
        },
      )

      // 5. Update Shop Profile
      .addCase(updateShopProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShopProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(
        updateShopProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Cập nhật Shop thất bại";
        },
      )

      // 6. Ban Shop
      .addCase(adminBanShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminBanShop.fulfilled, (state, action) => {
        state.loading = false;
        const shopId = action.payload;
        const idx = state.adminShopList.findIndex((s) => s.id === shopId);
        if (idx !== -1) {
          state.adminShopList[idx].status = 4; // Banned
        }
      })
      .addCase(adminBanShop.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Ban shop thất bại";
      })

      // 7. Unban Shop
      .addCase(adminUnbanShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminUnbanShop.fulfilled, (state, action) => {
        state.loading = false;
        const shopId = action.payload;
        const idx = state.adminShopList.findIndex((s) => s.id === shopId);
        if (idx !== -1) {
          state.adminShopList[idx].status = 2; // Inactive (needs manual reactivation)
        }
      })
      .addCase(adminUnbanShop.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Unban shop thất bại";
      });
  },
});

export const { resetShopState } = shopSlice.actions;
export default shopSlice.reducer;
