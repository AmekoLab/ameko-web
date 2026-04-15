"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Settings, MousePointer2, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

export const BuilderCTA: FC = () => {
  const t = useTranslations("BuilderCTA");
  return (
    <section className="relative bg-amazon-bg text-amazon-text py-24 overflow-hidden">
      {/* Background Pattern  */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-amazon-btnPrimary rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* LEFT: Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-amazon-btnSecondary font-bold tracking-widest uppercase text-sm mb-2 block">
                {t("sectionSubtitle")}
              </span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.9] mb-6 text-amazon-text">
                {t("titleLine1")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amazon-text to-amazon-textMuted">
                  {t("titleLine2")}
                </span>
              </h2>
              <p className="text-amazon-textMuted text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t.rich("description", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </motion.div>

            {/* Features Icon */}
            <div className="grid grid-cols-3 gap-4 border-t border-amazon-border pt-8">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <Layers className="w-8 h-8 text-amazon-btnSecondary" />
                <span className="text-xs font-bold uppercase text-amazon-textMuted tracking-tight lg:tracking-normal text-center lg:text-left">
                  {t("feature1")}
                </span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <MousePointer2 className="w-8 h-8 text-amazon-btnSecondary" />
                <span className="text-xs font-bold uppercase text-amazon-textMuted tracking-tight lg:tracking-normal text-center lg:text-left">
                  {t("feature2")}
                </span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <Settings className="w-8 h-8 text-amazon-btnSecondary" />
                <span className="text-xs font-bold uppercase text-amazon-textMuted tracking-tight lg:tracking-normal text-center lg:text-left">
                  {t("feature3")}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/builder"
                className="inline-flex items-center justify-center bg-amazon-btnPrimary text-amazon-text px-10 py-4 text-sm font-bold uppercase tracking-widest hover:brightness-95 transition-all duration-300 rounded-md shadow-sm"
              >
                {t("ctaText")}
              </Link>
            </div>
          </div>

          {/* RIGHT: Image (Exploded Keyboard) */}
          <div className="flex-1 w-full relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-[4/3]"
            >
              <Image
                src="https://res.cloudinary.com/doezwafgz/image/upload/v1773519922/home5_uukgy0.jpg"
                alt="Keyboard Builder Preview"
                fill
                className="object-contain drop-shadow-2xl"
              />

              {/* Floating Badge */}
              <div className="absolute top-10 right-10 bg-white backdrop-blur-md border border-amazon-border p-4 rounded-sm text-center shadow-sm">
                <span className="block text-3xl font-bold text-amazon-text">
                  {t("badgeValue")}
                </span>
                <span className="text-[10px] uppercase font-bold text-amazon-textMuted">
                  {t("badgeLabel")}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
