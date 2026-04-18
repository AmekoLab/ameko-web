"use client";

import { useTranslations } from "next-intl";

interface SoundTestProps {
  videoUrl: string;
  description: string;
}

export const SoundTestSection = ({ videoUrl, description }: SoundTestProps) => {
  const t = useTranslations("SoundTestSection");

  return (
    <div className="relative w-[100vw] left-1/2 -translate-x-1/2 bg-amazon-bgSecondary text-amazon-text py-8 group overflow-hidden">
      {/* Yellow glow orb */}

      <div className="max-w-[1280px] mx-auto px-4 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="text-left">
            {/* Eyebrow */}
            <p className="text-[14px] font-black uppercase tracking-[0.3em] text-amazon-link mb-3">
              {t("eyebrow")}
            </p>
            <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h2>
            <p className="text-amazon-textMuted text-base mb-10 max-w-md leading-relaxed">
              {description}
            </p>

            {/* Sound Wave Animation — yellow bars */}
            <div className="flex items-end gap-1 h-16 opacity-70">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-amazon-btnSecondary animate-sound-wave"
                  style={{ animationDelay: `-${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>

          {/* Video */}
          <div className="relative w-full aspect-video bg-white shadow-sm border border-amazon-border rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title={t("iframeTitle")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
