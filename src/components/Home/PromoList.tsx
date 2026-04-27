"use client";

import { FC } from "react";
import { PromoSection, PromoData } from "./PromoSection";

import { useTranslations } from "next-intl";

export const PromoList: FC = () => {
  const t = useTranslations("PromoList");

  const PROMOS: PromoData[] = [
    {
      id: 1,
      title: t("promo1Title"),
      subtitle: t("promo1Subtitle"),
      image:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY_-MX-101_frontpage-1_hwu37j.jpg",
      description: t("promo1Desc"),
      link: "/shop/all-products",
      ctaText: t("promo1Cta"),
      position: "left",
      theme: "dark",
    },
    {
      id: 2,
      title: t("promo2Title"),
      subtitle: t("promo2Subtitle"),
      image:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY-GP6_HYDRUS_frontpage_emfg0p.jpg",
      description: t("promo2Desc"),
      link: "/shop/all-products",
      ctaText: t("promo2Cta"),
      position: "left",
      theme: "dark",
    },
    {
      id: 3,
      title: t("promo3Title"),
      subtitle: t("promo3Subtitle"),
      image:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY_-MX-8.3_frontpage_qbcpmv.jpg",
      description: t("promo3Desc"),
      link: "/shop/all-products",
      ctaText: t("promo3Cta"),
      position: "left",
      theme: "dark",
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6 my-4 md:my-8 bg-amazon-bgSecondary">
      {PROMOS.map((promo) => (
        <PromoSection key={promo.id} data={promo} />
      ))}
    </div>
  );
};
