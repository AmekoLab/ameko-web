"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LucideIcon,
} from "lucide-react";

type MenuItem = { name: string; path: string };
type MenuGroup = { groupName: string; icon: LucideIcon; items: MenuItem[] };

export default function Sidebar({ role = "staff" }: { role?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

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
      items: [{ name: "Dashboard", path: "/admin/dashboard" }],
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

  const staffMenu: MenuGroup[] = [
    {
      groupName: "Management",
      icon: CheckSquare,
      items: [
        { name: "Tasks", path: "/staff/tasks" },
        { name: "Reports", path: "/staff/reports" },
      ],
    },
  ];

  const shopMenu: MenuGroup[] = [
    {
      groupName: "Dashboard",
      icon: LayoutDashboard,
      items: [{ name: "Dashboard", path: "/shop/dashboard" }],
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
        { name: "Wallet", path: "/shop/wallet" },
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
      ],
    },
  ];

  let menu: MenuGroup[] = [...commonMenu];
  if (role === "admin") menu = [...menu, ...adminMenu];
  if (role === "staff") menu = [...menu, ...staffMenu];
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
        (item) => item.path !== "/" && pathname.startsWith(item.path)
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
      className={`bg-black border-r border-[#1e2126] h-[calc(100vh-64px)] sticky top-16 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#1e2126] scrollbar-track-transparent p-4 flex flex-col gap-2">
        {menu.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroups[group.groupName] || false;
          const isGroupActive = group.items.some((item) => isItemActive(item.path));

          return (
            <div key={group.groupName} className="flex flex-col mb-1">
              {/* Group Header */}
              {isCollapsed ? (
                // Collapsed State: Icon only, navigate to first item or expand
                <div
                  className={`w-12 h-12 mx-auto rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                    isGroupActive
                      ? "bg-[#151515] text-[#f5d800] border border-[#f5d800]/20 shadow-[0_0_10px_rgba(245,216,0,0.1)]"
                      : "text-gray-400 hover:text-white hover:bg-[#151515]"
                  }`}
                  onClick={() => {
                    setIsCollapsed(false);
                    setExpandedGroups((prev) => ({ ...prev, [group.groupName]: true }));
                  }}
                  title={group.groupName}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                // Expanded State: Full header with Accordion setup
                <button
                  onClick={() => toggleGroup(group.groupName)}
                  className={`flex items-center justify-between p-3 rounded-sm transition-colors text-[10px] font-black uppercase tracking-widest ${
                    isGroupActive && !isExpanded
                      ? "text-[#f5d800]"
                      : "text-gray-400 hover:text-white hover:bg-[#151515]"
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
                    isExpanded ? "max-h-[500px] mt-1 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {group.items.map((item) => {
                    const active = isItemActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center p-3 pl-10 rounded-r-sm transition-colors text-[11px] uppercase tracking-widest border-l-2 ${
                          active
                            ? "bg-[#151515] text-[#f5d800] font-black border-[#f5d800]"
                            : "text-gray-400 font-bold border-transparent hover:bg-[#151515] hover:text-white"
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

      {/* Footer Toggle */}
      <div className="border-t border-[#1e2126] p-4 flex justify-center items-center bg-black">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-sm text-gray-500 hover:text-white hover:bg-[#151515] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4" />
              Collapse Sidebar
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
