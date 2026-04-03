"use client";
import { FC, ReactNode } from "react";
import { Flame, Hash, Users, TrendingUp } from "lucide-react";

// --- LEFT SIDEBAR ---
export const LeftSidebar: FC = () => (
  <div className="sticky top-32 space-y-2">
    <SidebarLink
      icon={<Flame className="w-5 h-5 text-[#ce2a32]" />}
      text="News Feed"
      active
    />
    <SidebarLink icon={<Hash className="w-5 h-5" />} text="Explore Topics" />
    <SidebarLink icon={<Users className="w-5 h-5" />} text="Groups" />
    <SidebarLink
      icon={<TrendingUp className="w-5 h-5" />}
      text="Trending Builds"
    />

    <div className="border-t border-[#2a2d31] my-4"></div>

    <h3 className="text-md font-black uppercase text-gray-400 mb-3 px-3 tracking-widest">
      My Groups
    </h3>
    <SidebarGroup text="Vietnam MechKey" />
    <SidebarGroup text="Artisan Keycaps Market" />
    <SidebarGroup text="Ameko Official Support" />
  </div>
);

// --- RIGHT SIDEBAR ---
export const RightSidebar: FC = () => (
  <div className="sticky top-32 space-y-6">
    {/* Trending Tags */}
    <div className="bg-[#1a1a1a] p-4 rounded-sm shadow-sm border border-[#2a2d31]">
      <h3 className="text-sm font-black uppercase mb-4 text-white">
        Trending Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {["#TKL", "#GMK", "#Artisan", "#AmekoBuild", "#DeskSetup"].map(
          (tag) => (
            <span
              key={tag}
              className="text-md bg-[#111] hover:bg-[#ce2a32] hover:text-white transition-colors px-2 py-1 rounded-md cursor-pointer font-medium text-gray-300"
            >
              {tag}
            </span>
          )
        )}
      </div>
    </div>

    {/* Top Builders */}
    <div className="bg-[#1a1a1a] p-4 rounded-md shadow-sm border border-[#2a2d31]">
      <h3 className="text-sm font-black uppercase mb-4 text-white">
        Top Builders
      </h3>
      <ul className="space-y-4">
        <BuilderRow name="KBD Fans" role="Verified Shop" />
        <BuilderRow name="Tín Dev" role="Pro Builder" />
        <BuilderRow name="Mochi Caps" role="Artisan" />
      </ul>
    </div>
  </div>
);

// Helper Components
const SidebarLink = ({
  icon,
  text,
  active,
}: {
  icon: ReactNode;
  text: string;
  active?: boolean;
}) => (
  <div
    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-colors ${
      active
        ? "bg-[#111] shadow-sm font-bold text-white border-l-4 border-[#ce2a32]"
        : "hover:bg-[#111] hover:shadow-sm text-gray-300"
    }`}
  >
    {icon}
    <span className="text-sm">{text}</span>
  </div>
);

const SidebarGroup = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer hover:bg-[#111] hover:shadow-sm transition-colors group">
    <div className="w-8 h-8 rounded-lg bg-[#2a2d31] group-hover:bg-[#3a3d42] transition-colors"></div>
    <span className="text-sm font-medium text-gray-400 group-hover:text-white">
      {text}
    </span>
  </div>
);

const BuilderRow = ({ name, role }: { name: string; role: string }) => (
  <li className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-[#2a2d31]"></div>
    <div>
      <p className="text-md font-bold text-white hover:text-[#ce2a32] cursor-pointer">
        {name}
      </p>
      <p className="text-[10px] uppercase text-gray-400 font-bold">{role}</p>
    </div>
    <button className="ml-auto text-md font-bold text-[#ce2a32]">Follow</button>
  </li>
);
