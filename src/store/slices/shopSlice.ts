import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { shopService } from "@/src/services/shopService";
import {
  ApproveShopPayload,
  PaginationParams,
  RegisterShopFormValues,
  ShopResponse,
} from "@/src/types/shop.types";

// --- 1. THUNK: LẤY SHOP HIỆN TẠI

export const fetchCurrentShop = createAsyncThunk(
  "shop/fetchCurrentShop",
  async (_, { rejectWithValue }) => {
    try {
      const response = await shopService.getMyShop();
      // Nếu thành công trả về data (Kiểu ShopResponse)
      return response.data;
    } catch (error: any) {
      //  TỐI ƯU: Nếu lỗi 404 (Not Found) -> Nghĩa là User chưa tạo Shop -> Return null
      if (error.response && error.response.status === 404) {
        return null;
      }
      // Các lỗi khác (500, mạng...) thì mới báo lỗi
      return rejectWithValue(error.response?.data?.message || "Lỗi hệ thống");
    }
  },
);

// --- 2. THUNK: ĐĂNG KÝ SHOP ---
export const registerShop = createAsyncThunk(
  "shop/register",
  async (data: RegisterShopFormValues, { rejectWithValue, dispatch }) => {
    try {
      // 1. Chuyển đổi Object sang FormData
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

      // 2. Xử lý File (Lấy file đầu tiên trong FileList)
      if (data.bannerImage && data.bannerImage[0]) {
        formData.append("BannerImage", data.bannerImage[0]);
      }
      if (data.logoImage && data.logoImage[0]) {
        formData.append("LogoImage", data.logoImage[0]);
      }

      // 3. Gọi API
      const response = await shopService.registerShop(formData);

      // Đăng ký xong -> Gọi ngay fetchCurrentShop để cập nhật State
      // Giúp UI chuyển từ "Register" -> "Pending" ngay lập tức
      dispatch(fetchCurrentShop());

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

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

export const fetchAdminShopList = createAsyncThunk(
  "shop/fetchAdminList",
  async (
    { page, size }: { page: number; size: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await shopService.getAdminShopList(page, size);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi lấy danh sách",
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
    // Hàm reset khi Logout
    resetShopState: (state) => {
      state.currentShop = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- XỬ LÝ FETCH CURRENT SHOP ---
      .addCase(fetchCurrentShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentShop.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật thông tin shop vào store (hoặc null nếu chưa có)
        state.currentShop = action.payload;
      })
      .addCase(fetchCurrentShop.rejected, (state, action) => {
        state.loading = false;
        state.currentShop = null;
        // Chỉ hiện lỗi nếu có payload (tránh lỗi undefined)
        if (action.payload) {
          state.error = action.payload as string;
        }
      })

      // --- XỬ LÝ FETCH DANH SÁCH SHOP ADMIN ---
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

      // --- XỬ LÝ REGISTER SHOP ---
      .addCase(registerShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerShop.fulfilled, (state) => {
        state.loading = false;
        // Không cần set currentShop ở đây vì đã dispatch fetchCurrentShop ở trên
      })
      .addCase(registerShop.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Đăng ký Shop thất bại";
      });

    builder
      .addCase(adminApproveShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminApproveShop.fulfilled, (state, action) => {
        // action.meta.arg chứa dữ liệu gửi đi (shopId, status)
        const { shopId, status } = action.meta.arg;

        // Tìm shop trong list và update status
        const shopIndex = state.adminShopList.findIndex((s) => s.id === shopId);
        if (shopIndex !== -1) {
          state.adminShopList[shopIndex].status = status;
          // Nếu API trả về data mới thì dùng data đó, không thì chỉ update status local
        }
        state.loading = false;
      })
      .addCase(
        adminApproveShop.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Duyệt đơn thất bại";
        },
      );
  },
});

export const { resetShopState } = shopSlice.actions;
export default shopSlice.reducer;
