"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export const BecomeSellerSection = () => {
  const t = useTranslations("BecomeSellerSection");
  return (
    <section className="relative w-full pt-20 pb-26 lg:pb-40 px-4 lg:px-8 bg-amazon-bg text-amazon-text overflow-hidden ">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amazon-bgSecondary to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* --- LEFT: CONTENT --- */}
          <div className="space-y-8">
            <div>
              <span className="text-amazon-btnSecondary font-bold tracking-widest uppercase text-xs mb-3 block">
                {t("subtitle")}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-[0.9] mb-6">
                {t("titleLine1")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amazon-text to-amazon-textMuted">
                  {t("titleLine2")}
                </span>
              </h2>
              <p className="text-amazon-textMuted text-lg max-w-xl leading-relaxed">
                {t("description")}
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <BenefitItem
                icon={<Users className="w-6 h-6 text-amazon-btnSecondary" />}
                title={t("benefit1Title")}
                desc={t("benefit1Desc")}
              />
              <BenefitItem
                icon={<TrendingUp className="w-6 h-6 text-amazon-btnSecondary" />}
                title={t("benefit2Title")}
                desc={t("benefit2Desc")}
              />
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link
                href="/shop/register"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-amazon-btnPrimary text-amazon-text font-bold uppercase tracking-widest text-sm rounded-md hover:brightness-95 transition-all duration-300 shadow-sm"
              >
                {t("ctaText")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-xs text-amazon-textMuted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {t("freeReg")}
              </p>
            </div>
          </div>

          {/* --- RIGHT: IMAGE / VISUAL --- */}
          <div className="relative h-[400px] lg:h-[600px] w-full rounded-2xl overflow-hidden group border border-amazon-border shadow-sm">
            <Image
              src="https://res.cloudinary.com/doezwafgz/image/upload/v1770454504/CHERRY-XTRFY_TMR_divqop.jpg"
              alt="Mechanical Keyboard Workspace"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />

            {/* Floating Badge */}
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md border border-amazon-border p-5 rounded-xl max-w-xs shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-amazon-btnSecondary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-amazon-textMuted">
                  {t("badgeLabel")}
                </span>
              </div>
              <p className="text-sm font-medium text-amazon-text italic">
                {t("quote")}
              </p>
              <p className="text-xs text-amazon-textMuted mt-2 font-bold uppercase not-italic">
                {t("quoteAuthor")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper Component
const BenefitItem = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="flex gap-4">
    <div className="mt-1 p-2 bg-amazon-bgSecondary rounded-lg h-fit border border-amazon-border">{icon}</div>
    <div>
      <h4 className="font-bold text-amazon-text uppercase text-sm mb-2 tracking-wide">
        {title}
      </h4>
      <p className="text-amazon-textMuted text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);
