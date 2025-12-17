import { text } from "stream/consumers";
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0F0F10",
          text: "#FFFFFF",
          accent: "#E31E24",
        },
      },
      fontFamily: {
        // 1. Set font mặc định (sans) là Inter (cho dễ đọc văn bản)
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],

        // 2. Định nghĩa font Oswald (để dùng cho tiêu đề hoặc layout cũ)
        oswald: ["var(--font-oswald)", "sans-serif"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
