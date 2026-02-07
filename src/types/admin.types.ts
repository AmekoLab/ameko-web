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
