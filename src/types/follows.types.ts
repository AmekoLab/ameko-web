export interface BaseApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
}

export interface ToggleFollowRequest {
  followedId: string;
}

export interface CheckFollowStatusRequest {
  targetUserId: string;
}

export interface CheckFollowStatusResponse {
  isFollowing: boolean;
}

export interface FollowerUser {
  id: string;
  fullName: string;
  avatarUrl: string;
}

export interface FollowsState {
  isFollowing: boolean;
  isLoading: boolean;
  error: string | null;
  followersCount: number;
}
