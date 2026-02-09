import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  AdminUserListResponse,
  CreateUserPayload,
  CreateUserResponse,
  UpdateUserPayload,
  UpdateUserResponse,
} from "@/src/types/admin.types";

export const userManagementService = {
  getUserList: async (currentPage = 1, pageSize = 10) => {
    return api.get<any, ApiResponse<AdminUserListResponse>>(
      `/Users?currentPage=${currentPage}&pageSize=${pageSize}`,
    );
  },

  createUser: async (payload: CreateUserPayload) => {
    return api.post<any, ApiResponse<CreateUserResponse>>(
      `/Users/admin/create-user`,
      payload,
    );
  },

  updateUser: async (userId: string, payload: UpdateUserPayload) => {
    return api.put<any, ApiResponse<UpdateUserResponse>>(
      `/Users/admin/update-user/${userId}`,
      payload,
    );
  },
};
