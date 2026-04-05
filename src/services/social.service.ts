import api from "@/src/utils/api";
import { ApiResponse } from "@/src/types/auth.types";
import {
  CreatePostPayload,
  UpdatePostPayload,
  DeletePostData,
  FeedResponseData,
  Post,
  PostReaction,
  PostReactionType,
  ReactToPostData,
  SocialComment,
  CommentsResponseData,
  AddCommentPayload,
  UpdateCommentPayload,
} from "@/src/types/social.types";

export const socialService = {
  getFeed: async (
    pageSize: number = 20,
    cursor?: string | null,
  ): Promise<ApiResponse<FeedResponseData>> => {
    try {
      const params: { pageSize: number; cursor?: string } = { pageSize };

      if (cursor) {
        params.cursor = cursor;
      }

      return await api.get("/SocialCommerce/posts/feed", { params });
    } catch (error) {
      console.error("Failed to fetch social feed:", error);
      throw error;
    }
  },

  getUserPosts: async (
    userId: string,
    pageSize: number = 10,
    cursor?: string | null,
  ): Promise<ApiResponse<FeedResponseData>> => {
    try {
      const params: { pageSize: number; cursor?: string } = { pageSize };

      if (cursor) {
        params.cursor = cursor;
      }

      return await api.get(`/SocialCommerce/users/${userId}/posts`, { params });
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
      throw error;
    }
  },

  createPost: async (
    payload: CreatePostPayload,
  ): Promise<ApiResponse<Post>> => {
    try {
      return await api.post("/SocialCommerce/posts", payload);
    } catch (error) {
      console.error("Failed to create social post:", error);
      throw error;
    }
  },

  updatePost: async (
    postId: number,
    payload: UpdatePostPayload,
  ): Promise<ApiResponse<Post>> => {
    try {
      return await api.put(`/SocialCommerce/posts/${postId}`, payload);
    } catch (error) {
      console.error("Failed to update social post:", error);
      throw error;
    }
  },

  deletePost: async (postId: number): Promise<ApiResponse<DeletePostData>> => {
    try {
      return await api.delete(`/SocialCommerce/posts/${postId}`);
    } catch (error) {
      console.error("Failed to delete social post:", error);
      throw error;
    }
  },

  reactToPost: async (
    postId: number,
    type: PostReactionType,
  ): Promise<ApiResponse<ReactToPostData>> => {
    try {
      return await api.post(`/SocialCommerce/posts/${postId}/react`, { type });
    } catch (error) {
      console.error("Failed to react to post:", error);
      throw error;
    }
  },

  deletePostReaction: async (
    postId: number,
  ): Promise<ApiResponse<ReactToPostData>> => {
    try {
      return await api.delete(`/SocialCommerce/posts/${postId}/reactions`);
    } catch (error) {
      console.error("Failed to delete post reaction:", error);
      throw error;
    }
  },

  getPostReactions: async (
    postId: number,
  ): Promise<ApiResponse<PostReaction[]>> => {
    try {
      return await api.get(`/SocialCommerce/posts/${postId}/reactions`);
    } catch (error) {
      console.error("Failed to fetch post reactions:", error);
      throw error;
    }
  },

  getComments: async (
    postId: number,
    pageSize: number = 5,
    cursor?: string | null,
  ): Promise<ApiResponse<CommentsResponseData>> => {
    try {
      const params: { pageSize: number; cursor?: string } = { pageSize };

      if (cursor) {
        params.cursor = cursor;
      }

      return await api.get(`/SocialCommerce/posts/${postId}/comments`, {
        params,
      });
    } catch (error) {
      console.error("Failed to fetch post comments:", error);
      throw error;
    }
  },

  addComment: async (
    postId: number,
    payload: AddCommentPayload,
  ): Promise<ApiResponse<SocialComment>> => {
    try {
      return await api.post(
        `/SocialCommerce/posts/${postId}/comments`,
        payload,
      );
    } catch (error) {
      console.error("Failed to add post comment:", error);
      throw error;
    }
  },

  updateComment: async (
    commentId: number,
    payload: UpdateCommentPayload,
  ): Promise<ApiResponse<SocialComment>> => {
    try {
      return await api.put(
        `/SocialCommerce/comments/${commentId}`,
        payload,
      );
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw error;
    }
  },

  deleteComment: async (
    commentId: number,
  ): Promise<ApiResponse<null>> => {
    try {
      return await api.delete(`/SocialCommerce/comments/${commentId}/soft-delete`);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  },

  hardDeleteComment: async (
    commentId: number,
  ): Promise<ApiResponse<null>> => {
    try {
      return await api.delete(`/SocialCommerce/comments/${commentId}`);
    } catch (error) {
      console.error("Failed to permanently delete comment:", error);
      throw error;
    }
  },
};

