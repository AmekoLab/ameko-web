import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
});

// Lightweight wrappers around Next.js' navigation APIs
// that automatically handle the locale prefix
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
