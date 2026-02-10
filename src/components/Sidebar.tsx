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
    { name: "Settings", path: "/admin/settings" },
  ];

  const staffMenu = [
    { name: "Tasks", path: "/staff/tasks" },
    { name: "Reports", path: "/staff/reports" },
  ];

  const shopMenu = [
    { name: "Dashboard", path: "/shop/dashboard" },
    { name: "Categories", path: "/shop/categories" },
    { name: "Parts", path: "/shop/parts" },
    { name: "Assembled Products", path: "/shop/assembled-products" },
  ];

  let menu = [...commonMenu];
  if (role === "admin") menu = [...menu, ...adminMenu];
  if (role === "staff") menu = [...menu, ...staffMenu];
  if (role === "shop") menu = [...menu, ...shopMenu];

  return (
    <aside className="bg-white w-64 h-[calc(100vh-64px)] shadow-md sticky top-16 overflow-auto">
      <nav className="flex flex-col p-4 gap-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`p-3 rounded-lg hover:bg-primary-100 transition ${
              active === item.name.toLowerCase()
                ? "bg-primary-200 font-semibold"
                : ""
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
