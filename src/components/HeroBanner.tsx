"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide, useSwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// --- INTERFACE & DATA ---
interface BannerData {
  id: number;
  image: string;
  mobileImage?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  position: "left" | "center" | "right";
  theme: "dark" | "light";
}

// --- DATA ---
const BANNERS: BannerData[] = [
  {
    id: 1,
    image: "/banners/image.png",
    title: "FIND YOUR PERFECT\nTYPING FEEL.",
    subtitle: "New CHERRY MX switches available.",
    ctaText: "ORDER NOW",
    ctaLink: "/shop",
    theme: "light",
    position: "left",
  },
  {
    id: 2,
    image: "/banners/banner-2.png",
    title: "XTRFY M8 WIRELESS",
    subtitle: "Ultra-low front. Unique shape. Top-tier performance.",
    ctaText: "DISCOVER M8",
    ctaLink: "/product/m8-wireless",
    theme: "dark",
    position: "left",
  },
  {
    id: 3,
    image: "/banners/banner-4.jpg",
    title: "K5 COMPACT",
    subtitle: "The world's most customizable keyboard.",
    ctaText: "CUSTOMIZE YOURS",
    ctaLink: "/builder",
    theme: "dark",
    position: "left",
  },
];

// --- COMPONENT CON: HERO SLIDE ITEM ---
// Tách hẳn ra để dùng hook useSwiperSlide an toàn nhất
const HeroSlideItem = ({ banner }: { banner: BannerData }) => {
  const { isActive } = useSwiperSlide(); // Kiểm tra xem slide này có đang hiện không

  // Helper chỉnh vị trí chữ
  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case "left":
        return "items-start text-left pl-6 md:pl-20";
      case "right":
        return "items-end text-right pr-6 md:pr-20";
      case "center":
      default:
        return "items-center text-center px-6";
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 1. BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0 bg-black">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          // Chỉ ưu tiên load ảnh nếu là slide 1, các slide sau để lazy load cho nhẹ
          priority={banner.id === 1}
          className="object-cover object-center hidden md:block transition-transform duration-[10000ms] hover:scale-105"
          sizes="100vw"
        />
        <Image
          src={banner.mobileImage || banner.image}
          alt={banner.title}
          fill
          priority={banner.id === 1}
          className="object-cover object-center md:hidden"
          sizes="100vw"
        />

        {/* Overlay Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/20 to-transparent opacity-80 z-10 
           ${banner.position === "right" ? "md:bg-gradient-to-l" : ""} 
           ${banner.position === "center" ? "bg-black/40" : ""}
        `}
        />
      </div>

      {/* 2. CONTENT TEXT */}
      <div
        className={`relative z-20 w-full h-full max-w-[1920px] mx-auto flex flex-col justify-center ${getPositionClasses(
          banner.position
        )}`}
      >
        <div className="max-w-3xl w-full space-y-4 md:space-y-6 pt-10 md:pt-0">
          {/* Title Animation: Chỉ chạy khi isActive = true */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white drop-shadow-lg"
          >
            {banner.title}
          </motion.h2>

          {/* Subtitle Animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-xl lg:text-2xl font-medium text-gray-200 max-w-lg drop-shadow-md"
          >
            {banner.subtitle}
          </motion.p>

          {/* Button Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4"
          >
            <Link
              href={banner.ctaLink}
              className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black overflow-hidden font-bold tracking-wider uppercase text-sm md:text-base hover:bg-primary-600 hover:text-white transition-all duration-300 rounded-sm shadow-xl hover:shadow-primary-600/30"
            >
              <span className="relative z-10">{banner.ctaText}</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export const HeroBanner: FC = () => {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[850px] bg-black overflow-hidden group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        // 🔥 FIX QUAN TRỌNG: crossFade=true giúp ảnh không bị chồng lấn nhau
        fadeEffect={{ crossFade: true }}
        speed={1000}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        className="w-full h-full hero-swiper"
      >
        {BANNERS.map((banner) => (
          <SwiperSlide key={banner.id} className="relative w-full h-full">
            {/* Gọi Component con đã tách */}
            <HeroSlideItem banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
