import api from "@/src/utils/api";
import {
  BaseApiResponse,
  ToggleFollowRequest,
  CheckFollowStatusResponse,
} from "@/src/types/follows.types";
import { ApiResponse } from "../types/auth.types";

export interface FollowUserInfo {
  userId: string;
  userName: string;
  fullName: string;
  avatarUrl: string | null;
  isSystemAdmin?: boolean;
}

export const followsApi = {
  // 1. Toggle Follow (Theo dõi / Hủy theo dõi)
  toggleFollow: async (
    payload: ToggleFollowRequest,
  ): Promise<BaseApiResponse<null>> => {
    // Ép kiểu cụ thể thay vì dùng any
    return api.post<ToggleFollowRequest, BaseApiResponse<null>>(
      "/Follows/toggle",
      payload,
    );
  },

  // 2. Lấy danh sách ID những người mình đang theo dõi (Dùng cho Redux Slice)
  getFollowingList: async (): Promise<ApiResponse<FollowUserInfo[]>> => {
    return api.get<any, ApiResponse<FollowUserInfo[]>>("/Follows");
  },

  // 3. Kiểm tra trạng thái follow của mình với một user khác
  checkFollowStatus: async (
    targetUserId: string,
  ): Promise<BaseApiResponse<CheckFollowStatusResponse>> => {
    return api.post<
      { targetUserId: string },
      BaseApiResponse<CheckFollowStatusResponse>
    >("/Follows/check", { targetUserId });
  },

  // 4. Lấy danh sách những người đang theo dõi một USER (Shop) bất kỳ
  // Trả về mảng FollowUserInfo giúp FollowModal.tsx có gợi ý code (Intellisense)
  getShopFollowers: async (
    userId: string,
  ): Promise<ApiResponse<FollowUserInfo[]>> => {
    return api.get<any, ApiResponse<FollowUserInfo[]>>(
      `/Follows/followers/${userId}`,
    );
  },

  // 5. Lấy danh sách những người mà USER (Shop) đó đang theo dõi
  getShopFollowing: async (
    userId: string,
  ): Promise<ApiResponse<FollowUserInfo[]>> => {
    return api.get<any, ApiResponse<FollowUserInfo[]>>(
      `/Follows/following/${userId}`,
    );
  },
};
