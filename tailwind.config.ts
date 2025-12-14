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
    },
  },
  plugins: [typography],
} satisfies Config;
