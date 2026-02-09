import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import shopReducer from "./slices/shopSlice";
import adminUsersReducer from "./slices/adminUsersSlice";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    shop: shopReducer,
    adminUsers: adminUsersReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
