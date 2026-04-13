"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

type MenuItem = { name: string; path: string };
type MenuGroup = { groupName: string; icon: LucideIcon; items: MenuItem[] };

export default function Sidebar({ role = "staff" }: { role?: string }) {
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
      groupName: "Overview",
      icon: Home,
      items: [{ name: "Home", path: "/" }],
    },
  ];

  const adminMenu: MenuGroup[] = [
    {
      groupName: "Dashboard",
      icon: LayoutDashboard,
      items: [{ name: "Admin Dashboard", path: "/admin/dashboard" }],
    },
    {
      groupName: "User Management",
      icon: Users,
      items: [
        { name: "Users", path: "/admin/users" },
        { name: "Shops", path: "/admin/shop" },
      ],
    },
    {
      groupName: "Catalog",
      icon: Package,
      items: [{ name: "Categories", path: "/admin/categories" }],
    },
    {
      groupName: "Financial",
      icon: Wallet,
      items: [
        { name: "Wallet", path: "/admin/wallet" },
        { name: "Pending Withdrawals", path: "/admin/pending-withdrawals" },
        { name: "Transactions", path: "/admin/transactions" },
        { name: "Vouchers", path: "/admin/vouchers" },
      ],
    },
    {
      groupName: "Support",
      icon: ShieldAlert,
      items: [{ name: "Warranty Requests", path: "/admin/warranty-requests" }],
    },
  ];

  const userMenu: MenuGroup[] = [
    {
      groupName: "Management",
      icon: CheckSquare,
      items: [
        { name: "Tasks", path: "/user/tasks" },
        { name: "Reports", path: "/user/reports" },
      ],
    },
  ];

  const shopMenu: MenuGroup[] = [
    {
      groupName: "Dashboard",
      icon: LayoutDashboard,
      items: [{ name: "Shop Dashboard", path: "/shop/dashboard" }],
    },
    {
      groupName: "Catalog",
      icon: Package,
      items: [
        { name: "Categories", path: "/shop/categories" },
        { name: "Parts", path: "/shop/parts" },
        { name: "Assembled Products", path: "/shop/assembled-products" },
      ],
    },
    {
      groupName: "Sales",
      icon: ShoppingCart,
      items: [
        { name: "Orders", path: "/shop/orders" },
        // { name: "Wallet", path: "/shop/wallet" },
        { name: "Vouchers", path: "/shop/vouchers" },
      ],
    },
    {
      groupName: "Commissions",
      icon: FileText,
      items: [
        { name: "Commissions", path: "/shop/commissions" },
        { name: "Quote Management", path: "/shop/quoted-commissions" },
      ],
    },
    {
      groupName: "System",
      icon: Settings,
      items: [
        { name: "Shop Settings", path: "/shop/profile" },
        { name: "Assembly Templates", path: "/shop/assembly-templates" },
        { name: "Warranty Requests", path: "/shop/warranty-requests" },
        { name: "Cancel Requests", path: "/shop/cancel-requests" },
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
        [activeGroup.groupName]: true,
      }));
    }
  }, [pathname, role]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
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
          <div className="w-8 h-8 rounded-full bg-amazon-btnSecondary text-amazon-text flex items-center justify-center font-bold text-sm mx-auto shadow-sm">
            {displayName ? displayName.charAt(0).toUpperCase() : "A"}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amazon-btnSecondary text-amazon-text flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {displayName ? displayName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-bold truncate">Hi, {displayName}</span>
              <span className="text-white/60 text-[11px] font-medium uppercase tracking-wider truncate">
                {user?.role || role}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 flex flex-col gap-2">
        {menu.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroups[group.groupName] || false;
          const isGroupActive = group.items.some((item) =>
            isItemActive(item.path),
          );

          return (
            <div key={group.groupName} className="flex flex-col mb-1">
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
                      [group.groupName]: true,
                    }));
                  }}
                  title={group.groupName}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                // Expanded State: Full header with Accordion setup
                <button
                  onClick={() => toggleGroup(group.groupName)}
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
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="px-4 pb-3 pt-1 flex justify-center items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-sm text-white hover:text-amazon-text hover:bg-neutral-50 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium">
                <ChevronLeft className="w-4 h-4" />
                Collapse Sidebar
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
