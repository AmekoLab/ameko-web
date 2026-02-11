import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { builderService } from "@/src/services/builder.service";
import {
  BuilderSession,
  BuilderProduct,
  BuilderPayload,
} from "@/src/types/builder";
import { PartItem } from "@/src/types/part.types";

// ============================================================
// Async Thunks
// ============================================================

/** State 0 — Fetch base kits list */
export const fetchBaseKits = createAsyncThunk(
  "builder/fetchBaseKits",
  async (
    { shopId, categoryId }: { shopId: string; categoryId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await builderService.getBaseKits(shopId, categoryId);
      return response.data; // { data: PartItem[], total: number }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch base kits",
      );
    }
  },
);

/** Initialization — User selects a kit → POST /Builder/start */
export const startBuilderSession = createAsyncThunk(
  "builder/startSession",
  async (baseKitId: string, { rejectWithValue }) => {
    try {
      const payload = await builderService.startSession({ baseKitId });
      return payload; // BuilderPayload
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to start builder session",
      );
    }
  },
);

/** Loop — User selects a component → POST /Builder/select */
export const selectBuilderComponent = createAsyncThunk(
  "builder/selectComponent",
  async (
    {
      sessionId,
      selectedPartId,
      stepName,
    }: { sessionId: string; selectedPartId: string; stepName: string },
    { rejectWithValue },
  ) => {
    try {
      const payload = await builderService.selectComponent({
        sessionId,
        selectedPartId,
        stepName,
      });
      return payload; // BuilderPayload
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to select component",
      );
    }
  },
);

// ============================================================
// State Shape
// ============================================================

interface BuilderState {
  // Loading flags
  loadingKits: boolean;
  processing: boolean;
  error: string | null;

  // State 0: Kit selection
  baseKits: PartItem[];

  // State 1 & 2: Session-driven workspace
  session: BuilderSession | null;
  workflowSteps: string[];
  currentStepName: string | null;
  currentProducts: BuilderProduct[];
}

const initialState: BuilderState = {
  loadingKits: false,
  processing: false,
  error: null,
  baseKits: [],
  session: null,
  workflowSteps: [],
  currentStepName: null,
  currentProducts: [],
};

// ============================================================
// Helper: Apply BuilderPayload to state (reused by start & select)
// ============================================================
function applyBuilderPayload(state: BuilderState, payload: BuilderPayload) {
  state.session = payload.session;
  state.workflowSteps = payload.workflowSteps;

  if (payload.nextStep) {
    state.currentStepName = payload.nextStep.step.name;
    state.currentProducts = payload.nextStep.products;
  } else {
    // Complete — no next step
    state.currentStepName = null;
    state.currentProducts = [];
  }
}

// ============================================================
// Slice
// ============================================================

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    /** Full reset — back to kit selection */
    resetBuilder: () => initialState,

    /** Clear error */
    clearBuilderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- FETCH BASE KITS ---
    builder
      .addCase(fetchBaseKits.pending, (state) => {
        state.loadingKits = true;
        state.error = null;
      })
      .addCase(fetchBaseKits.fulfilled, (state, action) => {
        state.loadingKits = false;
        state.baseKits = action.payload.data;
      })
      .addCase(fetchBaseKits.rejected, (state, action) => {
        state.loadingKits = false;
        state.error = action.payload as string;
      })

      // --- START SESSION ---
      .addCase(startBuilderSession.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(startBuilderSession.fulfilled, (state, action) => {
        state.processing = false;
        applyBuilderPayload(state, action.payload);
      })
      .addCase(startBuilderSession.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      })

      // --- SELECT COMPONENT ---
      .addCase(selectBuilderComponent.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(selectBuilderComponent.fulfilled, (state, action) => {
        state.processing = false;
        applyBuilderPayload(state, action.payload);
      })
      .addCase(selectBuilderComponent.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetBuilder, clearBuilderError } = builderSlice.actions;
export default builderSlice.reducer;
