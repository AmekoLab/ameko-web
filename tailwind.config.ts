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
      },
      animation: {
        "sound-wave": "sound-wave 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
