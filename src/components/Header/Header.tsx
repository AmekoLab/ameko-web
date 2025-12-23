"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Nav } from "./Nav";
import { SearchBar } from "./SearchBar";
import { CountrySelector } from "./CountrySelector";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { logout as logoutAction } from "@/src/store/slices/authSlice";
import { logout as logoutService } from "@/src/services/authServices";
import Image from "next/image";

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const CartIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

export const Header: FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // 1. Kết nối Redux để lấy thông tin User
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Xử lý đăng xuất ngay trên Header
  const handleLogout = () => {
    logoutService(); // Xóa token
    dispatch(logoutAction()); // Clear Redux
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full max-w-[1920px] mx-auto ">
        {/* --- TOP BAR (Utility) --- */}
        <div className="flex justify-end items-center h-10 space-x-6 pr-4 bg-white  text-xs font-medium">
          {/* Logic Auth: Đã login hiện tên, chưa login hiện nút Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-primary-600 flex items-center gap-2"
              >
                {/* Nếu có avatar thì hiện, không thì hiện icon user */}
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="avatar"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
                <span>Hi, {user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-gray-600 hover:text-black uppercase tracking-wider"
            >
              Login / Register
            </Link>
          )}

          <Link
            href="/cart"
            title="Cart"
            className="text-gray-700 hover:text-primary-600 flex items-center gap-1"
          >
            <CartIcon />
            {/* Badge số lượng (Hardcode tạm, sau này lấy từ Redux Cart) */}
            <span className="bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </Link>

          <CountrySelector />
        </div>

        {/* --- MAIN BAR (Navigation) --- */}
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Center: Nav (Desktop only) */}
          <div className="hidden lg:flex justify-center flex-1 mx-8">
            <Nav />
          </div>

          {/* Right: Search & Mobile Toggle */}
          <div className="flex items-center gap-4 justify-end">
            <div className="hidden lg:block w-64">
              <SearchBar />
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* --- MOBILE DRAWER --- */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg h-screen ">
            <div className="p-4 space-y-6">
              {/* Search Mobile */}
              <div>
                <SearchBar />
              </div>

              {/* Nav Mobile */}
              <Nav
                orientation="vertical"
                onNavigate={() => setMobileOpen(false)}
              />

              {/* Mobile Footer Links */}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                <Link
                  href="/cart"
                  className="flex items-center gap-2 text-gray-800 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <CartIcon /> Cart (0)
                </Link>

                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="text-gray-800 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
