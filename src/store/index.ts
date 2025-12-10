import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: userReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
