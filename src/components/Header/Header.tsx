"use client";

import { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { Nav } from "./Nav";
import { SearchBar } from "./SearchBar";
import { CountrySelector } from "./CountrySelector";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { logoutUser } from "@/src/store/action/authActions";
import { setCartOpen } from "@/src/store/slices/cartSlice";

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
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { totalQuantity } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleLogout = async () => {
    await dispatch(logoutUser());
    setUserDropdownOpen(false);
    router.replace("/login");
  };

  const handleOpenCart = () => {
    setMobileOpen(false);
    dispatch(setCartOpen(true));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full max-w-[1920px] mx-auto">
        {/* --- TOP BAR --- */}
        <div className="flex justify-end items-center h-10 space-x-6 pr-4 bg-white text-xs font-medium border-b border-gray-100 lg:border-none">
          {/* LOGIC AUTH: Dropdown User */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Nút bấm mở menu */}
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:text-[#ce2a32] transition-colors focus:outline-none"
              >
                {/* Check user.image (API trả về image chứ không phải avatar) */}
                {user.image ? (
                  <div className="relative w-6 h-6">
                    <Image
                      src={user.image}
                      alt="avatar"
                      fill
                      className="rounded-full object-cover border border-gray-200"
                    />
                  </div>
                ) : (
                  <span className="text-lg">👤</span>
                )}
                {/* API trả về firstName */}
                <span className="font-bold truncate max-w-[100px]">
                  Hi, {user.firstName || user.username}
                </span>
              </button>

              {/* DROPDOWN MENU */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-gray-900 font-bold truncate">
                      {user.email}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">
                      {user.role}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ce2a32]"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Chưa Login
            <Link
              href="/login"
              className="text-gray-600 hover:text-black uppercase tracking-wider"
            >
              Login / Register
            </Link>
          )}

          <button
            onClick={handleOpenCart}
            className="flex items-center gap-2 text-gray-800 font-medium hover:text-[#ce2a32] transition-colors"
          >
            <CartIcon /> Cart ({totalQuantity})
          </button>

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

            {/* Mobile Menu Button */}
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
          <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg h-[calc(100vh-64px)] overflow-y-auto z-50">
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
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    {user.image ? (
                      <Image
                        src={user.image}
                        width={32}
                        height={32}
                        alt="avt"
                        className="rounded-full"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleOpenCart}
                  className="flex items-center gap-2 font-medium"
                >
                  <CartIcon /> Cart ({totalQuantity})
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 font-medium"
                  >
                    Logout
                  </button>
                ) : (
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
