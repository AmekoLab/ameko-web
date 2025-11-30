"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "@/store";
import { Provider } from "react-redux";
import { checkTokenAndFetchProfile } from "@/store/action/authActions";

export default function LayoutWrapper({ children }) {
    return (
        <Provider store={store}>
            <InnerLayout>{children}</InnerLayout>
        </Provider>
    );
}

function InnerLayout({ children }) {
    const dispatch = useDispatch();
    const called = useRef(false);
    useEffect(() => {
        if (!called.current) {
            called.current = true;
            dispatch(checkTokenAndFetchProfile());
        }
    }, []);

    return (
        <>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="colored"
                pauseOnHover
                draggable
                closeOnClick
            />
        </>
    );
}
