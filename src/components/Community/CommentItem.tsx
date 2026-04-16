"use client";
import { FC, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { SocialComment } from "@/src/types/social.types";
import { socialService } from "@/src/services/social.service";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface CommentItemProps {
  comment: SocialComment;
  onCommentUpdated?: (comment: SocialComment) => void;
  onCommentDeleted?: (commentId: number) => void;
}

export const CommentItem: FC<CommentItemProps> = ({ comment, onCommentUpdated, onCommentDeleted }) => {
  const t = useTranslations("CommentItem");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUserStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isOwner = currentUser?.id === comment.userId;
  const isAdmin = currentUser?.role === "Admin";
  const canManage = isOwner || isAdmin;

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await socialService.updateComment(comment.id, { content: editContent });
      if (res.success && res.data) {
        if (onCommentUpdated) onCommentUpdated(res.data);
        setIsEditing(false);
        toast.success(t("successUpdate"));
      }
    } catch {
      toast.error(t("errorUpdate"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      const res = isAdmin
        ? await socialService.hardDeleteComment(comment.id)
        : await socialService.deleteComment(comment.id);
        
      if (res.success) {
        if (onCommentDeleted) onCommentDeleted(comment.id);
        toast.success(res.message || t("successDelete"));
      }
    } catch {
      toast.error(t("errorDelete"));
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-3 last:mb-0 group">
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-neutral-200 mt-1">
          <Image
            src={
              comment.avatarUrl ||
              "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"
            }
            alt={comment.username || t("user")}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="bg-amazon-bgSecondary text-amazon-text rounded-2xl px-3 py-2 relative">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-md font-bold text-amazon-text">
                {comment.username || comment.fullName}
              </span>
            </div>
            
            {isEditing ? (
              <div className="mt-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  className="w-full bg-white border border-amazon-border text-sm text-amazon-text rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-amazon-focus"
                  autoFocus
                />
                <div className="flex items-center gap-2 text-[10px]">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="text-amazon-btnSecondary hover:underline font-bold flex items-center gap-1"
                  >
                    {isUpdating && <Loader2 className="w-3 h-3 animate-spin"/>}
                    {t("save")}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amazon-text leading-snug">
                {comment.content}
              </p>
            )}

            {/* Edit Icon - Shows on hover */}
            {canManage && !isEditing && (
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-white"
                    title={t("editComment")}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="p-1 text-gray-500 hover:text-red-500"
                  title={t("deleteComment")}
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Footer của comment (Like, Reply, Time) */}
          <div className="flex items-center gap-3 px-3 mt-1 text-[10px] font-bold text-gray-500">
            <button className="hover:underline">{t("like")}</button>
            <button className="hover:underline">{t("reply")}</button>
            <div className="flex items-center gap-1 font-normal">
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              {comment.isEdited && (
                <span className="text-amazon-textMuted italic">{t("edited")}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white border border-amazon-border rounded-xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wide text-amazon-text">
                  {t("deleteTitle")}
                </h3>
              </div>
              
              <p className="text-sm text-amazon-textMuted mb-6 leading-relaxed">
                {t("deleteDesc")}
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("deleteBtn")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
