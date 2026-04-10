"use client";

import { FC } from "react";
import { PromoSection, PromoData } from "./PromoSection";

const PROMOS: PromoData[] = [
  {
    id: 1,
    title: "Customize Your Way",
    subtitle: "Keyboards",

    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY_-MX-101_frontpage-1_hwu37j.jpg",
    description:
      "Trải nghiệm âm thanh trong trẻo nhất với mic Ngale X. Thiết kế chuyên nghiệp cho Streamer và Content Creator với công nghệ lọc ồn chủ động.",
    link: "/shop/keyboards",
    ctaText: "ORDER NOW",
    position: "left",
    theme: "dark",
  },
  {
    id: 2,
    title: "Precision & Speed",
    subtitle: "Mice",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY-GP6_HYDRUS_frontpage_emfg0p.jpg",
    description:
      "Trải nghiệm độ chính xác cao và tốc độ phản hồi nhanh chóng với chuột Gaming XTRFY. Thiết kế ergonomics giúp bạn thoải mái trong mọi hoạt động.",
    link: "/shop/mice",
    ctaText: "ORDER NOW",

    position: "left",
    theme: "dark",
  },
  {
    id: 3,
    title: "Immersive Audio",
    subtitle: "Headsets",
    image:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY_-MX-8.3_frontpage_qbcpmv.jpg",
    description:
      "Trải nghiệm âm thanh sống động và chi tiết với tai nghe Gaming XTRFY. Thiết kế thoải mái và chất lượng âm thanh đỉnh cao cho mọi trận đấu.",
    link: "/shop/audio",
    ctaText: "ORDER NOW",
    position: "left",
    theme: "dark",
  },
];

export const PromoList: FC = () => {
  return (
    <div className="flex flex-col w-full gap-6 my-4 md:my-8 bg-amazon-bgSecondary">
      {PROMOS.map((promo) => (
        <PromoSection key={promo.id} data={promo} />
      ))}
    </div>
  );
};
