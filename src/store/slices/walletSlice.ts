import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { walletService } from "@/src/services/wallet.service";
import { toast } from "react-toastify";

// ─── Types ───────────────────────────────────────────────
export interface WalletDetails {
  balance: number;
}

interface WalletState {
  details: WalletDetails | null;
  loading: boolean;
  error: string | null;
  hasPin: boolean | null;
  pinSetupLoading: boolean;
  withdrawLoading: boolean;
  isRequestingOtp: boolean;
  isResettingPin: boolean;
  isChangingPin: boolean;
}

const initialState: WalletState = {
  details: null,
  loading: false,
  error: null,
  hasPin: null,
  pinSetupLoading: false,
  withdrawLoading: false,
  isRequestingOtp: false,
  isResettingPin: false,
  isChangingPin: false,
};

// ─── Async Thunk: Fetch wallet details ───────────────────
export const fetchWalletDetails = createAsyncThunk(
  "wallet/fetchWalletDetails",
  async (_, { rejectWithValue }) => {
    try {
      const res = await walletService.getDetails();
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to fetch wallet details");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch wallet details");
    }
  },
);

// ─── Async Thunk: Check PIN status ──────────────────────
export const checkPinStatus = createAsyncThunk(
  "wallet/checkPinStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await walletService.getPinStatus();
      if (res.success) {
        return res.data.hasPin;
      }
      return rejectWithValue(res.message || "Failed to check PIN status");
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Failed to check PIN status");
    }
  },
);

// ─── Async Thunk: Setup wallet PIN ──────────────────────
export const setupWalletPin = createAsyncThunk(
  "wallet/setupWalletPin",
  async (
    payload: { currentPassword: string; newPin: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const res = await walletService.setupPin(payload);
      if (res.success) {
        toast.success(res.message || "PIN setup successfully");
        dispatch(checkPinStatus());
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to setup PIN");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to setup PIN");
      return rejectWithValue(err.message || "Failed to setup PIN");
    }
  },
);

// ─── Async Thunk: Request withdraw ──────────────────────
export const requestWithdraw = createAsyncThunk(
  "wallet/requestWithdraw",
  async (
    payload: { amount: number; walletPin: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const res = await walletService.withdraw(payload);
      if (res.success) {
        toast.success(
          res.message ||
            "Withdrawal request submitted successfully. Please wait for Admin approval.",
        );
        dispatch(fetchWalletDetails());
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to request withdrawal");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to request withdrawal");
      return rejectWithValue(err.message || "Failed to request withdrawal");
    }
  },
);

// ─── Async Thunk: Initialize wallet ─────────────────────
export const initializeWallet = createAsyncThunk(
  "wallet/initializeWallet",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await walletService.initWallet();
      if (res.success) {
        toast.success(res.message || "Wallet initialized successfully");
        dispatch(fetchWalletDetails());
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to initialize wallet");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to initialize wallet");
      return rejectWithValue(err.message || "Failed to initialize wallet");
    }
  },
);

// ─── Async Thunk: Request PIN reset OTP ─────────────
export const requestPinReset = createAsyncThunk(
  "wallet/requestPinReset",
  async (_, { rejectWithValue }) => {
    try {
      const res = await walletService.forgotPin();
      if (res.success) {
        toast.success(
          res.message ||
            "OTP has been sent to your email. Please check inbox/spam.",
        );
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to request OTP");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to request OTP");
      return rejectWithValue(err.message || "Failed to request OTP");
    }
  },
);

// ─── Async Thunk: Submit PIN reset ──────────────────
export const submitPinReset = createAsyncThunk(
  "wallet/submitPinReset",
  async (payload: { otp: string; newPin: string }, { rejectWithValue }) => {
    try {
      const res = await walletService.resetPin(payload);
      if (res.success) {
        toast.success(res.message || "Wallet PIN has been reset successfully.");
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to reset PIN");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to reset PIN");
      return rejectWithValue(err.message || "Failed to reset PIN");
    }
  },
);

// ─── Async Thunk: Change wallet PIN ─────────────────
export const changeWalletPin = createAsyncThunk(
  "wallet/changeWalletPin",
  async (
    payload: { oldPin: string; newPin: string; confirmNewPin: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await walletService.changePin(payload);
      if (res.success) {
        toast.success(res.message || "Wallet PIN changed successfully.");
        return res.data;
      }
      return rejectWithValue(res.message || "Failed to change PIN");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to change PIN");
      return rejectWithValue(err.message || "Failed to change PIN");
    }
  },
);

// ─── Slice ───────────────────────────────────────────────
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    resetWallet: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchWalletDetails
    builder
      .addCase(fetchWalletDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload;
      })
      .addCase(fetchWalletDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // checkPinStatus
    builder
      .addCase(checkPinStatus.fulfilled, (state, action) => {
        state.hasPin = action.payload;
      })
      .addCase(checkPinStatus.rejected, (state) => {
        state.hasPin = null;
      });

    // setupWalletPin
    builder
      .addCase(setupWalletPin.pending, (state) => {
        state.pinSetupLoading = true;
        state.error = null;
      })
      .addCase(setupWalletPin.fulfilled, (state) => {
        state.pinSetupLoading = false;
        state.hasPin = true;
      })
      .addCase(setupWalletPin.rejected, (state, action) => {
        state.pinSetupLoading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // requestWithdraw
    builder
      .addCase(requestWithdraw.pending, (state) => {
        state.withdrawLoading = true;
        state.error = null;
      })
      .addCase(requestWithdraw.fulfilled, (state) => {
        state.withdrawLoading = false;
      })
      .addCase(requestWithdraw.rejected, (state, action) => {
        state.withdrawLoading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // initializeWallet
    builder
      .addCase(initializeWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeWallet.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // requestPinReset
    builder
      .addCase(requestPinReset.pending, (state) => {
        state.isRequestingOtp = true;
        state.error = null;
      })
      .addCase(requestPinReset.fulfilled, (state) => {
        state.isRequestingOtp = false;
      })
      .addCase(requestPinReset.rejected, (state, action) => {
        state.isRequestingOtp = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // submitPinReset
    builder
      .addCase(submitPinReset.pending, (state) => {
        state.isResettingPin = true;
        state.error = null;
      })
      .addCase(submitPinReset.fulfilled, (state) => {
        state.isResettingPin = false;
        state.hasPin = true;
      })
      .addCase(submitPinReset.rejected, (state, action) => {
        state.isResettingPin = false;
        state.error = (action.payload as string) || "Unknown error";
      });

    // changeWalletPin
    builder
      .addCase(changeWalletPin.pending, (state) => {
        state.isChangingPin = true;
        state.error = null;
      })
      .addCase(changeWalletPin.fulfilled, (state) => {
        state.isChangingPin = false;
      })
      .addCase(changeWalletPin.rejected, (state, action) => {
        state.isChangingPin = false;
        state.error = (action.payload as string) || "Unknown error";
      });
  },
});

export const { resetWallet } = walletSlice.actions;
export default walletSlice.reducer;
