"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  GitMerge,
  Info,
  MousePointer2,
  PlayCircle,
  Save,
  Trash2,
  X,
  Copy,
  UploadCloud,
} from "lucide-react";

export default function RuleBuilderGuide() {
  const t = useTranslations("RuleBuilderGuide");
  const steps = [
    { icon: MousePointer2, title: t("step1Title"), content: t("step1Content") },
    { icon: GitMerge, title: t("step2Title"), content: t("step2Content") },
    { icon: Copy, title: t("step3Title"), content: t("step3Content") },
    { icon: UploadCloud, title: t("step4Title"), content: t("step4Content") },
    { icon: Trash2, title: t("step5Title"), content: t("step5Content") },
    { icon: Save, title: t("step6Title"), content: t("step6Content") },
  ];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-50"
      >
        <span className="text-blue-700">[?]</span>
        <span>{t("openGuide")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 rounded-md border border-blue-200 bg-white p-1.5 text-blue-700 transition-colors hover:bg-blue-50"
              aria-label={t("closeGuide")}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2.5 pr-10">
                <div className="rounded-full border border-blue-200 bg-white p-1.5">
                  <Info className="h-4 w-4 text-blue-700" />
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-bold text-blue-900">
                    {t("guideTitle")}
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug text-blue-900/90">
                    {t("guideSubtitle")}
                  </p>
                </div>
              </div>

              <div className="mt-3 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-3 py-1.5">
                  <PlayCircle className="h-4 w-4 text-blue-700" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                    {t("videoLabel")}
                  </span>
                </div>

                <div className="flex justify-center p-2">
                  <div className="w-auto max-h-[250px] overflow-hidden rounded-lg border border-blue-100">
                    <video
                      src="https://res.cloudinary.com/doezwafgz/video/upload/v1776516223/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_K%C3%A9o_Th%E1%BA%A3_Linh_Ki%E1%BB%87n_mane3b.mp4"
                      controls
                      playsInline
                      className="h-full max-h-[250px] w-auto object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-blue-200 bg-white p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-blue-100 p-1.5">
                          <Icon className="h-4 w-4 text-blue-700" />
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-blue-900">
                            {step.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] leading-snug text-blue-900/90">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
