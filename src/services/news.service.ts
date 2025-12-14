import { NEWS_DATABASE, NewsItem } from "@/src/lib/mockData";

// TODO: [API] Định nghĩa lại Interface này khớp với response từ Backend (NestJS/.NET)
// Ví dụ: thêm field created_at, updated_at, author_id...
export type NewsArticle = NewsItem;

export const NewsService = {
  /**
   * Lấy danh sách tin tức (có thể phân trang sau này)
   */
  getAll: async (): Promise<NewsArticle[]> => {
    // TODO: [API] Thay thế đoạn này bằng fetch API
    // const res = await fetch('https://api.ameko.com/v1/news');
    // return res.json();

    // Giả lập độ trễ mạng (Network delay) để test loading
    await new Promise((resolve) => setTimeout(resolve, 100));
    return NEWS_DATABASE;
  },

  /**
   * Lấy chi tiết tin tức theo Slug
   * @param slug - Đường dẫn tĩnh của bài viết
   */
  getBySlug: async (slug: string): Promise<NewsArticle | undefined> => {
    // TODO: [API] Gọi API chi tiết
    // const res = await fetch(`https://api.ameko.com/v1/news/${slug}`);
    // if (!res.ok) return undefined;
    // return res.json();

    await new Promise((resolve) => setTimeout(resolve, 100));
    return NEWS_DATABASE.find((item) => item.slug === slug);
  },

  /**
   * TODO: [API] Thêm hàm lấy bài viết liên quan (Related News)
   * API thường gợi ý bài viết cùng category
   */
  getRelated: async (
    category: string,
    currentSlug: string
  ): Promise<NewsArticle[]> => {
    // Logic mock tạm thời
    return NEWS_DATABASE.filter(
      (i) => i.category === category && i.slug !== currentSlug
    ).slice(0, 3);
  },
};
