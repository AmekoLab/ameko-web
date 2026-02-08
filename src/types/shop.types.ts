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
