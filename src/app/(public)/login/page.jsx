"use client";

import { useState } from "react";
import { loginAndFetchProfile } from "@/store/action/authActions";
import { useDispatch } from "react-redux";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const dispatch = useDispatch();

    const handleLogin = () => {
        dispatch(loginAndFetchProfile({ username: email, password, remember }));
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm">

                <h1 className="text-2xl font-bold text-center mb-6 text-primary-900">Đăng Nhập</h1>

                <div className="flex flex-col gap-4">
                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Nhập email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-3 rounded-md outline-blue-500"
                    />

                    {/* Password */}
                    <input
                        type="password"
                        placeholder="Mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-3 rounded-md outline-blue-500"
                    />

                    {/* Remember me */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={() => setRemember(!remember)}
                            className="w-4 h-4 accent-blue-500"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                    </label>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}
