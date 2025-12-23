// src/types/review.ts

export interface ReviewAuthor {
  name: string;
  avatar: string;
  isVerified?: boolean; // Đã mua hàng chưa?
}

export interface Review {
  id: string;
  productId: string;
  author: ReviewAuthor;
  rating: number; // 1-5
  date: string; // ISO String
  content: string;
  images?: string[]; // Ảnh khách chụp
  likes: number; // Số người thấy hữu ích
  reply?: {
    // Shop phản hồi
    author: string;
    content: string;
    date: string;
  };
}

export interface ReviewStats {
  average: number;
  totalCount: number;
  distribution: {
    star: number; // 5, 4, 3, 2, 1
    count: number;
    percent: number; // Dùng để vẽ thanh progress bar
  }[];
}
