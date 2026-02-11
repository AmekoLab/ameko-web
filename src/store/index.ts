import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import shopReducer from "./slices/shopSlice";
import adminUsersReducer from "./slices/adminUsersSlice";
import categoriesReducer from "./slices/categoriesSlice";
import partsReducer from "./slices/partsSlice";
import assembledProductsReducer from "./slices/assembledProductsSlice";
import builderReducer from "./slices/builderSlice";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    cart: cartReducer,
    shop: shopReducer,
    adminUsers: adminUsersReducer,
    categories: categoriesReducer,
    parts: partsReducer,
    assembledProducts: assembledProductsReducer,
    builder: builderReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
