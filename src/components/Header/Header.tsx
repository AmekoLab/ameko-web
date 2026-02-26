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
import { setCartOpen, fetchServerCart } from "@/src/store/slices/cartSlice";
import { ShopStatus } from "@/src/types/shop.types";
import { Store, Clock, AlertCircle, ShieldCheck, Package } from "lucide-react";

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
  const { serverCart } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentShop } = useAppSelector((state) => state.shop);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute cart item count from server cart
  const cartItemCount = serverCart?.orderItems
    ? serverCart.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  // Fetch server cart on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchServerCart());
    }
  }, [dispatch, isAuthenticated]);

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

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setUserDropdownOpen(false);
    router.replace("/login");
  };

  const handleOpenCart = () => {
    setMobileOpen(false);
    dispatch(setCartOpen(true));
  };

  // --- HÀM RENDER NÚT BẤM  ---
  // const renderDashboardButton = () => {
  //   // 1. NẾU LÀ ADMIN -> HIỆN NÚT ADMIN DASHBOARD
  //   if (isAuthenticated && user?.role === "Admin") {
  //     return (
  //       <Link
  //         href="/admin/dashboard"
  //         className="hidden md:flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#ce2a32] transition-colors"
  //       >
  //         <ShieldCheck className="w-3 h-3" />
  //         <span>Admin Panel</span>
  //       </Link>
  //     );
  //   }

  //   // 2. NẾU KHÔNG PHẢI ADMIN -> XỬ LÝ SHOP NHƯ CŨ
  //   if (!isAuthenticated || !user) {
  //     return (
  //       <Link
  //         href="/shop/register"
  //         className="hidden md:flex items-center gap-1 hover:text-[#ce2a32] transition-colors"
  //       >
  //         Become a Seller
  //       </Link>
  //     );
  //   }

  //   if (!currentShop) {
  //     return (
  //       <Link
  //         href="/shop/register"
  //         className="hidden md:flex items-center gap-1 font-bold hover:text-[#ce2a32] transition-colors"
  //       >
  //         Become a Seller
  //       </Link>
  //     );
  //   }

  //   switch (currentShop.status) {
  //     case ShopStatus.PendingApproval:
  //       return (
  //         <div
  //           className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-help"
  //           title="Hồ sơ đang chờ duyệt"
  //         >
  //           <Clock className="w-3 h-3" />
  //           <span>Pending</span>
  //         </div>
  //       );
  //     case ShopStatus.Active:
  //       return (
  //         <Link
  //           href="/shop/dashboard"
  //           className="hidden md:flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#ce2a32] transition-colors"
  //         >
  //           <Store className="w-3 h-3" />
  //           <span>My Shop</span>
  //         </Link>
  //       );
  //     case ShopStatus.Rejected:
  //       return (
  //         <Link
  //           href="/shop/register"
  //           className="hidden md:flex items-center gap-1 text-red-600 font-bold text-xs hover:underline"
  //         >
  //           <AlertCircle className="w-3 h-3" /> Re-apply
  //         </Link>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full max-w-[1920px] mx-auto">
        <div className="flex justify-end items-center h-10 space-x-6 pr-4 bg-white text-xs font-medium border-b border-gray-100 lg:border-none">
          {/* 4. GỌI HÀM RENDER */}
          {/* {renderDashboardButton()} */}

          {/* User Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 hover:text-[#ce2a32] transition-colors focus:outline-none"
              >
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
                <span className="font-bold truncate max-w-[100px]">
                  Hi, {user.firstName || user.username}
                </span>
              </button>

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
                    Account Settings
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ce2a32]"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    {/* <Package className="w-4 h-4" /> */}
                    My Orders
                  </Link>

                  {/* Nếu là Admin */}
                  {user.role === "Admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ce2a32] font-bold"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Nếu là Shop Active (và không phải Admin) */}
                  {currentShop?.status === ShopStatus.Active &&
                    user.role !== "Admin" && (
                      <Link
                        href="/shop/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ce2a32]"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Shop Dashboard
                      </Link>
                    )}

                  {currentShop?.status === ShopStatus.Active &&
                    user.role !== "Admin" && (
                      <Link
                        href={`/profile/shop/${currentShop.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ce2a32]"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        View My Store
                      </Link>
                    )}

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
            <CartIcon /> Cart ({cartItemCount})
          </button>
          <CountrySelector />
        </div>

        {/* --- MAIN BAR --- */}
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          <div className="hidden lg:flex justify-center flex-1 mx-8">
            <Nav />
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="hidden lg:block w-64">
              <SearchBar />
            </div>
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
              <SearchBar />
              <Nav
                orientation="vertical"
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
