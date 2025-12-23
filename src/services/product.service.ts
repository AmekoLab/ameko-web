import { Product } from "@/src/types/product";

const MOCK_DB: Product[] = [
  {
    id: "p_zoom75",
    slug: "zoom75-ee-wireless",
    name: "Zoom75 EE Wireless Kit",
    basePrice: 189.0,
    originalPrice: 210.0,
    rating: 4.9,
    reviewsCount: 125,
    status: "IN_STOCK",
    shortDesc: "The best 75% keyboard kit in the game...",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/produc1_jc0ojq.png",
    ],
    specs: {
      layout: "75% (82 Keys)",
      mounting: "Gasket Mount",
      pcb: "1.2mm Flex-cut, Hotswap",
      connection: "Tri-mode (BT/2.4G/Wired)",
      battery: "2250mAh x 2",
    },
    options: [
      {
        id: "color",
        name: "Colorway",
        type: "color",
        values: [
          { id: "milk-tea", name: "Milk Tea", value: "#eddecc" },
          { id: "obsidian", name: "Obsidian Black", value: "#1a1a1a" },
          { id: "wild-green", name: "Wild Green", value: "#4a5d23" },
        ],
      },
      {
        id: "plate",
        name: "Plate Material",
        type: "button",
        values: [
          { id: "pc", name: "PC Plate", value: "pc", priceModifier: 0 },
          { id: "fr4", name: "FR4 Plate", value: "fr4", priceModifier: 0 },
          {
            id: "brass",
            name: "Brass Plate",
            value: "brass",
            priceModifier: 15,
          },
        ],
      },
    ],
    boughtTogether: [
      {
        id: "sw_oil_king",
        name: "Gateron Oil King Linear Switch (Pack 90)",
        price: 65.0,
        image:
          "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
      },
      {
        id: "kc_red_samurai",
        name: "GMK Red Samurai Keycap Set",
        price: 110.0,
        image:
          "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
      },
    ],
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zDRo8MCDPpI",
      description: "Sound test with FR4 Plate...",
    },
  },

  {
    id: "p_qk75",
    slug: "qk75-wireless",
    name: "QwertyKeys QK75N Wireless",
    basePrice: 215.0,
    rating: 4.8,
    reviewsCount: 89,
    status: "IN_STOCK",
    shortDesc: "Budget king 75% keyboard.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    specs: {
      layout: "75%",
      mounting: "Gasket",
      pcb: "Hotswap",
      connection: "Tri-mode",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zDRo8MCDPpI",
      description: "Sound test with FR4 Plate...",
    },
    options: [],
    boughtTogether: [],
  },

  {
    id: "p_monsgeek_m1",
    slug: "monsgeek-m1",
    name: "MonsGeek M1 Aluminum Kit",
    basePrice: 99.0,
    rating: 4.7,
    reviewsCount: 230,
    status: "IN_STOCK",
    shortDesc: "Best value aluminum keyboard.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/produc1_jc0ojq.png",
    ],
    specs: {
      layout: "75%",
      mounting: "Gasket",
      pcb: "Hotswap",
      connection: "Wired",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zDRo8MCDPpI",
      description: "Sound test with FR4 Plate...",
    },
    options: [],
    boughtTogether: [],
  },
];

export const ProductService = {
  // 1. API lấy chi tiết (Nhẹ, chỉ lấy info chính)
  getBySlug: async (slug: string): Promise<Product | null> => {
    // Giả lập delay mạng
    const product = MOCK_DB.find((p) => p.slug === slug);
    return product || null;
  },

  // 2. API lấy sản phẩm liên quan (Riêng biệt)
  getRelated: async (slug: string): Promise<Product[]> => {
    // Trong thực tế: Gọi thuật toán gợi ý sản phẩm
    // Ở đây mình mock: Lấy tất cả sản phẩm TRỪ sản phẩm hiện tại
    const related = MOCK_DB.filter((p) => p.slug !== slug).slice(0, 4);
    return related;
  },
};
