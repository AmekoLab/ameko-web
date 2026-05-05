import api from "@/src/utils/api";

export interface NotificationDto {
  id: number;
  title: string;
  message: string | null;
  actorId: string | null; // null means system notification
  type: "System" | "OrderCreated" | "OrderStatusUpdated" | "Comment" | "Reaction" | "PostCreated" | "Warranty" | "Product" | "Refund";
  referenceId: string | null;
  referenceType: "Order" | "Post" | "Chat" | null;
  redirectUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCursorResponse {
  items: NotificationDto[];
  nextCursor: string | null;
}

export interface GetUserNotificationsParams {
  pageSize?: number;
  cursor?: string;
  type?: string;
  referenceType?: string;
}

export interface AdminCreateNotificationPayload {
  userId: string;
  title: string;
  message?: string;
  redirectUrl?: string;
}

export interface AdminBroadcastPayload {
  title: string;
  message?: string;
  redirectUrl?: string;
}

export const notificationService = {
  getUserNotifications: async (params?: GetUserNotificationsParams) => {
    return api.get<unknown, { success: boolean; data: NotificationCursorResponse }>("/notifications", { params });
  },
  getUnreadCount: async (): Promise<{ success: boolean; data?: { unreadCount: number }; message?: string }> => {
    return api.get("/notifications/unread-count");
  },
  markAsRead: async (id: number): Promise<{ success: boolean; message?: string }> => {
    return api.post(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<{ success: boolean; message?: string }> => {
    return api.post("/notifications/read-all");
  },

  // Admin: Send to specific user
  createAdminNotification: async (payload: AdminCreateNotificationPayload): Promise<{ success: boolean; data?: NotificationDto; message?: string }> => {
    return api.post("/notifications/admin", payload);
  },

  // Admin: Broadcast to ALL users
  broadcastNotification: async (payload: AdminBroadcastPayload): Promise<{ success: boolean; message?: string }> => {
    return api.post("/notifications/admin/broadcast", payload);
  },

  // Admin: Fetch paginated notification logs
  getAdminNotifications: async (pageNumber: number, pageSize: number) => {
    return api.get<unknown, { success: boolean; data: { items: NotificationDto[]; totalCount: number } }>("/notifications/admin", {
      params: { pageNumber, pageSize },
    });
  },

  // Admin: Get specific notification details
  getAdminNotificationById: async (id: number): Promise<{ success: boolean; data?: NotificationDto; message?: string }> => {
    return api.get(`/notifications/admin/${id}`);
  },

  // Admin: Update a notification
  updateAdminNotification: async (id: number, payload: { title: string; message?: string }): Promise<{ success: boolean; message?: string }> => {
    return api.put(`/notifications/admin/${id}`, payload);
  },

  // Admin: Delete a notification
  deleteAdminNotification: async (id: number): Promise<{ success: boolean; message?: string }> => {
    return api.delete(`/notifications/admin/${id}`);
  },
};
