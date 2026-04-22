export enum ShopStatus {
  PendingApproval = 0, // Chờ duyệt
  Active = 1, // Đang hoạt động
  Inactive = 2, // Tạm ngưng
  Rejected = 3, // Bị từ chối
  Banned = 4, // Bị khóa
}

export interface RegisterShopFormValues {
  shopName: string;
  citizenId: string; // CCCD
  bankName: string;
  bio?: string;
  address: string;
  phoneNumber: string;
  taxCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  contactEmail: string;
  bannerImage: FileList;
  logoImage: FileList;
}

export interface ShopResponse {
  id: string;
  shopName: string;
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  address: string;
  phoneNumber: string;
  contactEmail: string;
  citizenId: string;
  taxCode: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  rating: number;
  totalSales: number;
  totalRevenue: number;
  userId: string;
  adminNote: string | null;
  status: ShopStatus;
  isActive: boolean;
  createdAt: string;
}

// Public shop profile (from GET /shops/{id}) — lighter than ShopResponse
export interface ShopPublicProfile {
  id: string;
  shopName: string;
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  totalSales: number;
  createdAt: string;
  userId: string;
  followersCount: number;
  followingCount: number;
}

export interface ApproveShopPayload {
  shopId: string;
  status: ShopStatus;
  adminNote: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  totalCount: number;
}

export interface AdminShopListResponse {
  items: ShopResponse[];
  pagination: PaginationParams;
}

export interface UpdateShopFormValues {
  shopName: string;
  bankName: string;
  bio?: string;
  address: string;
  phoneNumber: string;
  bankAccountNumber: string;
  bankAccountName: string;
  contactEmail: string;
  bannerImage?: FileList;
  logoImage?: FileList;
}

export type ShopState = ShopResponse;

// ─── Public Shop Listing (GET /shops) ─────────────────────
export interface ShopItem {
  id: string;
  shopName: string;
  userId: string;
  bio: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rating: number;
  totalSales: number;
  createdAt: string;
  isActive: boolean;
  followersCount: number;
  followingCount: number;
}

export interface ShopListPagination {
  page: number;
  size: number;
  totalCount: number;
}

export interface ShopListResponse {
  success: boolean;
  message: string;
  data: {
    items: ShopItem[];
    pagination: ShopListPagination;
  };
  errors: unknown | null;
}

export interface ShopListParams {
  searchTerm?: string;
  page?: number;
  size?: number;
}

export interface ShopSearchResult {
  id: string;
  shopName: string;
  bio: string;
  logoUrl: string | null;
  rating: number;
  followersCount: number;
}
