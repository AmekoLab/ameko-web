"use client";

import React from "react";

export default function Header() {
    return (
        <header className="bg-primary-600 text-white flex justify-between items-center px-6 py-4 shadow-md fixed top-0 left-0 right-0 z-10">
            <h1 className="text-xl font-bold">My App</h1>

            <div className="flex items-center gap-4">

                <button className="p-2 rounded hover:bg-primary-500 transition">
                    🔔
                </button>

                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                    U
                </div>
            </div>
        </header>
    );
}
