"use client";

import { FC, ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./index";

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
