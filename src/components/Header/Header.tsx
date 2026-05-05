"use client";

import { FC, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { logoutUser } from "@/src/store/action/authActions";
import { setCartOpen, fetchServerCart } from "@/src/store/slices/cartSlice";
import { ShopStatus } from "@/src/types/shop.types";
import { NAV_ITEMS } from "@/src/data/nav";
import { Logo } from "./Logo";
import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/src/i18n/routing";
import { Loader2 } from "lucide-react";
import type { AssembledProductItem } from "@/src/types/assembledProduct.types";
import { assembledProductService } from "@/src/services/assembledProduct.service";
import { reputationService, CustomerReputationData } from "@/src/services/reputation.service";
import { shopReputationService, ShopReputationCurrent } from "@/src/services/shopReputation.service";
import { notificationService, NotificationDto } from "@/src/services/notification.service";
import { socketService } from "@/src/services/socket.service";
import { toast } from "react-toastify";

/* ─── Inline SVG icon helpers ─── */
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
const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);
const CartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
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
);
const LockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V7.875a4.125 4.125 0 10-8.25 0V10.5m-1.5 0h11.25A1.5 1.5 0 0119.5 12v7.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z"
    />
  </svg>
);
const HamburgerSmall = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const BellIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

/* ─── Relative time helper ─── */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

/* ═══════════════════════════════════════════════════════
   HEADER — Amazon-style dual-row layout
   ROW 1: [Logo] [Search Bar] [Account | Orders | Cart]
   ROW 2: [☰ Tất cả | Nav links | Category links]
   ═══════════════════════════════════════════════════════ */
export const Header: FC = () => {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const isCheckoutPage = pathname?.includes("/checkout");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { serverCart } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentShop } = useAppSelector((state) => state.shop);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const secureInfoRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSecureInfoOpen, setIsSecureInfoOpen] = useState(false);

  // Live search states
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AssembledProductItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- Reputation State ---
  const [reputation, setReputation] = useState<CustomerReputationData | null>(null);
  const [shopReputation, setShopReputation] = useState<ShopReputationCurrent | null>(null);

  // --- Notification State ---
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [notiCursor, setNotiCursor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiLoading, setNotiLoading] = useState(false);
  const [notiLoadingMore, setNotiLoadingMore] = useState(false);
  const [notiInitialized, setNotiInitialized] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);
  const processedNotisRef = useRef(new Set<number>());

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Fetch Customer Reputation
    if (user.role === "Customer" || user.role === "User") {
      reputationService.getMyReputation()
        .then((res) => { if (res.success) setReputation(res.data); })
        .catch(console.error);
    } 
    
    // Fetch Shop Reputation
    if (user.role === "Shop") {
      shopReputationService.getMyCurrent()
        .then((res) => { if (res.success) setShopReputation(res.data); })
        .catch(console.error);
    }
  }, [isAuthenticated, user]);

  // Fetch unread notification count on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    notificationService.getUnreadCount()
      .then(res => { 
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount);
        } 
      })
      .catch(console.error);
  }, [isAuthenticated, user]);

  // Initialize SignalR connection for real-time events
  useEffect(() => {
    console.log("🛠️ [Header] Checking auth for SignalR...");
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem("token");
    if (token) {
      console.log("🛠️ [Header] Found token, calling socketService.connect()...");
      socketService.connect(token, dispatch).catch(err => {
        console.error("❌ [Header] Socket connect failed:", err);
      });
    } else {
      console.log("⚠️ [Header] No token found in localStorage.");
    }
  }, [isAuthenticated, user, dispatch]);

  // Load first batch when notification dropdown opens
  useEffect(() => {
    if (notiOpen && !notiInitialized && isAuthenticated) {
      setNotiLoading(true);
      notificationService.getUserNotifications({ pageSize: 10 })
        .then(res => {
          if (res.success && res.data) {
            setNotifications(res.data.items);
            setNotiCursor(res.data.nextCursor);
            setNotiInitialized(true);
          }
        })
        .catch(console.error)
        .finally(() => setNotiLoading(false));
    }
  }, [notiOpen, notiInitialized, isAuthenticated]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleNotiOutsideClick(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setNotiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleNotiOutsideClick);
    return () => document.removeEventListener("mousedown", handleNotiOutsideClick);
  }, []);

  const handleLoadMoreNotifications = useCallback(async () => {
    if (!notiCursor || notiLoadingMore) return;
    setNotiLoadingMore(true);
    try {
      const res = await notificationService.getUserNotifications({ cursor: notiCursor, pageSize: 10 });
      if (res.success && res.data) {
        setNotifications(prev => [...prev, ...res.data.items]);
        setNotiCursor(res.data.nextCursor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotiLoadingMore(false);
    }
  }, [notiCursor, notiLoadingMore]);

  const handleNotificationClick = useCallback(async (noti: NotificationDto) => {
    // Mark as read locally and on server
    if (!noti.isRead) {
      setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      notificationService.markAsRead(noti.id).catch(console.error);
    }
    setNotiOpen(false);
    if (noti.redirectUrl) {
      router.push(noti.redirectUrl);
    }
  }, [router]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // --- Real-time notification listener via SignalR ---
  useEffect(() => {
    const handleNewNotification = (newNoty: NotificationDto) => {
      // 1. Check if we already processed this notification ID (handles duplicate SignalR events)
      if (processedNotisRef.current.has(newNoty.id)) {
        return;
      }
      processedNotisRef.current.add(newNoty.id);

      console.log("💥 [Header] handleNewNoty triggered! Updating UI state...", newNoty);
      
      // 2. Increment badge
      setUnreadCount(prev => prev + 1);

      // 3. Prepend to list safely
      setNotifications(prev => {
        if (prev.some(n => n.id === newNoty.id)) return prev;
        return [newNoty, ...prev];
      });
    };

    socketService.onNotificationReceived(handleNewNotification);

    return () => {
      socketService.offNotificationReceived(handleNewNotification);
    };
  }, []);

  // Cart item count from server cart
  const cartItemCount = serverCart?.orderItems
    ? serverCart.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  // Fetch server cart on mount & auth change
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchServerCart());
    }
  }, [dispatch, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        secureInfoRef.current &&
        !secureInfoRef.current.contains(event.target as Node)
      ) {
        setIsSecureInfoOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Suggestions
  useEffect(() => {
    let cancelled = false;

    if (debouncedSearchQuery.trim().length >= 2) {
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
          const res = await assembledProductService.searchProducts({
            searchTerm: debouncedSearchQuery,
            pageSize: 5,
          });
          if (!cancelled) {
            const items = res?.data?.items || (res as any)?.data?.data?.items || (res as any)?.items || [];
            setSuggestions(items);
            if (items.length > 0) {
              setIsDropdownOpen(true);
            } else {
              setIsDropdownOpen(false);
            }
          }
        } catch (err) {
          console.error("Failed to fetch suggestions:", err);
          if (!cancelled) {
            setSuggestions([]);
            setIsDropdownOpen(false);
          }
        } finally {
          if (!cancelled) setIsLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery]);

  // Hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const THRESHOLD = 6;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      if (Math.abs(delta) < THRESHOLD) return;
      if (currentY <= 0) {
        setIsVisible(true);
      } else if (delta > 0) {
        setIsVisible(false);
        setMobileOpen(false);
      } else {
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

 const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      // Đổi từ /search?q= sang trang Shop kèm tham số searchTerm của API mới
      router.push(`/shop/all-products?searchTerm=${encodeURIComponent(searchQuery.trim())}`);
      
      // Nếu ở mobile thì đóng menu sau khi search
      setMobileOpen(false); 
    }
  };

  const CATEGORY_LINKS = [
    {
      label: t("warranty"),
      href: "/my-warranty-requests",
      show: user?.role !== "Admin",
    },
    {
      label: t("cancelOrder"),
      href: "/cancel-requests",
      show: user?.role !== "Admin",
    },
    // { label: "Shop Dashboard", href: "/shop/dashboard", show: user?.role === "Admin" },
    {
      label: t("transactions"),
      href: "/transactions",
      show: user?.role !== "Admin",
    },
    { label: t("wallet"), href: "/wallet", show: user?.role !== "Admin" },
    // { label: "Bàn phím", href: "/shop/all-products?category=keyboard" },
    // { label: "Tai nghe", href: "/shop/all-products?category=headphone" },
    {
      href: "/my-commissions",
      label: t("customRequests"),
      show: user?.role !== "Admin",
    },
    {
      href: "/my-payments",
      label: t("paymentHistory"),
      show: user?.role !== "Admin",
    },
  ];

  const displayName = (() => {
    if (!user) return "";
    if (user.role === "Shop") {
      return currentShop?.shopName || user?.firstName || user?.username;
    }
    return user?.firstName || user?.username;
  })();

  if (isCheckoutPage) {
    return (
      <header
        className={`sticky top-0 z-50 w-full shadow-md transform-gpu transition-transform duration-500 ease-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-amazon-header">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-2 gap-4">
            <div className="flex-1 flex items-center min-w-0">
              <Link
                href="/"
                aria-label="AMEKO home"
                className="brightness-0 invert inline-flex items-center"
              >
                <Image
                  src="https://res.cloudinary.com/doezwafgz/image/upload/v1768359101/logo-removebg-preview_1_updhae.png"
                  alt="AMEKO Logo"
                  className="h-20 w-auto"
                  width={250}
                  height={100}
                />
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-center px-2">
              <div
                ref={secureInfoRef}
                className="relative"
                onMouseEnter={() => setIsSecureInfoOpen(true)}
                onMouseLeave={() => setIsSecureInfoOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsSecureInfoOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-white hover:text-white/90 transition-colors"
                  aria-expanded={isSecureInfoOpen}
                  aria-label={t("secureCheckout")}
                >
                  <LockIcon className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-md md:text-xl font-semibold tracking-tight leading-none">
                    {t("secureCheckout")}
                  </span>
                </button>

                {isSecureInfoOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[320px] md:w-[430px] bg-white border border-amazon-border shadow-xl rounded-md p-3 text-xs md:text-sm text-amazon-text leading-relaxed z-50">
                    {t("secureCheckoutDesc")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-end min-w-0">
              <Link
                href="/cart"
                className="relative flex items-end gap-0.5 px-3 py-1 text-white hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                <CartIcon className="w-7 h-7" />
                <span className="text-sm font-bold font-sans hidden sm:inline leading-tight mb-0.5">
                  {t("cart")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full shadow-md transform-gpu transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* ═══════════════════════════════════════════
          ROW 1 — MAIN HEADER BAR (bg-amazon-header)
          [Logo]  [     Massive Search Bar     ]  [Account | Orders | Cart]
      ═══════════════════════════════════════════ */}
      <div className="bg-amazon-header">
        <div className="w-full max-w-7xl mx-auto flex items-center px-4 py-2 gap-4">
          {/* ── LEFT: Logo ── */}
          <div className="brightness-0 invert">
            <Logo />
          </div>

          {/* ── CENTER: Search Bar ── */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-3xl mx-4 relative">
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-stretch"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (suggestions.length > 0) setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setIsDropdownOpen(true);
                }}
                placeholder={t("searchPlaceholderDesktop")}
                className="flex-1 min-w-0 px-4 py-2 bg-white text-amazon-text text-sm rounded-l-md outline-none focus:ring-2 focus:ring-amazon-focus/50 placeholder:text-amazon-textMuted font-sans z-10"
              />
              <button
                type="submit"
                className="px-4 bg-amazon-btnPrimary text-amazon-text rounded-r-md hover:brightness-95 transition-all flex items-center justify-center z-10"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>

            {/* Dropdown UI */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-amazon-border shadow-xl rounded-md mt-1 z-50 max-h-[400px] overflow-y-auto">
                <ul className="py-2">
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/shop/assembled-product/${item.id}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        {item.image1 ? (
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={item.image1}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amazon-text truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-amazon-price font-bold mt-0.5">
                            {item.price ? `${item.price.toLocaleString("vi-VN")} ₫` : "Contact"}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── RIGHT: Actions ── */}
          <div
            className="relative flex items-center gap-1 ml-auto flex-shrink min-w-0"
            ref={dropdownRef}
          >
            {/* Country selector */}
            {/* <div className="hidden md:block mr-1">
              <CountrySelector />
            </div> */}

            {/* Account & Lists (stacked) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  isAuthenticated
                    ? setUserDropdownOpen(!userDropdownOpen)
                    : router.push("/login")
                }
                className="hidden md:flex flex-col items-start px-3 py-1 text-white hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all cursor-pointer"
              >
                <span className="text-md font-sans leading-tight whitespace-nowrap max-w-[150px] truncate inline-block align-bottom">
                  {isAuthenticated && user
                    ? t("hiName", { name: displayName })
                    : t("hiSignIn")}
                </span>
                <span className="text-sm font-bold font-sans leading-tight whitespace-nowrap">
                  {t("accountAndLists")}
                </span>
              </button>

              {/* Dropdown */}
              {userDropdownOpen && isAuthenticated && user && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-amazon-border shadow-xl py-1 z-50 rounded-md font-sans">
                  <div className="px-4 py-3 border-b border-amazon-border mb-1">
                    {/* Line 1: Email */}
                    <p className="text-amazon-text font-bold truncate text-sm leading-tight">
                      {user.email}
                    </p>

                    {/* Line 2: Role & Tier Badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-amazon-textMuted">
                        {user.role}
                      </p>

                      {/* Render Shop Badge if Shop */}
                      {shopReputation && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          shopReputation.badge === "Premium" ? "bg-yellow-100 text-yellow-700" :
                          shopReputation.badge === "Verified" ? "bg-blue-100 text-blue-700" :
                          "bg-neutral-100 text-green-700"
                        }`}>
                          {shopReputation.badge}
                        </span>
                      )}

                      {/* Render Customer Tier if Customer (Old Logic) */}
                      {reputation && !shopReputation && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            reputation.gate.isLocked
                              ? "bg-red-100 text-red-700"
                              : reputation.gate.tier === "High"
                              ? "bg-green-100 text-green-700"
                              : reputation.gate.tier === "Mid" || reputation.gate.tier === "Normal"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {reputation.gate.isLocked
                            ? t("reputation.locked")
                            : reputation.gate.tier === "High"
                            ? t("reputation.tierHigh")
                            : reputation.gate.tier === "Mid" || reputation.gate.tier === "Normal"
                            ? t("reputation.tierMid")
                            : t("reputation.tierLow")}
                        </span>
                      )}
                    </div>

                    {/* Line 3: Reputation Progress Bar for Customer */}
                    {reputation && !shopReputation && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-amazon-textMuted font-medium">
                          {t("reputation.label")}
                        </span>
                        <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              reputation.gate.isLocked
                                ? "bg-red-500"
                                : reputation.gate.tier === "High"
                                ? "bg-green-500"
                                : reputation.gate.tier === "Mid" || reputation.gate.tier === "Normal"
                                ? "bg-blue-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${Math.min(Math.max(reputation.currentScore, 0), 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-amazon-text tabular-nums">
                          {reputation.currentScore}
                        </span>
                      </div>
                    )}

                    {/* Reputation Progress Bar for Shop */}
                    {shopReputation && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-amazon-textMuted font-medium">
                          {t("reputation.shopLabel") || "Uy tín Shop"}
                        </span>
                        <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              shopReputation.badge === "Premium" ? "bg-yellow-500" :
                              shopReputation.badge === "Verified" ? "bg-blue-500" : "bg-green-500"
                            }`}
                            style={{ width: `${shopReputation.currentQualityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-amazon-text tabular-nums">
                          {shopReputation.currentQualityScore}
                        </span>
                      </div>
                    )}
                  </div>
                  {[
                    {
                      href: "/profile",
                      label: t("accountSettings"),
                      show: true,
                    },
                    // { href: "/orders", label: "My Orders", show: user.role !== "Admin" },
                    {
                      href: "/admin/dashboard",
                      label: t("adminDashboard"),
                      show: user.role === "Admin",
                    },
                    {
                      href: "/shop/dashboard",
                      label: t("shopDashboard"),
                      show:
                        currentShop?.status === ShopStatus.Active &&
                        user.role !== "Admin" &&
                        user.role !== "User",
                    },
                    {
                      href: `/profile/shop/${currentShop?.id}`,
                      label: t("viewMyStore"),
                      show:
                        currentShop?.status === ShopStatus.Active &&
                        user.role !== "Admin" &&
                        user.role !== "User",
                    },
                    // {
                    //   href: "/wallet",
                    //   label: "My Wallet",
                    //   show: user.role !== "Admin",
                    // },
                    // {
                    //   href: "/my-commissions",
                    //   label: "Custom Requests",
                    //   show: user.role !== "Admin",
                    // },
                    // {
                    //   href: "/my-payments",
                    //   label: "Payment History",
                    //   show: user.role !== "Admin",
                    // },
                    // {
                    //   href: "/my-warranty-requests",
                    //   label: "Warranty Requests",
                    //   show: user.role !== "Admin",
                    // },
                    // {
                    //   href: "/cancel-requests",
                    //   label: "Cancel Requests",
                    //   show: user.role !== "Admin",
                    // },
                    // {
                    //   href: "/transactions",
                    //   label: "Transactions",
                    //   show: user.role !== "Admin",
                    // },
                  ]
                    .filter((item) => item.show)
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-amazon-text hover:bg-amazon-bgSecondary transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  <div className="border-t border-amazon-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-amazon-price hover:bg-amazon-bgSecondary transition-colors"
                    >
                      {t("signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Orders (stacked) */}
            <Link
              href="/orders"
              className="hidden md:flex flex-col items-start px-3 py-1 text-white hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
            >
              <span className="text-sm font-bold font-sans leading-tight">
                {t("andOrders")}
              </span>
            </Link>

            {/* ── Notification Bell ── */}
            {isAuthenticated && (
              <div className="relative hidden md:block" ref={notiRef}>
                <button
                  onClick={() => setNotiOpen(prev => !prev)}
                  className="relative flex items-center px-2 py-1 text-white hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-amazon-btnSecondary text-amazon-text text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notiOpen && (
                  <div className="absolute right-0 top-full mt-1 w-[380px] bg-white border border-amazon-border shadow-2xl rounded-md z-50 font-sans overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-amazon-border bg-neutral-50">
                      <h3 className="text-sm font-bold text-amazon-text">Thông báo</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Đánh dấu tất cả đã đọc
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto">
                      {notiLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                          <BellIcon className="w-8 h-8 mb-2 opacity-40" />
                          <p className="text-sm">Chưa có thông báo nào</p>
                        </div>
                      ) : (
                        <>
                          {notifications.map((noti) => (
                            <button
                              key={noti.id}
                              onClick={() => handleNotificationClick(noti)}
                              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0 transition-colors hover:bg-neutral-50 ${
                                !noti.isRead ? "bg-blue-50/60" : ""
                              }`}
                            >
                              {/* Icon */}
                              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${
                                !noti.isRead ? "bg-blue-100 text-blue-600" : "bg-neutral-100 text-neutral-500"
                              }`}>
                                {noti.actorId === null ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                                  </svg>
                                ) : (
                                  <BellIcon className="w-4 h-4" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] leading-snug ${
                                  !noti.isRead ? "font-semibold text-amazon-text" : "font-medium text-neutral-700"
                                }`}>
                                  {noti.title}
                                </p>
                                {noti.message && (
                                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                                    {noti.message}
                                  </p>
                                )}
                                <p className="text-[11px] text-neutral-400 mt-1">
                                  {timeAgo(noti.createdAt)}
                                </p>
                              </div>

                              {/* Unread dot */}
                              {!noti.isRead && (
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                              )}
                            </button>
                          ))}

                          {/* Load More */}
                          {notiCursor && (
                            <button
                              onClick={handleLoadMoreNotifications}
                              disabled={notiLoadingMore}
                              className="w-full py-2.5 text-center text-xs font-semibold text-blue-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                            >
                              {notiLoadingMore ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                "Xem thêm"
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Switcher */}
            <div className="hidden md:flex items-center px-1">
              <LanguageSwitcher />
            </div>

            {/* Cart */}
            <button
              onClick={handleOpenCart}
              className="relative flex items-end gap-0.5 px-3 py-1 text-white hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              aria-label="Cart"
            >
              <span className="relative">
                <CartIcon className="w-7 h-7" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] bg-amazon-btnSecondary text-amazon-text text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {cartItemCount}
                  </span>
                )}
              </span>
              <span className="text-sm font-bold font-sans hidden sm:inline leading-tight mb-0.5">
                {t("cart")}
              </span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ROW 2 — SUB NAVBAR (bg-amazon-headerLight)
          [☰ Tất cả]  [Nav links]  [Category links]
      ═══════════════════════════════════════════ */}
      <div className="bg-amazon-headerLight hidden md:block overflow-hidden">
        <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center gap-x-1 gap-y-1.5 px-4 py-1.5">
          {/* ☰ Tất cả */}
          {/* <Link
            href="/shop/all-products"
            className="flex items-center gap-1.5 text-white font-bold text-sm px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all mr-2"
          >
            <HamburgerSmall />
            <span>Tất cả</span>
          </Link> */}

          {/* Divider */}
          <span className="text-white/30 text-xs select-none mr-2">|</span>

          {/* Navigation links moved from top bar */}
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-white font-normal text-xs tracking-tight px-2 py-1 hover:underline hover:text-white rounded-sm transition-all whitespace-nowrap"
            >
              {t(item.label)}
            </Link>
          ))}

          {/* Divider */}
          <span className="text-white/30 text-xs select-none mx-1">|</span>

          {/* Category links */}
          {CATEGORY_LINKS.filter((cat) => cat.show).map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="text-white font-normal text-xs tracking-tight px-2 py-1 hover:underline hover:text-white rounded-sm transition-all whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="md:hidden bg-amazon-header absolute w-full left-0 shadow-2xl h-[calc(100vh-56px)] overflow-y-auto z-50">
          <div className="p-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-stretch">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholderMobile")}
                className="flex-1 min-w-0 px-4 py-2.5 bg-white text-amazon-text text-sm rounded-l-md outline-none focus:ring-2 focus:ring-amazon-focus/50 placeholder:text-amazon-textMuted font-sans"
              />
              <button
                type="submit"
                className="px-4 bg-amazon-btnPrimary text-amazon-text rounded-r-md flex items-center justify-center"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>

            {/* Mobile nav links */}
            <nav className="space-y-1">
              <Link
                href="/shop/all-products"
                className="flex items-center gap-2 text-white font-bold text-sm px-3 py-2.5 hover:bg-white/10 rounded-sm transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <HamburgerSmall />
                {t("all")}
              </Link>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-white font-normal text-sm px-3 py-2.5 hover:bg-white/10 rounded-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(item.label)}
                </Link>
              ))}

              <div className="border-t border-white/10 my-2" />

              {CATEGORY_LINKS.filter((cat) => cat.show).map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="block text-white font-normal text-sm px-3 py-2.5 hover:bg-white/10 rounded-sm transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>

            {/* Mobile auth */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 text-white">
                    <p className="text-sm font-bold truncate pr-4">
                      {displayName}
                    </p>
                    <p className="text-xs text-white/60">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block text-white text-sm px-3 py-2 hover:bg-white/10 rounded-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("account")}
                  </Link>
                  <Link
                    href="/orders"
                    className="block text-white text-sm px-3 py-2 hover:bg-white/10 rounded-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("orders")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-amazon-price font-bold text-sm px-3 py-2 hover:bg-white/10 rounded-sm"
                  >
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-2.5 bg-amazon-btnPrimary text-amazon-text text-sm font-bold rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center py-2.5 border border-amazon-border text-white text-sm rounded-md hover:bg-white/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("signUp")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
