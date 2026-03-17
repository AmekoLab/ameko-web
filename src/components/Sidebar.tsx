"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar({ role = "staff" }) {
  const [active, setActive] = useState("home");

  const commonMenu = [
    { name: "Home", path: "/" },
    // { name: "Profile", path: "/profile" },
  ];

  const adminMenu = [
    { name: "Users", path: "/admin/users" },
    { name: "Shops", path: "/admin/shop" },
    { name: "Categories", path: "/admin/categories" },
    // { name: "Settings", path: "/admin/settings" },
    { name: "Wallet", path: "/admin/wallet" },
    { name: "Pending Withdrawals", path: "/admin/pending-withdrawals" },
    { name: "Transactions", path: "/admin/transactions" },
    { name: "Vouchers", path: "/admin/vouchers" },
    { name: "Warranty Requests", path: "/admin/warranty-requests" },
  ];

  const staffMenu = [
    { name: "Tasks", path: "/staff/tasks" },
    { name: "Reports", path: "/staff/reports" },
  ];

  const shopMenu = [
    { name: "Dashboard", path: "/shop/dashboard" },
    { name: "Shop Settings", path: "/shop/profile" },
    { name: "Categories", path: "/shop/categories" },
    { name: "Parts", path: "/shop/parts" },
    { name: "Assembled Products", path: "/shop/assembled-products" },
    { name: "Wallet", path: "/shop/wallet" },
    { name: "Vouchers", path: "/shop/vouchers" },
    { name: "Commissions", path: "/shop/commissions" },
    { name: "Quote Management", path: "/shop/quoted-commissions" },
    { name: "Warranty Requests", path: "/shop/warranty-requests" },
  ];

  let menu = [...commonMenu];
  if (role === "admin") menu = [...menu, ...adminMenu];
  if (role === "staff") menu = [...menu, ...staffMenu];
  if (role === "shop") menu = [...menu, ...shopMenu];

  return (
    <aside className="bg-black border-r border-[#1e2126] w-64 h-[calc(100vh-64px)] sticky top-16 overflow-auto">
      <nav className="flex flex-col p-4 gap-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`p-3 rounded-sm transition-colors text-[11px] uppercase tracking-widest flex items-center ${
              active === item.name.toLowerCase()
                ? "bg-[#f5d800] text-black font-black shadow-[0_0_10px_rgba(245,216,0,0.2)]"
                : "text-gray-400 font-bold hover:bg-[#151515] hover:text-white"
            }`}
            onClick={() => setActive(item.name.toLowerCase())}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
