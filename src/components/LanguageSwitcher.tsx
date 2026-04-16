"use client";

import Image from "next/image"; // Bắt buộc import Image của Next.js
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/src/i18n/routing";

// Thay đổi cấu trúc mảng một chút cho khớp với code ngôn ngữ (vi, en)
const LOCALES = [
  { code: "vi", flagUrl: "/flags/vn.png", title: "Tiếng Việt" },
  { code: "en", flagUrl: "/flags/us.png", title: "English" }, // Dùng cờ US hoặc GB tùy bạn
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-md overflow-hidden ">
      {LOCALES.map(({ code, flagUrl, title }) => (
        <button
          key={code}
          onClick={() => handleSwitch(code)}
          title={title}
          className={`flex items-center justify-center w-8 h-6 transition-all rounded-sm cursor-pointer ${
            currentLocale === code
              ? "bg-white shadow-sm ring-1 ring-white/50"
              : "bg-transparent opacity-50 hover:opacity-100 hover:bg-white/10"
          }`}
        >
          {/* Dùng thẻ Image của Next.js để tối ưu hình ảnh */}
          <Image
            src={flagUrl}
            alt={title}
            width={20}
            height={14}
            className="rounded-[2px] object-cover" // object-cover giúp ảnh không bị méo
          />
        </button>
      ))}
    </div>
  );
}