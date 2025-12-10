"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { store } from "@/src/store";
import AuthProvider from "@/src/providers/AuthProvider";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </Provider>
  );
}
