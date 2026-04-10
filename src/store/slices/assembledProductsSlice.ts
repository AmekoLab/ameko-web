import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { assembledProductService } from "@/src/services/assembledProduct.service";
import {
  AssembledProductListData,
  CreateAssembledProductPayload,
  UpdateAssembledProductPayload,
} from "@/src/types/assembledProduct.types";

// --- THUNK: GET ASSEMBLED PRODUCTS ---
export const fetchAssembledProducts = createAsyncThunk(
  "assembledProducts/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await assembledProductService.getAssembledProducts();
      // response.data = { items, totalCount, currentPage, ... }
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch assembled products",
      );
    }
  },
);

// --- THUNK: GET MY ASSEMBLED PRODUCTS ---
export const fetchMyAssembledProducts = createAsyncThunk(
  "assembledProducts/fetchMyList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await assembledProductService.getMyAssembledProducts();
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch my assembled products",
      );
    }
  },
);



// --- THUNK: RESTORE ASSEMBLED PRODUCT ---
export const restoreAssembledProduct = createAsyncThunk(
  "assembledProducts/restore",
  async (id: string, { rejectWithValue }) => {
    try {
      const response =
        await assembledProductService.restoreAssembledProduct(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to restore assembled product",
      );
    }
  },
);

// --- THUNK: GET ASSEMBLED PRODUCT DETAIL ---
export const fetchAssembledProductDetail = createAsyncThunk(
  "assembledProducts/fetchDetail",
  async (id: string, { rejectWithValue }) => {
    try {
      const response =
        await assembledProductService.getAssembledProductDetail(id);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch assembled product detail",
      );
    }
  },
);

// --- THUNK: CREATE ASSEMBLED PRODUCT ---
export const createAssembledProduct = createAsyncThunk(
  "assembledProducts/create",
  async (payload: CreateAssembledProductPayload, { rejectWithValue }) => {
    try {
      const response =
        await assembledProductService.createAssembledProduct(payload);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to create assembled product",
      );
    }
  },
);

// --- THUNK: UPDATE ASSEMBLED PRODUCT ---
export const updateAssembledProduct = createAsyncThunk(
  "assembledProducts/update",
  async (payload: UpdateAssembledProductPayload, { rejectWithValue }) => {
    try {
      const response =
        await assembledProductService.updateAssembledProduct(payload);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update assembled product",
      );
    }
  },
);

// --- THUNK: DELETE ASSEMBLED PRODUCT ---
export const deleteAssembledProduct = createAsyncThunk(
  "assembledProducts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await assembledProductService.deleteAssembledProduct(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete assembled product",
      );
    }
  },
);

// --- STATE ---
import { AssembledProductItem } from "@/src/types/assembledProduct.types";

interface AssembledProductsState {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  restoring: boolean;
  detailLoading: boolean;
  error: string | null;
  assembledProducts: AssembledProductItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  selectedProduct: AssembledProductItem | null;
}

const initialState: AssembledProductsState = {
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  restoring: false,
  detailLoading: false,
  error: null,
  assembledProducts: [],
  total: 0,
  currentPage: 1,
  pageSize: 50,
  totalPages: 1,
  selectedProduct: null,
};

// --- SLICE ---
const assembledProductsSlice = createSlice({
  name: "assembledProducts",
  initialState,
  reducers: {
    resetAssembledProductsState: (state) => {
      state.assembledProducts = [];
      state.total = 0;
      state.loading = false;
      state.error = null;
    },
    clearSelectedAssembledProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH LIST ---
      .addCase(fetchAssembledProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssembledProducts.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload as AssembledProductListData;
        state.assembledProducts = data.items ?? [];
        state.total = data.totalCount ?? data.items?.length ?? 0;
        state.currentPage = data.currentPage ?? 1;
        state.pageSize = data.pageSize ?? 50;
        state.totalPages = data.totalPages ?? 1;
      })
      .addCase(fetchAssembledProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- FETCH MY LIST ---
      .addCase(fetchMyAssembledProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAssembledProducts.fulfilled, (state, action) => {
        state.loading = false;
        // The new API returns the array directly, no .items property
        const items = action.payload as AssembledProductItem[]; 
        
        state.assembledProducts = items || [];
        state.total = items?.length || 0;
        
        // Since it's a full list without pagination metadata, set defaults
        state.currentPage = 1;
        state.pageSize = items?.length || 50; 
        state.totalPages = 1;
      })
      .addCase(fetchMyAssembledProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- RESTORE ---
      .addCase(restoreAssembledProduct.pending, (state) => {
        state.restoring = true;
        state.error = null;
      })
      .addCase(restoreAssembledProduct.fulfilled, (state) => {
        state.restoring = false;
      })
      .addCase(restoreAssembledProduct.rejected, (state, action) => {
        state.restoring = false;
        state.error = action.payload as string;
      })
      // --- FETCH DETAIL ---
      .addCase(fetchAssembledProductDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchAssembledProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchAssembledProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      // --- CREATE ---
      .addCase(createAssembledProduct.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createAssembledProduct.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createAssembledProduct.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // --- UPDATE ---
      .addCase(updateAssembledProduct.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateAssembledProduct.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateAssembledProduct.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // --- DELETE ---
      .addCase(deleteAssembledProduct.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteAssembledProduct.fulfilled, (state) => {
        state.deleting = false;
      })
      .addCase(deleteAssembledProduct.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAssembledProductsState, clearSelectedAssembledProduct } =
  assembledProductsSlice.actions;
export default assembledProductsSlice.reducer;
