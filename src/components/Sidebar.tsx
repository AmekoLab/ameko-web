"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "@/src/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { logoutUser } from "@/src/store/action/authActions";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  FileText,
  Settings,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckSquare,
  BarChart,
  Home,
  LogOut,
  LucideIcon,
} from "lucide-react";
import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

type MenuItem = { name: string; path: string };
type MenuGroup = { groupName: string; groupKey: string; icon: LucideIcon; items: MenuItem[] };

export default function Sidebar({ role = "staff" }: { role?: string }) {
  const t = useTranslations("Sidebar");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const { currentShop } = useAppSelector((state: any) => state.shop);

  const displayName = (() => {
    if (!user) return "";
    if (user.role === "Admin") return "Admin!";
    if (user.role === "Shop") {
      return currentShop?.shopName || user?.shopName || user?.firstName || user?.username;
    }
    return user?.firstName || user?.username;
  })();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  // 1. Define menus
  const commonMenu: MenuGroup[] = [
    {
      groupName: t("group_overview"),
      groupKey: "overview",
      icon: Home,
      items: [{ name: t("home"), path: "/" }],
    },
  ];

  const adminMenu: MenuGroup[] = [
    {
      groupName: t("group_dashboard"),
      groupKey: "dashboard",
      icon: LayoutDashboard,
      items: [{ name: t("adminDashboard"), path: "/admin/dashboard" }],
    },
    {
      groupName: t("group_userManagement"),
      groupKey: "userManagement",
      icon: Users,
      items: [
        { name: t("users"), path: "/admin/users" },
        { name: t("shops"), path: "/admin/shop" },
      ],
    },
    {
      groupName: t("group_catalog"),
      groupKey: "catalog",
      icon: Package,
      items: [{ name: t("categories"), path: "/admin/categories" }],
    },
    {
      groupName: t("group_financial"),
      groupKey: "financial",
      icon: Wallet,
      items: [
        { name: t("wallet"), path: "/admin/wallet" },
        { name: t("pendingWithdrawals"), path: "/admin/pending-withdrawals" },
        { name: t("transactions"), path: "/admin/transactions" },
        { name: t("vouchers"), path: "/admin/vouchers" },
      ],
    },
    {
      groupName: t("group_support"),
      groupKey: "support",
      icon: ShieldAlert,
      items: [{ name: t("warrantyRequests"), path: "/admin/warranty-requests" }],
    },
  ];

  const userMenu: MenuGroup[] = [
    {
      groupName: t("group_management"),
      groupKey: "management",
      icon: CheckSquare,
      items: [
        { name: t("tasks"), path: "/user/tasks" },
        { name: t("reports"), path: "/user/reports" },
      ],
    },
  ];

  const shopMenu: MenuGroup[] = [
    {
      groupName: t("group_dashboard"),
      groupKey: "shopDashboard",
      icon: LayoutDashboard,
      items: [{ name: t("shopDashboard"), path: "/shop/dashboard" }],
    },
    {
      groupName: t("group_catalog"),
      groupKey: "shopCatalog",
      icon: Package,
      items: [
        { name: t("categories"), path: "/shop/categories" },
        { name: t("parts"), path: "/shop/parts" },
        { name: t("assembledProducts"), path: "/shop/assembled-products" },
      ],
    },
    {
      groupName: t("group_sales"),
      groupKey: "sales",
      icon: ShoppingCart,
      items: [
        { name: t("orders"), path: "/shop/orders" },
        // { name: "Wallet", path: "/shop/wallet" },
        { name: t("vouchers"), path: "/shop/vouchers" },
      ],
    },
    {
      groupName: t("group_commissions"),
      groupKey: "commissions",
      icon: FileText,
      items: [
        { name: t("commissions"), path: "/shop/commissions" },
        { name: t("quoteManagement"), path: "/shop/quoted-commissions" },
      ],
    },
    {
      groupName: t("group_system"),
      groupKey: "system",
      icon: Settings,
      items: [
        { name: t("shopSettings"), path: "/shop/profile" },
        { name: t("assemblyTemplates"), path: "/shop/assembly-templates" },
        { name: t("warrantyRequests"), path: "/shop/warranty-requests" },
        { name: t("cancelRequests"), path: "/shop/cancel-requests" },
      ],
    },
  ];

  let menu: MenuGroup[] = [...commonMenu];
  if (role === "admin") menu = [...menu, ...adminMenu];
  if (role === "user") menu = [...menu, ...userMenu];
  if (role === "shop") menu = [...menu, ...shopMenu];

  // 2. Smart active state handling
  useEffect(() => {
    if (!pathname) return;

    // Find which group contains the current path
    const activeGroup = menu.find((group) => {
      if (pathname === "/" && group.items.some((item) => item.path === "/")) {
        return true;
      }
      return group.items.some(
        (item) => item.path !== "/" && pathname.startsWith(item.path),
      );
    });

    if (activeGroup) {
      setExpandedGroups((prev) => ({
        ...prev,
        [activeGroup.groupKey]: true,
      }));
    }
  }, [pathname, role]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const isItemActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (!pathname) return false;
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`bg-amazon-headerLight border-r border-amazon-border h-full flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* User Profile Block */}
     <div className="border-b border-amazon-border p-4">
  {isCollapsed ? (
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-amazon-btnSecondary text-amazon-text flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
        {displayName ? displayName.charAt(0).toUpperCase() : "A"}
      </div>
      <div
        className="w-8 h-8 rounded-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
        title={t("language")}
        onClick={() => setIsCollapsed(false)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" />
        </svg>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-amazon-btnSecondary text-amazon-text flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
        {displayName ? displayName.charAt(0).toUpperCase() : "A"}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-white text-sm font-bold truncate">
          {t("hiName", { name: displayName })}
        </span>
        <span className="text-white/60 text-[11px] font-medium uppercase tracking-wider truncate">
          {user?.role || role}
        </span>
      </div>
      {/* LanguageSwitcher sits at the end of the same row */}
      <div className="shrink-0">
        <LanguageSwitcher />
      </div>
    </div>
  )}
</div>

      

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 flex flex-col gap-2">
        {menu.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroups[group.groupKey] || false;
          const isGroupActive = group.items.some((item) =>
            isItemActive(item.path),
          );

          return (
            <div key={group.groupKey} className="flex flex-col mb-1">
              {/* Group Header */}
              {isCollapsed ? (
                // Collapsed State: Icon only, navigate to first item or expand
                <div
                  className={`w-12 h-12 mx-auto rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                    isGroupActive
                      ? "bg-neutral-50 text-amazon-focus border border-amazon-border shadow-sm"
                      : "text-white hover:text-amazon-text hover:bg-neutral-50"
                  }`}
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedGroups((prev) => ({
                      ...prev,
                      [group.groupKey]: true,
                    }));
                  }}
                  title={group.groupName}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                // Expanded State: Full header with Accordion setup
                <button
                  onClick={() => toggleGroup(group.groupKey)}
                  className={`flex items-center justify-between p-3 rounded-sm transition-colors text-sm ${
                    isGroupActive && !isExpanded
                      ? "text-white font-bold"
                      : "text-white hover:text-amazon-text hover:bg-neutral-50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{group.groupName}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Group Items */}
              {!isCollapsed && (
                <div
                  className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "max-h-[500px] mt-1 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {group.items.map((item) => {
                    const active = isItemActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center p-3 pl-10 rounded-r-sm transition-colors text-[13px] border-l-2 ${
                          active
                            ? "bg-neutral-50 text-amazon-text font-bold border-amazon-btnSecondary"
                            : "text-white hover:bg-neutral-50 hover:text-amazon-text font-medium border-transparent"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: Logout + Collapse Toggle */}
      <div className="border-t border-amazon-border bg-amazon-headerLight">
        {/* Logout Button */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 rounded-sm transition-colors text-red-300 hover:bg-red-500/10 hover:text-red-400 ${
              isCollapsed ? "justify-center p-2" : "px-3 py-2 text-sm font-medium"
            }`}
            title={t("logout")}
          >
            <LogOut className="w-4.5 h-4.5" />
            {!isCollapsed && <span>{t("logout")}</span>}
          </button>
        </div>

       

        {/* Collapse Toggle */}
        <div className="px-4 pb-3 pt-1 flex justify-center items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-sm text-white hover:text-amazon-text hover:bg-neutral-50 transition-colors"
            title={isCollapsed ? t("expandSidebar") : t("collapseSidebar")}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium">
                <ChevronLeft className="w-4 h-4" />
                {t("collapseSidebar")}
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
