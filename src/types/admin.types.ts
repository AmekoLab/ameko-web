import { ShopStatus } from "./shop.types";

export interface ShopRequest {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  status: ShopStatus;
  createdAt: string;
  citizenId: string;
  bankName: string;
  bankAccountNumber: string;
  logoUrl?: string;
}

// --- Admin User Management ---
export interface AdminUserItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  gender: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  image: string | null;
  emailConfirmed: boolean;
  status: number;
  roleName: string;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUserPagination {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// --- Create User (Admin) ---
export interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number; // 0 = Customer, 1 = Shop, 2 = Admin
  status: number; // 0 = Active, 1 = Banned
  gender: number; // 0 = Male, 1 = Female, 2 = Other
  dateOfBirth: string; // yyyy-MM-dd
  phoneNumber: string;
}

export interface CreateUserResponse {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  status: number;
  gender: number;
  dateOfBirth: string;
  phoneNumber: string;
}

// --- Update User (Admin) ---
export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  status: number;
  role: number;
  gender: number;
  dateOfBirth: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
}

export interface UpdateUserResponse {
  firstName: string;
  lastName: string;
  email: string;
  status: number;
  role: number;
  gender: number;
  dateOfBirth: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
}
export interface TopShopItem {
  shopId: string;
  shopName: string;
  orderCount: number;
}

export interface TopShopsResponse {
  fromUtc: string;
  toUtc: string;
  items: TopShopItem[];
}

// --- Admin Dashboard Overview ---
export interface AdminDashboardOverview {
  fromUtc: string;
  toUtc: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  grossMerchandiseValue: number;
  netRevenue: number;
  platformRevenue: number;
  shopRevenue: number;
  activeBuyers: number;
  activeShops: number;
  newUsers: number;
  orderCompletionRate: number;
}

// --- Payment Health ---
export interface PaymentMethodMetric {
  method: number;
  total: number;
  successful: number;
  failed: number;
}

export interface PaymentTypeMetric {
  type: number;
  total: number;
  amount: number;
}

export interface PaymentHealthData {
  fromUtc: string;
  toUtc: string;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  successfulPaymentVolume: number;
  paymentSuccessRate: number;
  methodMetrics: PaymentMethodMetric[];
  typeMetrics: PaymentTypeMetric[];
}

// --- Risk Overview ---
export interface RiskOverviewData {
  fromUtc: string;
  toUtc: string;
  totalOrders: number;
  totalIssues: number;
  openIssues: number;
  cancelRequests: number;
  refundRequests: number;
  disputeRequests: number;
  cancelledOrders: number;
  refundedOrders: number;
  cancelRate: number;
  refundRate: number;
  issueRate: number;
}
