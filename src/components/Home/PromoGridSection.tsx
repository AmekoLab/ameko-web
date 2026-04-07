"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Keyboard,
  Truck,
  Headset,
  RotateCcw,
  LucideIcon,
} from "lucide-react";

// ─── DATA INTERFACES ─────────────────────────────────────────────────────────

interface TrustBadge {
  icon: LucideIcon;
  line1: string;
  line2: string;
}

interface HeroCard {
  imageSrc: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

interface PromoCard {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageSrc: string;
}

interface PromoGridSectionProps {
  heroCard?: HeroCard;
  promoCards?: [PromoCard, PromoCard];
}

// ─── DEFAULT MOCK DATA ────────────────────────────────────────────────────────

const defaultTrustBadges: TrustBadge[] = [
  { icon: Keyboard, line1: "CUSTOM BUILT", line2: "TO ORDER" },
  { icon: Truck, line1: "FREE SHIPPING", line2: "ON ORDERS $99+" },
  { icon: Headset, line1: "24/7 SUPPORT", line2: "EXPERT HELP" },
  { icon: RotateCcw, line1: "30-DAY", line2: "RETURNS" },
];

const defaultHeroCard: HeroCard = {
  imageSrc:
    "https://res.cloudinary.com/doezwafgz/image/upload/v1773515614/home1_zsz8bq.png",
  title: "AMEKO CUSTOM LAB",
  subtitle: "Your all-in-one custom creator",
  ctaText: "START CUSTOMIZING",
  ctaHref: "/shop",
};

const defaultPromoCards: [PromoCard, PromoCard] = [
  {
    title: "CUSTOM KEYCAPS",
    description:
      "Personalize your setup with premium PBT double-shot keycaps. Choose from hundreds of colorways and profiles.",
    ctaText: "SHOP NOW",
    ctaHref: "/shop?category=keycaps",
    imageSrc:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1773515613/home2_xpdnpr.png",
  },
  {
    title: "DESK MATS & GEAR",
    description:
      "Complete your battlestation with precision-stitched desk mats, wrist rests, and essential peripherals.",
    ctaText: "PLAN YOUR BUILD",
    ctaHref: "/shop?category=accessories",
    imageSrc:
      "https://res.cloudinary.com/doezwafgz/image/upload/v1773515614/home3_nw6ntt.png",
  },
];

// ─── BENEFIT BAR ──────────────────────────────────────────────────────────────

const BenefitBar: FC = () => (
  <div className="w-full bg-amazon-headerLight py-5 ">
    <div className="max-w-[1920px] mx-auto px-6 lg:px-12 flex flex-col xl:flex-row justify-between items-center gap-8">
      {/* Left — Title */}
      <div className="flex flex-col items-center xl:items-start text-center xl:text-left shrink-0">
        <h3 className="text-white font-bold text-xl lg:text-3xl uppercase tracking-wider leading-snug">
          WHY BUY DIRECT
          <br />
          FROM AMEKO?
        </h3>
        <Link
          href="/about"
          className="text-amazon-btnPrimary text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 mt-2"
        >
          LEARN MORE <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Right — Badges */}
      <div className="flex flex-wrap justify-center xl:flex-nowrap gap-8 lg:gap-14">
        {defaultTrustBadges.map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="text-[11px] text-white uppercase font-bold leading-[1.3] tracking-wide hidden sm:block">
                {badge.line1}
                <br />
                {badge.line2}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export const PromoGridSection: FC<PromoGridSectionProps> = ({
  heroCard = defaultHeroCard,
  promoCards = defaultPromoCards,
}) => {
  return (
    <section className="w-full bg-amazon-bgSecondary">
      {/* [A] Benefit Bar */}
      <BenefitBar />

      {/* [B] Promo Grid — flush, no outer padding */}
      <div className="max-w-[1920px] mx-auto pb-4">
        <div
          className="grid grid-cols-1 lg:grid-cols-[50fr_50fr]"
          style={{ gap: "14px" }}
        >
          {/* ── COL 1: HERO — full-bleed image, text overlaid at bottom ── */}
          <div className="relative overflow-hidden group min-h-[480px] lg:min-h-[700px]">
            <Image
              src={heroCard.imageSrc}
              alt={heroCard.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
            />
            {/* Bottom gradient so text is always legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            {/* Text overlay — bottom left */}
            <div className="absolute bottom-0 left-0 p-7 lg:p-10">
              <h2 className="text-2xl lg:text-[28px] font-black uppercase text-white tracking-wider leading-tight">
                {heroCard.title}
              </h2>
              <p className="text-sm text-gray-200 mt-1 leading-snug max-w-sm">
                {heroCard.subtitle}
              </p>
              <Link
                href={heroCard.ctaHref}
                className="inline-flex items-center gap-1 mt-4 text-amazon-btnPrimary hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                {heroCard.ctaText} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ── COL 2: TWO STACKED PROMO CARDS ── */}
          <div className="flex flex-col" style={{ gap: "14px" }}>
            {promoCards.map((card, i) => (
              <div
                key={i}
                className="flex flex-row group overflow-hidden flex-1 min-h-[200px] lg:min-h-[298px]"
              >
                {/* Left — Text block (dark bg) */}
                <div className="w-[45%] bg-amazon-headerLight flex flex-col justify-start p-4 lg:p-6 shrink-0">
                  <h3 className="text-base lg:text-lg font-bold uppercase text-white tracking-wider leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-300 leading-relaxed mt-2 lg:mt-3">
                    {card.description}
                  </p>
                  <Link
                    href={card.ctaHref}
                    className="inline-flex items-center gap-1 mt-5 lg:mt-7 text-amazon-btnPrimary hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors"
                  >
                    {card.ctaText} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Right — Image (flush to edge) */}
                <div className="flex-1 relative overflow-hidden">
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 22vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
