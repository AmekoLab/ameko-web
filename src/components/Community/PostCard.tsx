"use client";

import { FC, MouseEvent, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  X,
  Loader2,
  Edit2,
  Save,
  Trash2,
  Store,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Post, PostReaction, PostReactionType } from "@/src/types/social.types";

const REACTION_EMOJIS: Record<PostReactionType, string> = {
  Like: "👍",
  Love: "❤️",
  Haha: "😂",
  Wow: "😲",
  Sad: "😢",
  Angry: "😡",
};

const REACTION_COLORS: Record<PostReactionType, string> = {
  Like: "text-blue-500",
  Love: "text-red-500",
  Haha: "text-yellow-500",
  Wow: "text-yellow-500",
  Sad: "text-blue-400",
  Angry: "text-orange-600",
};
import { socialService } from "@/src/services/social.service";
import { CommentSection } from "./CommentSection";
import { ImageModal } from "./ImageModal";
import { useTranslations } from "next-intl";
import FollowButton from "./FollowButton";

export const PostCard: FC<{ post: Post }> = ({ post }) => {
  const t = useTranslations("PostCard");
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [userReaction, setUserReaction] = useState<PostReactionType | null>(
    post.currentUserReaction || null,
  );
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
  const [reactionsList, setReactionsList] = useState<PostReaction[]>([]);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ id: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  const isOwner = currentUser?.id === post.userId;
  const isAdmin = currentUser?.role === "Admin";
  const canManage = isOwner || isAdmin;

  const formattedDate = () => {
    try {
      const d = new Date(post.createdAt);
      if (isNaN(d.getTime())) return post.createdAt;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return post.createdAt;
    }
  };

  const handleOpenReactions = async () => {
    setIsReactionsModalOpen(true);
    setIsLoadingReactions(true);
    try {
      const res = await socialService.getPostReactions(post.id);
      if (res.success && res.data) {
        setReactionsList(res.data);
      }
    } catch {
      toast.error(t("errorLoadReactions"));
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const handleReact = async (
    e: MouseEvent<HTMLButtonElement>,
    type: PostReactionType,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const prevReaction = userReaction;
    const prevReactionCount = reactionCount;

    // Toggle handling logic: if the exact same reaction is clicked, remove it.
    const isTogglingOff = prevReaction === type;
    const nextReaction = isTogglingOff ? null : type;

    setUserReaction(nextReaction);

    // Adjust total count
    if (!prevReaction && nextReaction) {
      setReactionCount((prev) => prev + 1);
    } else if (prevReaction && !nextReaction) {
      setReactionCount((prev) => Math.max(0, prev - 1));
    }

    setIsAnimating(true);
    setShowReactionsMenu(false); // Hide the popup

    try {
      if (nextReaction === null) {
        await socialService.deletePostReaction(post.id);
      } else {
        await socialService.reactToPost(post.id, nextReaction);
      }
    } catch {
      // Rollback on fail
      setUserReaction(prevReaction);
      setReactionCount(prevReactionCount);
      toast.error(t("errorReact"));
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleUpdatePost = async () => {
    if (!editTitle.trim()) return;
    setIsUpdating(true);
    try {
      const res = await socialService.updatePost(currentPost.id, {
        title: editTitle,
      });
      if (res.success && res.data) {
        setCurrentPost((prev) => ({ ...prev, title: res.data.title }));
        setIsEditing(false);
        toast.success(t("successUpdate"));
      }
    } catch {
      toast.error(t("errorUpdate"));
    } finally {
      setIsUpdating(false);
    }
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      const res = await socialService.deletePost(currentPost.id);
      if (res.success) {
        setIsDeleted(true);
        toast.success(res.message || t("successDelete"));
      }
    } catch {
      toast.error(t("errorDelete"));
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  const isShop = !!post.shopId || post.role === "Shop";

  const postDisplayName = (() => {
    if (post.role === "Admin") return "Admin";
    if (isShop) {
      return (post as any).shopName || post.username || post.userId;
    }
    return post.fullName || post.username || post.userId;
  })();

  return (
    <>
      {/* 🔥 5. Render Modal Component ở ngoài cùng (sử dụng React Portal gián tiếp nhờ fixed position) */}
      <ImageModal
        imgSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="bg-white border border-amazon-border rounded-md shadow-sm mb-6 overflow-hidden text-amazon-text"
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3">
            {/* Avatar User */}
            {isShop ? (
              <Link
                href={`/profile/shop/${post.shopId}`}
                className="group flex gap-3 cursor-pointer"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200 transition-opacity group-hover:opacity-80">
                  <Image
                    src={
                      post.avatarUrl ||
                      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"
                    }
                    alt={postDisplayName}
                    fill
                  />
                </div>
              <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-amazon-text group-hover:underline">
                      {postDisplayName}
                    </span>
                    <div title="Verified Shop">
                      <Store className="w-4 h-4 text-amazon-btnSecondary" />
                    </div>
                    {post.product?.isAvailable && (
                      <span className="bg-[#ce2a32] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        Available
                      </span>
                    )}
                    {!isOwner && currentUser && (
                      <FollowButton 
                        targetUserId={post.userId}
                        targetUserName={post.username || post.fullName || "User"}
                        targetUserAvatar={post.avatarUrl || "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"}
                      />
                    )}
                  </div>
                  <p className="text-sm text-amazon-textMuted font-medium">
                    {formattedDate()}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex gap-3 cursor-default">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-200">
                  <Image
                    src={
                      post.avatarUrl ||
                      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"
                    }
                    alt={postDisplayName}
                    fill
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-amazon-text">
                      {postDisplayName}
                    </span>
                    {post.product?.isAvailable && (
                      <span className="bg-[#ce2a32] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        Available
                      </span>
                    )}
                    {!isOwner && currentUser && (
                      <FollowButton 
                        targetUserId={post.userId}
                        targetUserName={post.username || post.fullName || "User"}
                        targetUserAvatar={post.avatarUrl || "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"}
                      />
                    )}
                  </div>
                  <p className="text-sm text-amazon-textMuted font-medium">
                    {formattedDate()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Menu Option */}
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-amazon-textMuted hover:text-amazon-text focus:outline-none"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-amazon-border rounded-md shadow-xl z-[99]"
                  >
                    {isOwner && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsEditing(true);
                          setEditTitle(currentPost.title);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-amazon-textMuted hover:text-amazon-text hover:bg-neutral-50 first:rounded-t-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t("editPost")}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      disabled={isDeleting}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 last:rounded-b-md transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {t("deletePost")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="px-4 pb-3">
          {isEditing ? (
            <div className="flex flex-col gap-2 mt-2">
              <textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white border border-amazon-border rounded-md p-3 text-sm text-amazon-text outline-none focus:border-amazon-focus focus:ring-1 focus:ring-amazon-focus min-h-[100px] resize-y"
                placeholder={t("placeholder")}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 text-xs font-bold uppercase text-amazon-textMuted hover:text-amazon-text transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={isUpdating || !editTitle.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-amazon-btnPrimary text-amazon-text px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider hover:brightness-95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {t("save")}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-md text-amazon-text leading-relaxed whitespace-pre-line">
              {currentPost.title}
            </p>
          )}

          {post.product && (
            <div className="mt-3 bg-amazon-bgSecondary border border-amazon-border p-2 rounded-sm text-md text-amazon-textMuted space-y-1">
              <p>
                <span className="font-bold text-amazon-link">{t("board")}</span>{" "}
                {post.product.name}
              </p>
              
                <p>
                <span className="font-bold text-amazon-link">
                  {t("price")}
                  </span>{" "}
                  <span className="font-bold text-amazon-price">
                  {post.product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                  </span>
                </p>
            
              <p>
                <span className="font-bold text-amazon-link">
                  {t("quantity")}
                </span>{" "}
                {post.product.quantity}
              </p>
                <p>
                <span className="font-bold text-amazon-link">
                  {t("soldQuantity")}
                </span>{" "}
                {post.product.soldQuantity}
              </p>
              <div className="pt-2">
                <Link
                  href={`/shop/assembled-product/${post.product.id}`}
                  className="inline-flex items-center justify-center bg-amazon-btnSecondary text-amazon-text px-3 py-1.5 rounded-sm text-xs font-black hover:brightness-95 transition-colors"
                >
                  {t("viewProduct")}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* IMAGES */}
        {post.attachmentUrls.length > 0 && (
          <div
            className={`grid gap-0.5 ${
              post.attachmentUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.attachmentUrls.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="relative aspect-[4/3] bg-neutral-100 cursor-zoom-in group overflow-hidden"
              >
                <Image
                  src={img}
                  alt="Post content"
                  fill
                  className="object-cover transition-transform duration-500 "
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center text-md text-amazon-textMuted mb-3 pb-3 border-b border-amazon-border">
            <div className="flex items-center gap-1">
              <div className="bg-[#ce2a32] rounded-full p-1">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <span
                onClick={handleOpenReactions}
                className="cursor-pointer hover:underline text-amazon-textMuted"
              >
                {t("reactionCount", { count: reactionCount })}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:underline"
              >
                {t("commentCount", { count: commentCount })}
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center relative">
            <div
              className="relative"
              onMouseEnter={() => setShowReactionsMenu(true)}
              onMouseLeave={() => setShowReactionsMenu(false)}
            >
              <AnimatePresence>
                {showReactionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-[115%] left-0 bg-white border border-amazon-border shadow-xl rounded-full px-3 py-2 flex items-center justify-between gap-1 z-50 min-w-max"
                  >
                    {(
                      Object.entries(REACTION_EMOJIS) as [
                        PostReactionType,
                        string,
                      ][]
                    ).map(([type, emoji]) => (
                      <button
                        key={type}
                        onClick={(e) => handleReact(e, type)}
                        className="text-2xl hover:scale-150 transition-transform origin-bottom px-1"
                        title={t((type as string).toLowerCase())}
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={(e) => handleReact(e, userReaction || "Like")}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-neutral-50 transition-colors text-sm font-bold ${
                  userReaction
                    ? REACTION_COLORS[userReaction]
                    : "text-amazon-textMuted hover:text-amazon-text"
                }`}
              >
                {userReaction ? (
                  <span
                    className={`text-lg transition-transform duration-200 ${isAnimating ? "scale-125" : "scale-100"}`}
                  >
                    {REACTION_EMOJIS[userReaction]}
                  </span>
                ) : (
                  <ThumbsUp
                    fill="none"
                    className={`w-4 h-4 transition-transform duration-200 ${isAnimating ? "scale-125" : "scale-100"}`}
                  />
                )}
                <span>{userReaction || t("like")}</span>
              </button>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-neutral-50 transition-colors text-sm font-bold  text-amazon-textMuted hover:text-amazon-text"
            >
              <MessageCircle className="w-4 h-4" />
              {t("commentCount", { count: commentCount })}
            </button>
          </div>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            initialCount={post.commentCount}
            onCommentAdded={() => setCommentCount((prev) => prev + 1)}
            onCommentDeleted={() =>
              setCommentCount((prev) => Math.max(0, prev - 1))
            }
          />
        )}
      </motion.div>

      {isReactionsModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-amazon-border rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-amazon-border">
              <h2 className="text-amazon-text font-bold">
                {t("reactionsTitle")}
              </h2>
              <button
                onClick={() => setIsReactionsModalOpen(false)}
                className="text-amazon-textMuted hover:text-amazon-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {isLoadingReactions ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 text-amazon-btnSecondary animate-spin" />
                </div>
              ) : (
                reactionsList.map((reaction, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between hover:bg-neutral-50 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    {/* Left Side: Avatar & Info */}
                    <div className="flex items-center gap-3">
                      {reaction.avatarUrl ? (
                        <Image
                          src={reaction.avatarUrl}
                          alt={reaction.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amazon-btnPrimary/20 text-amazon-btnSecondary flex items-center justify-center font-bold shadow-sm">
                          {reaction.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-amazon-text leading-tight">
                          {reaction.username}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {reaction.fullName}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right Side: Emoji */}
                  {/* Emoji Cảm xúc ở bên phải */}
                    <div 
                      className="text-2xl drop-shadow-sm" 
                      title={reaction.reactionType || (reaction as any).type}
                    >
                      {(() => {
                        // 1. Lấy đúng giá trị (bao lô cả trường hợp biến tên là reactionType hoặc type)
                        const rawType = reaction.reactionType || (reaction as any).type || "";
                        
                        // 2. Dọn rác: Xóa khoảng trắng thừa và ép về chuẩn "Chữ hoa đầu, chữ thường sau" 
                        // Ví dụ: " love " -> "Love", "HAHA" -> "Haha"
                        const cleanType = rawType.trim();
                        const formattedType = cleanType.charAt(0).toUpperCase() + cleanType.slice(1).toLowerCase();

                        // 3. Tìm icon trong từ điển, nếu không có thì mới xòe ngón cái
                        return REACTION_EMOJIS[formattedType as PostReactionType] || "👍";
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
                  {t("deleteItemTitle")}
                </h3>
              </div>
              <p className="text-sm text-amazon-textMuted mb-6 leading-relaxed">
                {t("deleteItemDesc")}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-bold text-amazon-textMuted hover:text-amazon-text transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-[#ce2a32] hover:bg-red-600 text-white rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50"
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
