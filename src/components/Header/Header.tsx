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
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

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

  // Hide on scroll-down, reveal on scroll-up (Corsair-style)
  useEffect(() => {
    const THRESHOLD = 6; // px — ignore tiny jitter
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (Math.abs(delta) < THRESHOLD) return;

      if (currentY <= 0) {
        // Always show at very top
        setIsVisible(true);
      } else if (delta > 0) {
        // Scrolling DOWN → hide
        setIsVisible(false);
        setMobileOpen(false); // close drawer when header hides
      } else {
        // Scrolling UP → reveal
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <header
      className={`sticky top-0 z-50 w-full bg-black transform-gpu transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* ═══════════════════════════════════════════
          ROW 1 — UTILITY BAR  (same as Corsair top strip)
          Left: icon links  |  Center: promo carousel  |  Right: flag + auth
      ═══════════════════════════════════════════ */}
      <div className="bg-black border-b border-white/10">
        <div className="w-full max-w-[1920px] mx-auto flex items-center h-10 px-4 lg:px-6">
          {/* ── LEFT: icon-style quick links (social / app icons placeholder) ── */}
          {/* <div className="flex items-center gap-0 flex-shrink-0">
            {[
              <svg
                key="a"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V9h2v7zm4 0h-2V9h2v7z" />
              </svg>,
              <svg
                key="b"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>,
              <svg
                key="c"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>,
              <svg
                key="d"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 3h18v18H3z" />
              </svg>,
            ].map((icon, i, arr) => (
              <span key={i} className="flex items-center">
                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                  {icon}
                </button>
                {i < arr.length - 1 && (
                  <span className="text-white/20 text-xs select-none">|</span>
                )}
              </span>
            ))}
          </div> */}

          {/* ── CENTER: promo carousel ── */}
          <div className="flex-1 flex items-center justify-center gap-3 min-w-0 ml-30">
            <button className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <p className="text-sm text-white font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              Free shipping on orders over $50 &nbsp;
              <Link
                href="/shop/all-products"
                className="text-[#f0c040] uppercase tracking-widest cursor-pointer hover:underline"
              >
                Shop Now
              </Link>
            </p>
            <button className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* ── RIGHT: flag + auth ── */}
          <div className="flex items-center flex-shrink-0">
            {/* Country flag */}
            <div className="mr-3">
              <CountrySelector />
            </div>

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 text-[11px] text-gray-300 hover:text-white uppercase tracking-widest font-semibold transition-colors focus:outline-none border-l border-white/20"
                >
                  {user.image ? (
                    <div className="relative w-4 h-4">
                      <Image
                        src={user.image}
                        alt="avatar"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  {user.firstName || user.username}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-[#111] border border-white/15 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-white font-bold truncate text-xs">
                        {user.email}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                        {user.role}
                      </p>
                    </div>
                    {[
                      {
                        href: "/profile",
                        label: "Account Settings",
                        show: true,
                      },
                      { href: "/orders", label: "My Orders", show: true },
                      {
                        href: "/admin/dashboard",
                        label: "Admin Dashboard",
                        show: user.role === "Admin",
                      },
                      {
                        href: "/shop/dashboard",
                        label: "Shop Dashboard",
                        show:
                          currentShop?.status === ShopStatus.Active &&
                          user.role !== "Admin" &&
                          user.role !== "User",
                      },
                      {
                        href: `/profile/shop/${currentShop?.id}`,
                        label: "View My Store",
                        show:
                          currentShop?.status === ShopStatus.Active &&
                          user.role !== "Admin" &&
                          user.role !== "User",
                      },
                      {
                        href: "/wallet",
                        label: "My Wallet",
                        show:
                          user.role !== "Admin",
                      },
                      {
                        href: "/my-commissions",
                        label: "Custom Requests",
                        show: user.role !== "Admin",
                      },
                      {
                        href: "/my-payments",
                        label: "Payment History",
                        show: user.role !== "Admin",
                      },
                      {
                        href: "/my-warranty-requests",
                        label: "Warranty Requests",
                        show: user.role !== "Admin",
                      },
                      {
                        href: "/cancel-requests",
                        label: "Cancel Requests",
                        show: user.role !== "Admin",
                      },
                    ]
                      .filter((item) => item.show)
                      .map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white uppercase tracking-wider transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    <div className="border-t border-white/10 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-[11px] text-[#ce2a32] hover:bg-white/5 uppercase tracking-wider transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 text-[11px] text-gray-300 hover:text-white uppercase tracking-widest font-semibold transition-colors border-l border-white/20"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 text-[11px] text-gray-300 hover:text-white uppercase tracking-widest font-semibold transition-colors border-l border-white/20"
                >
                  Join Us
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ROW 2 — MAIN NAV BAR
          Logo left  |  Nav centered  |  Search icon + Cart icon right
      ═══════════════════════════════════════════ */}
      <div className="w-full max-w-[1920px] mx-auto flex h-[68px] items-center px-4 lg:px-6">
        {/* Logo */}
        <div className="flex-shrink-0 mr-10 drop-shadow-[0_0_30px_rgba(255,255,255,20)]">
          <Logo />
        </div>

        {/* Nav — full-width centered, large bold uppercase items */}
        <nav className="hidden lg:flex flex-1 items-center justify-center h-full">
          <Nav />
        </nav>

        {/* Right icons: Search + Cart */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Search icon */}
          <button
            className="p-2.5 text-white hover:text-gray-300 transition-colors"
            aria-label="Search"
            onClick={() => router.push("/search")}
          >
            <svg
              className="w-[22px] h-[22px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>

          {/* Cart icon */}
          <button
            onClick={handleOpenCart}
            className="relative p-2.5 text-white hover:text-gray-300 transition-colors"
            aria-label="Cart"
          >
            <svg
              className="w-[22px] h-[22px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#ce2a32] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2.5 text-white hover:text-gray-300 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0d0d0d] absolute w-full left-0 shadow-2xl h-[calc(100vh-108px)] overflow-y-auto z-50">
          <div className="p-4 space-y-6">
            <SearchBar />
            <Nav
              orientation="vertical"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};
