"use client";
import { FC, ReactNode } from "react";
import { Flame, Hash, Users, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

// --- LEFT SIDEBAR ---
export const LeftSidebar: FC = () => {
  const t = useTranslations("CommunitySidebar");
  return (
  <div className=" top-32 space-y-2">
    <SidebarLink
      icon={<Flame className="w-5 h-5 text-amazon-btnSecondary" />}
      text={t("newsFeed")}
      active
    />
    <SidebarLink icon={<Hash className="w-5 h-5" />} text={t("exploreTopics")} />
    <SidebarLink icon={<Users className="w-5 h-5" />} text={t("groups")} />
    <SidebarLink
      icon={<TrendingUp className="w-5 h-5" />}
      text={t("trendingBuilds")}
    />

    <div className="border-t border-amazon-border my-4"></div>

    <h3 className="text-md font-black uppercase text-amazon-textMuted mb-3 px-3 tracking-widest">
      {t("myGroups")}
    </h3>
    <SidebarGroup text={t("groupVietnamMechKey")} />
    <SidebarGroup text={t("groupArtisanMarket")} />
    <SidebarGroup text={t("groupOfficialSupport")} />
  </div>
  );
};

// --- RIGHT SIDEBAR ---
export const RightSidebar: FC = () => {
  const t = useTranslations("CommunitySidebar");
  return (
  <div className=" top-32 space-y-6">
    {/* Trending Tags */}
    <div className="bg-white p-4 rounded-sm shadow-sm border border-amazon-border">
      <h3 className="text-sm font-black uppercase mb-4 text-amazon-text">
        {t("trendingTags")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {["#TKL", "#GMK", "#Artisan", "#AmekoBuild", "#DeskSetup"].map(
          (tag) => (
            <span
              key={tag}
              className="text-md bg-amazon-bgSecondary hover:bg-neutral-50 transition-colors border border-amazon-border px-2 py-1 rounded-md cursor-pointer font-medium text-amazon-textMuted hover:text-amazon-text"
            >
              {tag}
            </span>
          )
        )}
      </div>
    </div>

    {/* Top Builders */}
    <div className="bg-white p-4 rounded-md shadow-sm border border-amazon-border">
      <h3 className="text-sm font-black uppercase mb-4 text-amazon-text">
        {t("topBuilders")}
      </h3>
      <ul className="space-y-4">
        <BuilderRow name="KBD Fans" role={t("verifiedShop")} btnText={t("follow")} />
        <BuilderRow name="Tín Dev" role={t("proBuilder")} btnText={t("follow")} />
        <BuilderRow name="Mochi Caps" role={t("artisan")} btnText={t("follow")} />
      </ul>
    </div>
  </div>
  );
};

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
        ? "bg-neutral-50 shadow-sm font-bold text-amazon-text border-l-4 border-amazon-btnSecondary"
        : "hover:bg-neutral-50 hover:shadow-sm text-amazon-textMuted"
    }`}
  >
    {icon}
    <span className="text-sm">{text}</span>
  </div>
);

const SidebarGroup = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer hover:bg-neutral-50 hover:shadow-sm transition-colors group">
    <div className="w-8 h-8 rounded-lg bg-neutral-200 group-hover:bg-neutral-300 transition-colors"></div>
    <span className="text-sm font-medium text-amazon-textMuted group-hover:text-amazon-text">
      {text}
    </span>
  </div>
);

const BuilderRow = ({ name, role, btnText }: { name: string; role: string; btnText: string }) => (
  <li className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
    <div>
      <p className="text-md font-bold text-amazon-text hover:text-amazon-btnSecondary cursor-pointer">
        {name}
      </p>
      <p className="text-[10px] uppercase text-amazon-textMuted font-bold">{role}</p>
    </div>
    <button className="ml-auto text-md font-bold text-amazon-link">{btnText}</button>
  </li>
);
