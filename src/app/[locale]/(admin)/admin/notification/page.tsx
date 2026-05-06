"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationService, NotificationDto } from "@/src/services/notification.service";
import { toast } from "react-toastify";
import { Loader2, Megaphone, Trash2, Edit, Bell, AlertTriangle, X, Send, FileText, Link2, MessageSquare, Eye } from "lucide-react";
import AdminNotificationDetailModal from "@/src/components/Admin/AdminNotificationDetailModal";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

// ─── Relative time helper ───
function timeAgo(dateStr: string, t: any): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t("timeJustNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("timeMinutesAgo", { minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("timeHoursAgo", { hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("timeDaysAgo", { days });
  const months = Math.floor(days / 30);
  return t("timeMonthsAgo", { months });
}

// ─── TYPE BADGE ───
function renderTypeBadge(type: string) {
  const base = "px-1.5 py-0.5 rounded-sm text-[10px] font-medium border whitespace-nowrap";
  switch (type) {
    case "System":
      return <span className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>System</span>;
    case "OrderCreated":
    case "OrderStatusUpdated":
      return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>{type}</span>;
    case "Warranty":
      return <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>Warranty</span>;
    case "Product":
      return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Product</span>;
    default:
      return <span className={`${base} bg-neutral-50 text-neutral-600 border-neutral-200`}>{type}</span>;
  }
}

export default function AdminNotificationPage() {
  const t = useTranslations("AdminNotificationPage");

  // ─── Table State ───
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // ─── Broadcast Modal ───
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [bcTitle, setBcTitle] = useState("");
  const [bcMessage, setBcMessage] = useState("");
  const [bcRedirectUrl, setBcRedirectUrl] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // ─── Edit Modal ───
  const [editingNoti, setEditingNoti] = useState<NotificationDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // ─── Delete Confirm ───
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Detail Modal ───
  const [viewNotyId, setViewNotyId] = useState<number | null>(null);

  // ─── Fetch ───
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAdminNotifications(currentPage, PAGE_SIZE);
      if (res.success && res.data) {
        setNotifications(res.data.items);
        setTotalCount(res.data.totalCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ─── BROADCAST ───
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim()) {
      toast.error(t("toastRequireTitle"));
      return;
    }
    setIsBroadcasting(true);
    try {
      const res = await notificationService.broadcastNotification({
        title: bcTitle.trim(),
        message: bcMessage.trim() || undefined,
        redirectUrl: bcRedirectUrl.trim() || undefined,
      });
      if (res.success) {
        toast.success(t("toastBroadcastSuccess"));
        setShowBroadcast(false);
        setBcTitle("");
        setBcMessage("");
        setBcRedirectUrl("");
        fetchData();
      } else {
        toast.error(res.message || t("toastBroadcastFail"));
      }
    } catch {
      toast.error(t("toastBroadcastError"));
    } finally {
      setIsBroadcasting(false);
    }
  };

  // ─── EDIT ───
  const openEdit = (noti: NotificationDto) => {
    setEditingNoti(noti);
    setEditTitle(noti.title);
    setEditMessage(noti.message || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoti || !editTitle.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await notificationService.updateAdminNotification(editingNoti.id, {
        title: editTitle.trim(),
        message: editMessage.trim() || undefined,
      });
      if (res.success) {
        toast.success(t("toastUpdateSuccess"));
        setEditingNoti(null);
        fetchData();
      } else {
        toast.error(res.message || t("toastUpdateFail"));
      }
    } catch {
      toast.error(t("toastUpdateError"));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ─── DELETE ───
  const handleDelete = async () => {
    if (deletingId === null) return;
    setIsDeleting(true);
    try {
      const res = await notificationService.deleteAdminNotification(deletingId);
      if (res.success) {
        toast.success(t("toastDeleteSuccess"));
        setDeletingId(null);
        // If we deleted the last item on the current page, go back one page
        if (notifications.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchData();
        }
      } else {
        toast.error(res.message || t("toastDeleteFail"));
      }
    } catch {
      toast.error(t("toastDeleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-amazon-text bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-amazon-text leading-tight">{t("title")}</h1>
          <p className="text-[11px] text-amazon-textMuted">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-amazon-textMuted">
            {t("total")} <strong className="text-amazon-text mx-1">{totalCount}</strong> {t("notifications")}
          </span>
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-orange-600 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Megaphone className="w-4 h-4" />
            {t("btnBroadcast")}
          </button>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="bg-white border border-amazon-border shadow-sm rounded-md overflow-hidden flex flex-col">
        {loading && notifications.length === 0 ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-neutral-400">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">{t("noNotifications")}</p>
            <p className="text-[11px] mt-1">{t("noNotificationsDesc")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-amazon-border">
                <tr>
                  <th className="px-3 py-2 text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colId")}</th>
                  <th className="px-3 py-2 text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colTitle")}</th>
                  <th className="px-3 py-2 text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colMessage")}</th>
                  <th className="px-3 py-2 text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colType")}</th>
                  <th className="px-3 py-2 text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colSource")}</th>
                  <th className="px-3 py-2 text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colTime")}</th>
                  <th className="px-3 py-2 text-center text-[11px] font-medium text-amazon-textMuted whitespace-nowrap">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((noti) => (
                  <tr key={noti.id} className="border-b border-amazon-border hover:bg-neutral-50 transition-colors">
                    {/* ID */}
                    <td className="px-3 py-2 text-[11px] text-amazon-textMuted font-mono">
                      #{noti.id}
                    </td>

                    {/* Title */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text">
                      <p className="font-bold truncate max-w-[180px]" title={noti.title}>
                        {noti.title}
                      </p>
                    </td>

                    {/* Message */}
                    <td className="px-3 py-2 text-[11px] text-amazon-textMuted">
                      <p className="truncate max-w-[200px]" title={noti.message || ""}>
                        {noti.message || <span className="italic text-neutral-300">—</span>}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2">{renderTypeBadge(noti.type)}</td>

                    {/* Actor */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text">
                      {noti.actorId ? (
                        <span className="text-blue-600 font-mono text-[10px] truncate max-w-[80px] inline-block" title={noti.actorId}>
                          {t("sourceUser")}
                        </span>
                      ) : (
                        <span className="text-purple-600 font-medium">{t("sourceSystem")}</span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-3 py-2 text-[11px] text-amazon-text whitespace-nowrap">
                      <div>{new Date(noti.createdAt).toLocaleDateString("vi-VN")}</div>
                      <div className="text-[10px] text-amazon-textMuted">{timeAgo(noti.createdAt, t)}</div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewNotyId(noti.id)}
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 transition-colors"
                          title={t("actionView")}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(noti)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition-colors"
                          title={t("actionEdit")}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(noti.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                          title={t("actionDelete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-amazon-border bg-white">
            <p className="text-[10px] text-amazon-textMuted">
              {t("page")} <strong className="font-medium text-amazon-text px-0.5">{currentPage} / {totalPages}</strong> — {totalCount} {t("notifications")}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="bg-white border border-amazon-border text-[11px] font-medium text-amazon-text px-2 py-1 rounded-sm disabled:opacity-50 hover:bg-neutral-50 transition-colors"
              >
                {t("prev")}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-sm border transition-colors ${
                      page === currentPage
                        ? "bg-amazon-btnPrimary text-amazon-text border-amazon-btnPrimary"
                        : "bg-white text-amazon-text border-amazon-border hover:bg-neutral-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="bg-white border border-amazon-border text-[11px] font-medium text-amazon-text px-2 py-1 rounded-sm disabled:opacity-50 hover:bg-neutral-50 transition-colors"
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          BROADCAST MODAL
      ═══════════════════════════════════════════════════ */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-orange-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-600" />
                <h2 className="text-sm font-bold text-neutral-800">{t("modalBroadcastTitle")}</h2>
              </div>
              <button onClick={() => setShowBroadcast(false)} className="text-neutral-500 hover:text-neutral-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="p-5 flex flex-col gap-4">
              {/* Warning */}
              {/* <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <b>{t("modalWarning")}</b> {t.rich("modalWarningDesc", { notRealtime: (chunks) => <b key="notRealtime">{chunks}</b> })}
                </p>
              </div> */}

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    {t("labelTitle")} <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-medium ${bcTitle.length > 200 ? "text-red-500" : "text-neutral-400"}`}>
                    {bcTitle.length}/200
                  </span>
                </div>
                <input
                  type="text"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value.slice(0, 200))}
                  placeholder={t("placeholderTitle")}
                  className={inputClass}
                  maxLength={200}
                  disabled={isBroadcasting}
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                    {t("labelMessage")} <span className="text-[10px] font-normal text-neutral-400">{t("optional")}</span>
                  </label>
                  <span className={`text-[10px] font-medium ${bcMessage.length > 1000 ? "text-red-500" : "text-neutral-400"}`}>
                    {bcMessage.length}/1000
                  </span>
                </div>
                <textarea
                  value={bcMessage}
                  onChange={(e) => setBcMessage(e.target.value.slice(0, 1000))}
                  placeholder={t("placeholderMessage")}
                  rows={3}
                  maxLength={1000}
                  className={`${inputClass} resize-none`}
                  disabled={isBroadcasting}
                />
              </div>

              {/* Redirect URL */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-neutral-400" />
                  {t("labelRedirectUrl")} <span className="text-[10px] font-normal text-neutral-400">{t("optional")}</span>
                </label>
                <input
                  type="text"
                  value={bcRedirectUrl}
                  onChange={(e) => setBcRedirectUrl(e.target.value)}
                  placeholder={t("placeholderRedirectUrl")}
                  className={`${inputClass} font-mono text-[13px]`}
                  disabled={isBroadcasting}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowBroadcast(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  disabled={isBroadcasting}
                >
                  {t("btnCancel")}
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting || !bcTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {isBroadcasting ? t("btnSending") : t("btnSend")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          EDIT MODAL
      ═══════════════════════════════════════════════════ */}
      {editingNoti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-neutral-800">{t("modalEditTitle", { id: editingNoti.id })}</h2>
              </div>
              <button onClick={() => setEditingNoti(null)} className="text-neutral-500 hover:text-neutral-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  {t("labelTitle")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value.slice(0, 200))}
                  className={inputClass}
                  maxLength={200}
                  disabled={isSavingEdit}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">{t("labelMessage")}</label>
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value.slice(0, 1000))}
                  rows={3}
                  maxLength={1000}
                  className={`${inputClass} resize-none`}
                  disabled={isSavingEdit}
                />
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setEditingNoti(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  disabled={isSavingEdit}
                >
                  {t("btnCancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                  {isSavingEdit ? t("btnSaving") : t("btnSave")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          DELETE CONFIRMATION
      ═══════════════════════════════════════════════════ */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">{t("modalDeleteConfirm")}</h3>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                {t.rich("modalDeleteDesc", { 
                  id: deletingId, 
                  targetId: (chunks) => <strong key="id">{chunks}</strong> 
                })}
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-70"
                >
                  {t("btnCancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("actionDelete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          DETAIL MODAL
      ═══════════════════════════════════════════════════ */}
      <AdminNotificationDetailModal
        isOpen={viewNotyId !== null}
        notificationId={viewNotyId}
        onClose={() => setViewNotyId(null)}
      />
    </div>
  );
}
