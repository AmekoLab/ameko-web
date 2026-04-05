"use client";

import { FC, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Play, Pause, ArrowDown } from "lucide-react";

// ─── DATA INTERFACE ───────────────────────────────────────────────────────────

interface HeroVideoProps {
  videoSrc?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

// ─── DEFAULT MOCK DATA ────────────────────────────────────────────────────────

const defaults = {
  videoSrc:
    "https://res.cloudinary.com/doezwafgz/video/upload/v1773517076/Galleon_homepage-hero_desktop_wurhlq.mp4",
  title: "AMEKO",
  subtitle: "DESIGN YOUR DREAM KEYBOARD",
  ctaText: "START CUSTOMIZING",
  ctaHref: "/custom-build",
} as const;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export const HeroVideoSection: FC<HeroVideoProps> = ({
  videoSrc = defaults.videoSrc,
  title = defaults.title,
  subtitle = defaults.subtitle,
  ctaText = defaults.ctaText,
  ctaHref = defaults.ctaHref,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  return (
    <section className="relative w-full h-[60vh] min-h-[500px] lg:min-h-[500px] overflow-hidden bg-black">
      {/* ── BACKGROUND VIDEO ──────────────────────────────────────────── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* ── GRADIENT OVERLAY ──────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0f12] z-10" />

      {/* ── CENTERED CONTENT ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-light text-white uppercase tracking-[0.1em] mb-4 leading-none">
          {title}
        </h1>
        <p className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-[0.3em] mb-8">
          {subtitle}
        </p>
        <Link
          href={ctaHref}
          className="bg-[#f5d800] text-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors duration-300"
        >
          {ctaText}
        </Link>
      </div>

      {/* ── SCROLL INDICATOR (Bottom Center) ──────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <ArrowDown className="w-6 h-6 text-[#f5d800] animate-bounce" />
      </div>

      {/* ── PLAY / PAUSE TOGGLE (Bottom Right) ────────────────────────── */}
      <button
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        className="absolute bottom-8 right-8 z-20 w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
    </section>
  );
};
