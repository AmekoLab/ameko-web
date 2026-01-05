import { Product } from "@/src/types/product";

import { MOCK_PRODUCTS } from "@/src/data/product";

export const ProductService = {
  /**
   * 1. API lấy chi tiết sản phẩm theo Slug
   * (Mô phỏng call API backend)
   */
  getBySlug: async (slug: string): Promise<Product | null> => {
    // Giả lập delay mạng (để test Loading state nếu cần)
    // await new Promise((resolve) => setTimeout(resolve, 500));

    const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return product || null;
  },

  /**
   * 2. API lấy sản phẩm liên quan
   * Logic: Lấy các sản phẩm khác, trừ sản phẩm hiện tại
   */
  getRelated: async (slug: string): Promise<Product[]> => {
    // Trong thực tế: Gọi thuật toán gợi ý (cùng category, cùng tag...)
    // Ở đây mock: Lấy danh sách sản phẩm, loại bỏ sản phẩm đang xem
    const related = MOCK_PRODUCTS.filter((p) => p.slug !== slug).slice(0, 4);

    return related;
  },
};
