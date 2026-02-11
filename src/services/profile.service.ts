import { UserProfile, Product, ReviewStats, Review } from "@/src/types/profile";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api/v1";

export const ProfileService = {
  /**
   * Lấy thông tin chi tiết Profile theo username (shop ID)
   * Calls GET /api/v1/shops/{id}
   */
  getProfile: async (username: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_URL}/shops/${username}`, {
        next: { revalidate: 60 },
      });

      if (!res.ok) return null;

      const json = await res.json();
      if (!json.success || !json.data) return null;

      const shop = json.data;

      return {
        id: shop.id,
        username: shop.shopName?.toLowerCase().replace(/\s+/g, "-") || shop.id,
        displayName: shop.shopName,
        avatar: shop.logoUrl || "",
        coverImage: shop.bannerUrl || "",
        bio: shop.bio || "",
        location: "", // Not available from API yet
        joinDate: shop.createdAt
          ? new Date(shop.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "",
        role: "Verified Shop",
        reputation: shop.rating ?? 0,
        followers: 0, // TODO: [API] Follow API not ready
        following: 0, // TODO: [API] Follow API not ready
        skills: [], // TODO: [API] Not available from API yet
        socials: [], // TODO: [API] Not available from API yet
        isMe: false, // TODO: [AUTH] Compare with current user
      };
    } catch (error) {
      console.error("Failed to fetch shop profile:", error);
      return null;
    }
  },

  /**
   * Lấy danh sách sản phẩm của Shop
   * Calls GET /api/v1/AssembledProduct/shop/{shopId}
   */
  getShopProducts: async (shopId: string): Promise<Product[]> => {
    try {
      const res = await fetch(
        `${API_URL}/AssembledProduct/shop/${shopId}?CurrentPage=1&PageSize=50`,
      );

      if (!res.ok) return [];

      const json = await res.json();
      if (!json.success || !json.data) return [];

      // API returns flat array: data: [...]
      const items = Array.isArray(json.data)
        ? json.data
        : json.data.items || [];

      return items.map((item: any, i: number) => ({
        id: item.id || i,
        name: item.name || "Untitled Product",
        price: item.price
          ? `${item.price.toLocaleString("vi-VN")}₫`
          : "Contact",
        image: item.image1 || item.image2 || item.image3 || "",
        category: item.layout || "Keyboard",
        status:
          item.quantity != null && item.quantity > 0 ? "In Stock" : "Sold Out",
      }));
    } catch (error) {
      console.error("Failed to fetch shop products:", error);
      return [];
    }
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
