import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Giữ lại brand cũ tạm thời để các trang chưa sửa không bị lỗi
        brand: {
          bg: "#0F0F10",
          text: "#FFFFFF",
          accent: "#E31E24",
        },
        // --- BỘ MÀU LIGHT RETAIL THEME (CHUẨN AMAZON) ---
        amazon: {
          bg: '#FFFFFF',             // Nền trắng tinh (Main background)
          bgSecondary: '#F9F9FA',    // Nền xám nhạt (Card, khung phụ)
          header: '#131A22',         // Đen xanh đậm (Navbar chính)
          headerLight: '#232F3E',    // Đen xanh nhạt hơn (Sub-navbar)
          text: '#0F1111',           // Chữ chính (Đen nhám, dễ đọc)
          textMuted: '#565959',      // Chữ phụ (Xám Amazon)
          link: '#2162a1',           // Xanh Teal (Icon, Link)
          price: '#B12704',          // Đỏ Burgundy (Giá tiền, giảm giá)
          btnPrimary: '#FFD814',     // Vàng Amazon (Nút: Thêm vào giỏ)
          btnSecondary: '#FFA41C',   // Cam Amazon (Nút: Mua ngay)
          border: '#D5D9D9',         // Viền xám mỏng
          focus: '#E77600',          // Cam viền khi hover/focus
          hover: '#0c3353'
        }
      },
      fontFamily: {
        // Cập nhật font chữ chuẩn theo file globals.css
        sans: ["Amazon Ember", "Arial", "sans-serif"],
        display: ["Amazon Ember Display", "Amazon Ember", "sans-serif"],
        
        // Giữ lại font cũ của bạn
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