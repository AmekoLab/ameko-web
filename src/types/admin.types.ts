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
