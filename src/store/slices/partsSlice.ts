import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { partService } from "@/src/services/part.service";
import {
  PartItem,
  CreatePartPayload,
  UpdatePartPayload,
  CheckStockPayload,
  CheckStockData,
} from "@/src/types/part.types";

// --- THUNK: GET PARTS ---
export const fetchParts = createAsyncThunk(
  "parts/fetchList",
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await partService.getParts(shopId);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch parts",
      );
    }
  },
);

// --- THUNK: GET PART DETAIL ---
export const fetchPartDetail = createAsyncThunk(
  "parts/fetchDetail",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await partService.getPartDetail(slug);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch part detail",
      );
    }
  },
);

// --- THUNK: CREATE PART ---
export const createPart = createAsyncThunk(
  "parts/create",
  async (payload: CreatePartPayload, { rejectWithValue }) => {
    try {
      const response = await partService.createPart(payload);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to create part",
      );
    }
  },
);

// --- THUNK: CHECK STOCK ---
export const checkStock = createAsyncThunk(
  "parts/checkStock",
  async (payload: CheckStockPayload, { rejectWithValue }) => {
    try {
      const response = await partService.checkStock(payload);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to check stock",
      );
    }
  },
);

// --- THUNK: DELETE PART ---
export const deletePart = createAsyncThunk(
  "parts/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await partService.deletePart(id);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete part",
      );
    }
  },
);

// --- THUNK: UPDATE PART ---
export const updatePart = createAsyncThunk(
  "parts/update",
  async (payload: UpdatePartPayload, { rejectWithValue }) => {
    try {
      const response = await partService.updatePart(payload);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update part",
      );
    }
  },
);

// --- STATE ---
interface PartsState {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  checkingStock: boolean;
  detailLoading: boolean;
  error: string | null;
  parts: PartItem[];
  total: number;
  selectedPart: PartItem | null;
  stockMap: CheckStockData | null;
}

const initialState: PartsState = {
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  checkingStock: false,
  detailLoading: false,
  error: null,
  parts: [],
  total: 0,
  selectedPart: null,
  stockMap: null,
};

// --- SLICE ---
const partsSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    resetPartsState: (state) => {
      state.parts = [];
      state.total = 0;
      state.loading = false;
      state.error = null;
    },
    clearSelectedPart: (state) => {
      state.selectedPart = null;
    },
    clearStockMap: (state) => {
      state.stockMap = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.parts = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- FETCH PART DETAIL ---
      .addCase(fetchPartDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchPartDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedPart = action.payload;
      })
      .addCase(fetchPartDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      // --- CREATE PART ---
      .addCase(createPart.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPart.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createPart.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // --- UPDATE PART ---
      .addCase(updatePart.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePart.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updatePart.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // --- DELETE PART ---
      .addCase(deletePart.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deletePart.fulfilled, (state) => {
        state.deleting = false;
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      })
      // --- CHECK STOCK ---
      .addCase(checkStock.pending, (state) => {
        state.checkingStock = true;
        state.error = null;
      })
      .addCase(checkStock.fulfilled, (state, action) => {
        state.checkingStock = false;
        state.stockMap = action.payload;
      })
      .addCase(checkStock.rejected, (state, action) => {
        state.checkingStock = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPartsState, clearSelectedPart, clearStockMap } =
  partsSlice.actions;
export default partsSlice.reducer;
