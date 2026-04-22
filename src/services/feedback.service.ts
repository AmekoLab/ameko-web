import api from "@/src/utils/api";
import { FeedbackEligibilityResponse } from "@/src/types/feedback.types";

export const feedbackService = {
  checkEligibility: async (
    orderId: string,
  ): Promise<FeedbackEligibilityResponse> => {
    const res = await api.get(`/orders/${orderId}/feedback-eligibility`);
    return res as any;
  },

  createShopFeedback: async (orderId: string, formData: FormData) => {
    const res = await api.post(`/orders/${orderId}/feedbacks`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res as any;
  },

  getMyFeedback: async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}/my-feedback`);
    return res as any; 
  },

  updateFeedback: async (feedbackId: string, formData: FormData) => {
    const res = await api.put(`/feedbacks/${feedbackId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res as any; 
  },

  getShopFeedbacks: async (
    shopId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
  ) => {
    const res = await api.get(`/shops/${shopId}/feedbacks`, {
      params: { pageNumber, pageSize },
    });
    return res as any; 
  },

  getMyShopManagementFeedbacks: async (
    pageNumber: number = 1,
    pageSize: number = 10,
  ) => {
    const res = await api.get(`/feedbacks/my-shop`, {
      params: { pageNumber, pageSize },
    });
    return res as any;
  },

  getProductFeedbackEligibility: async (productId: string) => {
    const res = await api.get(`/assembled-products/${productId}/feedback-eligibility`);
    return res as any;
  },

  createItemFeedback: async (orderItemId: string, formData: FormData) => {
    // Đã thêm dấu / ở đầu
    const res = await api.post(`/order-items/${orderItemId}/assembled-feedbacks`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res as any;
  },

  getMyItemFeedback: async (orderItemId: string) => {
    const res = await api.get(`/order-items/${orderItemId}/my-assembled-feedback`);
    return res as any;
  },

  getAssembledProductFeedbacks: async (
    productId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
  ) => {
    const res = await api.get(`/assembled-products/${productId}/feedbacks`, {
      params: { pageNumber, pageSize },
    });
    return res as any;
  },

  getMyShopAssembledFeedbacks: async (
    pageNumber: number = 1,
    pageSize: number = 10,
  ) => {
    const res = await api.get(`/assembled-feedbacks/my-shop`, {
      params: { pageNumber, pageSize },
    });
    return res as any;
  },

  replyToFeedback: async (feedbackId: string, reply: string) => {
    const res = await api.put(`/feedbacks/${feedbackId}/reply`, {
      reply,
    });
    return res as any;
  },

  replyToAssembledFeedback: async (feedbackId: string, reply: string) => {
    const res = await api.put(`/assembled-feedbacks/${feedbackId}/reply`, {
      reply,
    });
    return res as any;
  },

  updateAssembledFeedback: async (feedbackId: string, formData: FormData) => {
    const res = await api.put(`/assembled-feedbacks/${feedbackId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res as any;
  },
};