"use client";
import { FC, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Flame, Hash, Users, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { CommunityShopSearch } from "@/src/components/Community/CommunityShopSearch";

// --- LEFT SIDEBAR ---
export const LeftSidebar: FC = () => {
  const t = useTranslations("CommunitySidebar");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFeed = searchParams.get("feed") || "personalized";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("user"));
  }, []);

  const handleFeedChange = (feed: string) => {
    router.push(`?feed=${feed}`, { scroll: false });
  };

  return (
  <div className=" top-8 space-y-2 sticky">
    {isLoggedIn ? (
      <>
        <SidebarLink
          icon={<Flame className="w-5 h-5 text-amazon-btnSecondary " />}
          text={t("personalized")}
          active={currentFeed === "personalized"}
          onClick={() => handleFeedChange("personalized")}
        />
        <SidebarLink
          icon={<Flame className="w-5 h-5 text-amazon-btnSecondary " />}
          text={t("newsFeed")}
          active={currentFeed === "standard"}
          onClick={() => handleFeedChange("standard")}
        />
      </>
    ) : (
      <SidebarLink
        icon={<Flame className="w-5 h-5 text-amazon-btnSecondary" />}
        text={t("newsFeed")}
        active={true}
      />
    )}
    {/* <SidebarLink icon={<Hash className="w-5 h-5" />} text={t("exploreTopics")} />
    <SidebarLink icon={<Users className="w-5 h-5" />} text={t("groups")} />
    <SidebarLink
      icon={<TrendingUp className="w-5 h-5" />}
      text={t("trendingBuilds")}
    /> */}

    {/* <div className="border-t border-amazon-border my-4"></div> */}

    {/* <h3 className="text-md font-black uppercase text-amazon-textMuted mb-3 px-3 tracking-widest">
      {t("myGroups")}
    </h3>
    <SidebarGroup text={t("groupVietnamMechKey")} />
    <SidebarGroup text={t("groupArtisanMarket")} />
    <SidebarGroup text={t("groupOfficialSupport")} /> */}
  </div>
  );
};

// --- RIGHT SIDEBAR ---
export const RightSidebar: FC = () => {
  const t = useTranslations("CommunitySidebar");
  return (
  <div className=" top-8 space-y-6 sticky">
    {/* Shop Search Bar */}
    <CommunityShopSearch />

    {/* Trending Tags */}
  </div>
  );
};

// Helper Components
const SidebarLink = ({
  icon,
  text,
  active,
  onClick,
}: {
  icon: ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
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
