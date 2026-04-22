import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "@/src/services/category.service";
import {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/src/types/category.types";

// --- THUNK: GET CATEGORIES ---
export const fetchCategories = createAsyncThunk(
  "categories/fetchList",
  async (shopId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(shopId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

// --- THUNK: CREATE CATEGORY ---
export const createCategory = createAsyncThunk(
  "categories/create",
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to create category",
      );
    }
  },
);

// --- THUNK: UPDATE CATEGORY ---
export const updateCategory = createAsyncThunk(
  "categories/update",
  async (payload: UpdateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to update category",
      );
    }
  },
);

// --- THUNK: DELETE CATEGORY ---
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to delete category",
      );
    }
  },
);

// --- STATE ---
interface CategoriesState {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  categories: CategoryItem[];
}

const initialState: CategoriesState = {
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  categories: [],
};

// --- SLICE ---
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    resetCategoriesState: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- CREATE CATEGORY ---
      .addCase(createCategory.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // --- UPDATE CATEGORY ---
      .addCase(updateCategory.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // --- DELETE CATEGORY ---
      .addCase(deleteCategory.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.deleting = false;
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload,
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCategoriesState } = categoriesSlice.actions;
export default categoriesSlice.reducer;
