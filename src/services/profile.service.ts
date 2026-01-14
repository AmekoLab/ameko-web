import { UserProfile, Product, ReviewStats, Review } from "@/src/types/profile";

export const ProfileService = {
  /**
   * Lấy thông tin chi tiết Profile theo username
   */
  getProfile: async (username: string): Promise<UserProfile | null> => {
    // TODO: [API] GET /api/users/{username}
    // const res = await fetch(`${API_URL}/users/${username}`);

    await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay

    // Mock Data
    return {
      id: "u1",
      username: username,
      displayName: "Tín Dev Keycaps",
      avatar:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg",
      coverImage:
        "https://res.cloudinary.com/doezwafgz/image/upload/v1765551038/CHERRY-XTRFY_-MX-101_frontpage-1_hwu37j.jpg",
      bio: "Chuyên Build phím cơ custom, nhận lube switch, rã hàn, mod stab tại Hà Nội. Đại lý chính hãng AMEKO.",
      location: "Hà Nội, Việt Nam",
      joinDate: "October 2023",
      role: "Verified Shop",
      reputation: 4.9,
      followers: 1250,
      following: 45,
      skills: ["Lubing", "Soldering", "Modding", "Assembly"],
      socials: [
        { platform: "facebook", url: "#" },
        { platform: "shopee", url: "#" },
        { platform: "website", url: "#" },
      ],
      isMe: false, // TODO: [AUTH] So sánh id của profile với id user đang login
    };
  },

  /**
   * Lấy danh sách sản phẩm của Shop
   */
  getShopProducts: async (userId: string): Promise<Product[]> => {
    // TODO: [API] GET /api/users/{userId}/products

    await new Promise((resolve) => setTimeout(resolve, 600));
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      name:
        i % 2 === 0
          ? "GMK Red Samurai Base Kit"
          : "Gateron Oil King Switch (Pack 10)",
      price: i % 2 === 0 ? "3.200.000₫" : "150.000₫",
      image:
        i % 2 === 0
          ? "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/456_qcrwfk.png"
          : "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/produc1_jc0ojq.png",
      category: i % 2 === 0 ? "Keycap" : "Switch",
      status: i === 0 ? "Group Buy" : "In Stock",
    }));
  },

  getReviewStats: async (userId: string): Promise<ReviewStats> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      average: 4.8,
      total: 125,
      breakdown: { 5: 100, 4: 15, 3: 5, 2: 3, 1: 2 },
    };
  },

  /**
   * Lấy danh sách review
   */
  getReviews: async (userId: string): Promise<Review[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      author: {
        name: `Customer ${i + 1}`,
        avatar:
          "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg",
      },
      rating: i === 1 ? 4 : 5,
      date: "2 days ago",
      content:
        i % 2 === 0
          ? "Shop gói hàng siêu kỹ, switch lube đều tay, gõ mượt hơn hẳn stock. Sẽ ủng hộ dài dài! 🔥"
          : "Hàng ngon trong tầm giá, giao hàng hơi lâu chút xíu nhưng shop support nhiệt tình.",
      productName:
        i % 2 === 0
          ? "Gateron Oil King (Lube + Film)"
          : "GMK Red Samurai Keycap",
      images:
        i === 0
          ? [
              "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/456_qcrwfk.png",
            ]
          : [],
      reply: i === 0 ? "Cảm ơn bạn đã ủng hộ shop ạ! <3" : undefined,
    }));
  },
};
