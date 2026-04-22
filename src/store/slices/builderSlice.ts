import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { builderService } from "@/src/services/builder.service";
import {
  BuilderSession,
  BuilderProduct,
  BuilderPayload,
  AddBuilderAddonPayload,
} from "@/src/types/builder";
import { PartItem } from "@/src/types/part.types";

// ============================================================
// Async Thunks
// ============================================================

/** State 0 — Fetch base kits list */
export const fetchBaseKits = createAsyncThunk(
  "builder/fetchBaseKits",
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await builderService.getBaseKits(shopId);
      return response.data; // { data: PartItem[], total: number }
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to fetch base kits",
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
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to start builder session",
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
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to select component",
      );
    }
  },
);

/** Remove — User removes a selected component → DELETE /Builder/session/{id}/part/{step} */
export const removeBuilderComponent = createAsyncThunk(
  "builder/removeComponent",
  async (
    { sessionId, stepName }: { sessionId: string; stepName: string },
    { rejectWithValue },
  ) => {
    try {
      const payload = await builderService.removeComponent(sessionId, stepName);
      return payload; // BuilderPayload
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to remove component",
      );
    }
  },
);

/** Fetch available addons */
export const fetchAvailableAddons = createAsyncThunk(
  "builder/fetchAvailableAddons",
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const data = await builderService.getAvailableAddons(sessionId);
      return data;
    } catch (error: unknown) {
      return rejectWithValue("Failed to load addons");
    }
  },
);

/** Add addon(s) to session */
export const addBuilderAddon = createAsyncThunk(
  "builder/addAddon",
  async (payload: AddBuilderAddonPayload, { rejectWithValue }) => {
    try {
      const responsePayload = await builderService.addAddon(payload);
      return responsePayload;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to add customization",
      );
    }
  },
);

/** Remove addon from session */
export const removeBuilderAddon = createAsyncThunk(
  "builder/removeAddon",
  async (
    { sessionId, componentId }: { sessionId: string; componentId: string },
    { rejectWithValue },
  ) => {
    try {
      const responsePayload = await builderService.removeAddon(
        sessionId,
        componentId,
      );
      return responsePayload;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.response?.data?.message || "Failed to remove customization",
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
  stepProducts: Record<string, BuilderProduct[]>;

  // Addons
  availableAddons: BuilderProduct[];
  loadingAddons: boolean;
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
  stepProducts: {},
  availableAddons: [],
  loadingAddons: false,
};

// ============================================================
// Helper: Apply BuilderPayload to state (reused by start & select)
// ============================================================
function applyBuilderPayload(state: BuilderState, payload: BuilderPayload) {
  state.session = payload.session;
  state.workflowSteps = payload.workflowSteps;

  if (payload.session.isComplete) {
    // Build complete — auto-navigate to virtual Summary step
    state.currentStepName = "summary";
    state.currentProducts = [];
  } else if (payload.nextStep) {
    state.currentStepName = payload.nextStep.step.name;
    state.currentProducts = payload.nextStep.products;
    // Cache products per step for free-flow navigation
    state.stepProducts[payload.nextStep.step.name] = payload.nextStep.products;
  } else {
    // Fallback — no next step and not complete
    state.currentStepName = "summary";
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

    /** Free-flow navigation — switch visible step without API call */
    setActiveStep: (state, action: PayloadAction<string>) => {
      const stepName = action.payload;
      state.currentStepName = stepName;
      state.currentProducts =
        stepName === "summary" ? [] : state.stepProducts[stepName] || [];
    },

    /** Optimistic select — instantly update selection before API resolves */
    optimisticSelect: (
      state,
      action: PayloadAction<{
        stepName: string;
        product: BuilderProduct;
      }>,
    ) => {
      const { stepName, product } = action.payload;
      if (!state.session) return;
      state.session.selection[stepName] = {
        id: product.partId,
        name: product.name,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
        quantity: 1,
        kitDesignOptionId: product.optionId,
        layerImageUrl: product.layerImageUrl,
        nextStepFilterRule: product.nextStepFilterRule || "",
      };
    },

    /** Optimistic remove — instantly clear selection before API resolves */
    optimisticRemove: (state, action: PayloadAction<string>) => {
      if (!state.session) return;
      const stepName = action.payload;
      // Remove this step and all subsequent steps from selection
      const stepIdx = state.workflowSteps.indexOf(stepName);
      if (stepIdx >= 0) {
        for (let i = stepIdx; i < state.workflowSteps.length; i++) {
          delete state.session.selection[state.workflowSteps[i]];
        }
      }
      state.session.isComplete = false;
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
      })

      // --- REMOVE COMPONENT ---
      .addCase(removeBuilderComponent.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(removeBuilderComponent.fulfilled, (state, action) => {
        state.processing = false;
        applyBuilderPayload(state, action.payload);
      })
      .addCase(removeBuilderComponent.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      })

      // --- FETCH ADDONS ---
      .addCase(fetchAvailableAddons.pending, (state) => {
        state.loadingAddons = true;
      })
      .addCase(fetchAvailableAddons.fulfilled, (state, action) => {
        state.loadingAddons = false;
        state.availableAddons = action.payload;
      })
      .addCase(fetchAvailableAddons.rejected, (state) => {
        state.loadingAddons = false;
      })

      // --- ADD ADDON ---
      .addCase(addBuilderAddon.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(addBuilderAddon.fulfilled, (state, action) => {
        state.processing = false;
        applyBuilderPayload(state, action.payload);
      })
      .addCase(addBuilderAddon.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      })

      // --- REMOVE ADDON ---
      .addCase(removeBuilderAddon.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(removeBuilderAddon.fulfilled, (state, action) => {
        state.processing = false;
        applyBuilderPayload(state, action.payload);
      })
      .addCase(removeBuilderAddon.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetBuilder,
  clearBuilderError,
  setActiveStep,
  optimisticSelect,
  optimisticRemove,
} = builderSlice.actions;
export default builderSlice.reducer;
