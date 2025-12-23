import { Review, ReviewStats } from "@/src/types/review";

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "zoom75-ee-wireless",
    author: {
      name: "Alex Nguyen",
      avatar:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
      isVerified: true,
    },
    rating: 5,
    date: "2023-11-15",
    content:
      "Build quality tuyệt vời. Màn hình LCD rất nét, app dễ dùng. Giao hàng nhanh đóng gói cẩn thận.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/produc1_jc0ojq.png",
    ],
    likes: 12,
  },
  {
    id: "r2",
    productId: "zoom75-ee-wireless",
    author: {
      name: "Sarah Le",
      avatar:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/860b82562025dfad0c1fd0233f6e7ffe_maexju.jpg",
      isVerified: true,
    },
    rating: 4,
    date: "2023-10-20",
    content:
      "Phím ngon nhưng stab stock hơi lỏng, cần lube lại chút là perfect. Màu Milk Tea bên ngoài đẹp hơn ảnh.",
    likes: 5,
    reply: {
      author: "Ameko Support",
      content:
        "Cảm ơn Sarah đã feedback. Bên mình sẽ lưu ý QC kỹ phần stab hơn ạ!",
      date: "2023-10-21",
    },
  },

  {
    id: "r3",
    productId: "zoom75",
    author: { name: "John Doe", avatar: "" },
    rating: 5,
    date: "2023-09-01",
    content: "Good!",
    likes: 0,
  },
];

export const ReviewService = {
  // Lấy danh sách review theo sản phẩm
  getByProductSlug: async (slug: string): Promise<Review[]> => {
    // Giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_REVIEWS;
  },

  // Tính toán thống kê (Logic này thường Backend làm, nhưng Frontend làm cũng được nếu data ít)
  getStats: async (slug: string): Promise<ReviewStats> => {
    const reviews = MOCK_REVIEWS; // Thực tế sẽ filter theo slug
    const totalCount = reviews.length;

    if (totalCount === 0) {
      return { average: 0, totalCount: 0, distribution: [] };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = parseFloat((sum / totalCount).toFixed(1));

    // Tính phân bổ sao (5 sao bao nhiêu cái, 4 sao bao nhiêu...)
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      return {
        star,
        count,
        percent: (count / totalCount) * 100,
      };
    });

    return { average, totalCount, distribution };
  },
};
