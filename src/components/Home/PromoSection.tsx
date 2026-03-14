"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface PromoData {
  id: number;
  image: string;
  mobileImage?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  link: string;
  position: "left" | "right" | "center";
  theme: "dark" | "light";
  description: string;
}

export const PromoSection: FC<{ data: PromoData }> = ({ data }) => {
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
    <section className="relative w-full h-[500px] md:h-[650px] overflow-hidden group ">
      {/* 1. BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src={data.image}
          alt={data.title}
          fill
          className="object-cover transition-transform duration-[5000ms] group-hover:scale-105"
          sizes="100vw"
        />

        {data.mobileImage && (
          <Image
            src={data.mobileImage}
            alt={data.title}
            fill
            className="object-cover md:hidden"
          />
        )}

        <div
          className={`absolute inset-0 z-10 
            ${
              data.position === "left"
                ? "bg-gradient-to-r from-black via-transparent to-transparent"
                : ""
            }
            ${
              data.position === "right"
                ? "bg-gradient-to-l from-black via-transparent to-transparent"
                : ""
            }
            ${data.position === "center" ? "bg-black" : ""}
            ${data.theme === "light" ? "opacity-30" : "opacity-80"} 
          `}
        />
      </div>

      {/* 2. TEXT CONTENT */}
      <div
        className={`relative z-20 w-full h-full max-w-[1920px] mx-auto flex flex-col justify-center ${getPositionClasses(
          data.position,
        )}`}
      >
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Subtitle */}
            <p
              className={`text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-3
               ${data.theme === "dark" ? "text-gray-300" : "text-gray-800"}
            `}
            >
              {data.subtitle}
            </p>

            {/* Title */}
            <h2
              className={`text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8
               ${data.theme === "dark" ? "text-white" : "text-black"}
            `}
            >
              {data.title}
            </h2>

            {/* CTA Button */}
            <Link
              href={data.link}
              className={`
                group inline-flex items-center gap-3 px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-all duration-300 border-2
                ${
                  data.theme === "dark"
                    ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                    : "bg-black text-white border-black hover:bg-transparent hover:text-black"
                }
              `}
            >
              <span>{data.ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
