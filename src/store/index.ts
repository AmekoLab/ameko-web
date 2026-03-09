import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import shopReducer from "./slices/shopSlice";
import adminUsersReducer from "./slices/adminUsersSlice";
import categoriesReducer from "./slices/categoriesSlice";
import partsReducer from "./slices/partsSlice";
import assembledProductsReducer from "./slices/assembledProductsSlice";
import builderReducer from "./slices/builderSlice";
import followsReducer from "./slices/followsSlice";
import walletReducer from "./slices/walletSlice";
import adminWalletReducer from "./slices/adminWalletSlice";
import voucherReducer from "./slices/voucherSlice";
import commissionReducer from "./slices/commissionSlice";
import orderReducer from "./slices/orderSlice";
import warrantyReducer from "./slices/warrantySlice";
import shopWarrantyReducer from "./slices/shopWarrantySlice";
import adminWarrantyReducer from "./slices/adminWarrantySlice";

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
    follows: followsReducer,
    wallet: walletReducer,
    adminWallet: adminWalletReducer,
    voucher: voucherReducer,
    commission: commissionReducer,
    order: orderReducer,
    warranty: warrantyReducer,
    shopWarranty: shopWarrantyReducer,
    adminWarranty: adminWarrantyReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
