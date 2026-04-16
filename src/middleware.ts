import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Bắt TẤT CẢ các đường dẫn để tự động thêm ngôn ngữ
    // Ngoại trừ:
    // - api routes (/api/...)
    // - Next.js internals (/_next/...)
    // - Các file tĩnh có đuôi mở rộng (như .ico, .png, .css, .svg...)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};