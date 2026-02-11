export interface SocialLink {
  platform: "facebook" | "instagram" | "shopee" | "website" | "discord";
  url: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  joinDate: string;
  role: "Member" | "Pro Builder" | "Verified Shop" | "Admin";
  reputation: number; // Điểm uy tín (0-5)
  followers: number;
  following: number;
  skills: string[]; // VD: "Lube Switch", "Mill-max", "Repair"
  socials: SocialLink[];
  isMe?: boolean; // Cờ đánh dấu đây là profile của người đang đăng nhập
}

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  status: "In Stock" | "Group Buy" | "Sold Out";
}

export interface Review {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  rating: number; // 1 - 5
  date: string;
  content: string;
  images?: string[]; // Ảnh feedback từ khách
  productName: string; // Khách đã review cho món nào
  reply?: string; // Shop trả lời (nếu có)
}

export interface ReviewStats {
  average: number;
  total: number;
  breakdown: { [key: number]: number }; // VD: { 5: 80, 4: 10, 3: 5... }
}
