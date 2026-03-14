"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── DATA INTERFACE ───────────────────────────────────────────────────────────

interface SplitPromoCard {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  imageSrc: string;
}

interface SplitPromoSectionProps {
  cards?: [SplitPromoCard, SplitPromoCard];
}

// ─── DEFAULT MOCK DATA ────────────────────────────────────────────────────────

const defaultCards: [SplitPromoCard, SplitPromoCard] = [
  {
    title: "CUSTOM BUILDS",
    subtitle: "Build your dream PC from scratch",
    ctaText: "START BUILDING",
    ctaHref: "/builder",
    imageSrc:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1773520076/home6_lcqhgc.jpg",
  },

  {
    title: "PC CASES",
    subtitle: "Premium towers for every setup",
    ctaText: "SHOP CASES",
    ctaHref: "/shop?category=cases",
    imageSrc:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1773519760/home4_scaovf.jpg",
  },
];

// ─── CORNER BRACKETS SUB-COMPONENT ───────────────────────────────────────────

// ─── CORNER BRACKETS SUB-COMPONENT (GHIM SÁT 4 CẠNH ẢNH) ───────────────

const CornerBrackets: FC = () => (
  <>
    {/* Top-Left */}
    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white opacity-0 group-hover:opacity-80 transition-all duration-700 ease-out z-20 pointer-events-none" />

    {/* Top-Right */}
    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white opacity-0 group-hover:opacity-80 transition-all duration-700 ease-out z-20 pointer-events-none" />

    {/* Bottom-Left */}
    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white opacity-0 group-hover:opacity-80 transition-all duration-700 ease-out z-20 pointer-events-none" />

    {/* Bottom-Right */}
    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white opacity-0 group-hover:opacity-80 transition-all duration-700 ease-out z-20 pointer-events-none" />
  </>
);
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export const SplitPromoSection: FC<SplitPromoSectionProps> = ({
  cards = defaultCards,
}) => {
  return (
    <section className="w-full bg-black text-white py-6 overflow-hidden">
      {/* 💡 SỬA 1: Gỡ bỏ max-w-[1920px] và padding (px-4) để tràn viền 100% ngang */}
      <div className="w-full">
        {/* 💡 SỬA 2: Dùng gap-1 hoặc gap-2 để khe hở giữa 2 ảnh mỏng lại, ngầu hơn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-2">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.ctaHref}
              // 💡 SỬA 3 (Tùy chọn): Nếu muốn nó cao full màn hình luôn, đổi h-[700px] thành h-screen
              className="relative w-full h-[500px] lg:h-[800px] bg-[#151515] overflow-hidden group cursor-pointer block"
            >
              {/* Background Image */}
              <Image
                src={card.imageSrc}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-[800ms] group-hover:scale-105 "
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 border border-transparent group-hover:border-white/30 transition-colors duration-500 z-20 pointer-events-none" />
              {/* Corner Brackets */}
              <CornerBrackets />

              {/* Text & CTA — Bottom Centered */}
              <div className="absolute bottom-0 left-0 w-full p-10 z-30 flex flex-col items-center text-center group-hover:-translate-y-4 transition-transform duration-700 ease-out">
                <h2 className="text-3xl lg:text-[40px] font-light text-white uppercase tracking-widest mb-3 leading-tight">
                  {card.title}
                </h2>
                <p className="text-[11px] lg:text-xs font-bold text-gray-300 uppercase tracking-[0.2em] mb-8">
                  {card.subtitle}
                </p>
                <span className="bg-[#f5d800] text-black px-10 py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-white transition-colors duration-300 inline-block">
                  {card.ctaText}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
