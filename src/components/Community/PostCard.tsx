"use client";

import { FC, MouseEvent, useState } from "react";
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

export const PostCard: FC<{ post: Post }> = ({ post }) => {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [userReaction, setUserReaction] = useState<PostReactionType | null>(
    post.currentReaction || null, // This needs to be provided from backend to persist across reloads
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

  const handleOpenReactions = async () => {
    setIsReactionsModalOpen(true);
    setIsLoadingReactions(true);
    try {
      const res = await socialService.getPostReactions(post.id);
      if (res.success && res.data) {
        setReactionsList(res.data);
      }
    } catch {
      toast.error("Failed to load reactions");
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
      await socialService.reactToPost(post.id, type);
    } catch {
      // Rollback on fail
      setUserReaction(prevReaction);
      setReactionCount(prevReactionCount);
      toast.error("Không thể thay đổi cảm xúc lúc này");
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleShare = () => {
    // TODO: [FEATURE] Copy link bài viết vào Clipboard hoặc mở popup Share Facebook
    // const postUrl = `${window.location.origin}/post/${post.id}`;
    // navigator.clipboard.writeText(postUrl);
    // toast.success("Đã sao chép liên kết bài viết!");
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
        toast.success("Cập nhật bài viết thành công!");
      }
    } catch {
      toast.error("Không thể cập nhật bài viết lúc này");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    setIsDeleting(true);
    try {
      const res = await socialService.deletePost(currentPost.id);
      if (res.success) {
        setIsDeleted(true);
        toast.success("Đã xóa bài viết!");
      }
    } catch {
      toast.error("Không thể xóa bài viết lúc này");
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  const isShop = !!post.shopId || post.role === "Shop";

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
        className="bg-[#111] rounded-md shadow-sm  mb-6 overflow-hidden text-white"
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
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-600 transition-opacity group-hover:opacity-80">
                  <Image
                    src={
                      post.avatarUrl ||
                      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"
                    }
                    alt={post.fullName || post.username || post.userId}
                    fill
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:underline">
                      {post.username || post.fullName || post.userId}
                    </span>
                    <div title="Verified Shop">
                      <Store className="w-4 h-4 text-[#f5d800]" />
                    </div>
                    {post.product?.isAvailable && (
                      <span className="bg-[#ce2a32] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-md text-gray-400 font-medium">
                    {post.createdAt}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex gap-3 cursor-default">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-600">
                  <Image
                    src={
                      post.avatarUrl ||
                      "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"
                    }
                    alt={post.fullName || post.username || post.userId}
                    fill
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {post.fullName || post.username || post.userId}
                    </span>
                    {post.product?.isAvailable && (
                      <span className="bg-[#ce2a32] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-md text-gray-400 font-medium">
                    {post.createdAt}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Menu Option */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-black focus:outline-none"
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
                  className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#2a2d31] rounded-md shadow-xl z-[99]"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditing(true);
                      setEditTitle(currentPost.title);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-[#111] first:rounded-t-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit the post
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDeletePost();
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-500 hover:text-red-400 hover:bg-[#111] last:rounded-b-md transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 pb-3">
          {isEditing ? (
            <div className="flex flex-col gap-2 mt-2">
              <textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2d31] rounded-md p-3 text-sm text-white outline-none focus:border-[#f5d800] focus:ring-1 focus:ring-[#f5d800] min-h-[100px] resize-y"
                placeholder="What's on your mind?"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  disabled={isUpdating || !editTitle.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#f5d800] text-black px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider hover:bg-[#ffe500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-md text-gray-200 leading-relaxed whitespace-pre-line">
              {currentPost.title}
            </p>
          )}

          {post.product && (
            <div className="mt-3 bg-[#111]  p-2 rounded-sm text-md text-gray-300 space-y-1">
              <p>
                <span className="font-bold text-white">Board:</span>{" "}
                {post.product.name}
              </p>
              <p>
                <span className="font-bold text-white">Switch:</span>{" "}
                {post.product.price}
              </p>
              <p>
                <span className="font-bold text-white">Keycaps:</span>{" "}
                {post.product.quantity}
              </p>
              <div className="pt-2">
                <Link
                  href={`/shop/assembled-product/${post.product.id}`}
                  className="inline-flex items-center justify-center bg-[#f5d800] text-black px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider hover:bg-[#ffe500] transition-colors"
                >
                  View Product
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
                className="relative aspect-[4/3] bg-[#111] cursor-zoom-in group overflow-hidden"
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
          <div className="flex justify-between items-center text-md text-gray-500 mb-3 pb-3 border-b border-[#2a2d31]">
            <div className="flex items-center gap-1">
              <div className="bg-[#ce2a32] rounded-full p-1">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <span
                onClick={handleOpenReactions}
                className="cursor-pointer hover:underline text-gray-400"
              >
                {reactionCount} {userReaction || "likes"}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:underline"
              >
                {commentCount} comments
              </button>
              <span>0 shares</span>
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
                    className="absolute bottom-[115%] left-0 bg-[#111] border border-[#2a2d31] shadow-xl rounded-full px-3 py-2 flex items-center justify-between gap-1 z-50 min-w-max"
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
                        title={type}
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={(e) => handleReact(e, userReaction || "Like")}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-[#111] transition-colors text-sm font-bold uppercase tracking-wider ${
                  userReaction
                    ? REACTION_COLORS[userReaction]
                    : "text-gray-400 hover:text-white"
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
                <span>{userReaction || "Like"}</span>
              </button>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-[#111] transition-colors text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-white"
            >
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-[#111] transition-colors text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-white"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            initialCount={post.commentCount}
            onCommentAdded={() => setCommentCount((prev) => prev + 1)}
          />
        )}
      </motion.div>

      {isReactionsModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2d31] rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#2a2d31]">
              <h2 className="text-white font-bold">Reactions</h2>
              <button
                onClick={() => setIsReactionsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {isLoadingReactions ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 text-[#f5d800] animate-spin" />
                </div>
              ) : (
                reactionsList.map((reaction, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {reaction.avatarUrl ? (
                      <Image
                        src={reaction.avatarUrl}
                        alt={reaction.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#f5d800]/20 text-[#f5d800] flex items-center justify-center font-bold">
                        {reaction.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">
                        {reaction.fullName}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {reaction.username}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
