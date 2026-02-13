import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

import defaultTheme from "tailwindcss/defaultTheme";

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
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],

        oswald: ["var(--font-oswald)", "sans-serif"],
      },
      keyframes: {
        "sound-wave": {
          "0%, 100%": { height: "20%" },
          "50%": { height: "100%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "sound-wave": "sound-wave 1.2s ease-in-out infinite",
        fadeIn: "fadeIn 250ms ease-out forwards",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
