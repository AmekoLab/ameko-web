"use client";

import { useEffect, useState } from "react";
import { notificationService, NotificationDto } from "@/src/services/notification.service";
import { toast } from "react-toastify";
import { Loader2, X, ExternalLink } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notificationId: number | null;
}

export default function AdminNotificationDetailModal({ isOpen, onClose, notificationId }: Props) {
  const [notification, setNotification] = useState<NotificationDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && notificationId !== null) {
      fetchDetail();
    } else {
      setNotification(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, notificationId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getAdminNotificationById(notificationId!);
      if (res.success && res.data) {
        setNotification(res.data);
      } else {
        toast.error(res.message || "Không thể tải chi tiết thông báo");
        onClose();
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải chi tiết");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-neutral-800">Chi tiết thông báo</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : notification ? (
            <div className="space-y-4">
              {/* ID & Status */}
              <div>
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">ID / Trạng thái</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">#{notification.id}</span>
                  {notification.isRead ? (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Đã đọc</span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Chưa đọc</span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Tiêu đề</label>
                <div className="text-sm font-medium text-neutral-800 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                  {notification.title}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Nội dung</label>
                <div className="text-sm text-neutral-700 bg-neutral-50 p-2.5 rounded border border-neutral-100 whitespace-pre-wrap min-h-[60px]">
                  {notification.message || <span className="text-neutral-400 italic">Không có nội dung</span>}
                </div>
              </div>

              {/* Type & Created */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Loại</label>
                  <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">{notification.type}</span>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Ngày tạo</label>
                  <div className="text-xs text-neutral-700">
                    {new Date(notification.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>

              {/* Actor */}
              <div>
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Nguồn gửi</label>
                <div className="text-xs text-neutral-700">
                  {notification.actorId ? (
                    <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{notification.actorId}</span>
                  ) : (
                    <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-medium">System</span>
                  )}
                </div>
              </div>

              {/* Reference */}
              {(notification.referenceId || notification.referenceType) && (
                <div className="grid grid-cols-2 gap-4">
                  {notification.referenceType && (
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Ref Type</label>
                      <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">{notification.referenceType}</span>
                    </div>
                  )}
                  {notification.referenceId && (
                    <div>
                      <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Ref ID</label>
                      <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">{notification.referenceId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Redirect URL */}
              {notification.redirectUrl && (
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Đường dẫn điều hướng</label>
                  <div className="flex items-center gap-2 bg-blue-50 p-2.5 rounded border border-blue-100">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-mono text-blue-700 break-all">{notification.redirectUrl}</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
