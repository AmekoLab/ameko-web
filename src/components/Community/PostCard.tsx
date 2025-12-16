"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Post } from "@/src/types/community";
import { CommunityService } from "@/src/services/community.service";
import { CommentSection } from "./CommentSection";
import { ImageModal } from "./ImageModal";

export const PostCard: FC<{ post: Post }> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.stats.likes);
  const [isAnimating, setIsAnimating] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.stats.comments);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLike = async () => {
    // TODO: [AUTH] Kiểm tra đăng nhập (nếu chưa login thì mở modal hoặc toast báo lỗi)
    // const { isLoggedIn } = useAuth();
    // if (!isLoggedIn) return toast.error("Vui lòng đăng nhập để thích bài viết!");

    // 1. Optimistic Update (Cập nhật giao diện ngay lập tức)
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    setIsAnimating(true);

    // 2. Call API (Fire & Forget)
    try {
      await CommunityService.likePost(post.id);
    } catch (error) {
      // 3. Rollback nếu lỗi
      setIsLiked(!newIsLiked);
      setLikeCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      // TODO: [UX] Hiển thị thông báo lỗi cho người dùng
      // toast.error("Không thể thích bài viết lúc này");
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
        className="bg-white rounded-md shadow-sm border border-gray-100 mb-6 overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3">
            {/* Avatar User */}
            <Link
              href={`/profile/${post.author.name}`}
              className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
            >
              <Image src={post.author.avatar} alt={post.author.name} fill />
            </Link>

            {/* Info User */}
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author.name}`}
                  className="font-bold text-sm text-black hover:underline"
                >
                  {post.author.name}
                </Link>
                {post.author.role && (
                  <span className="bg-[#ce2a32] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    {post.author.role}
                  </span>
                )}
              </div>
              <p className="text-md text-gray-400 font-medium">{post.time}</p>
            </div>
          </div>

          {/* Menu Option */}
          <button className="text-gray-400 hover:text-black">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-4 pb-3">
          <p className="text-md text-gray-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>

          {post.specs && (
            <div className="mt-3 bg-gray-50 border border-gray-100 p-2 rounded-sm text-md text-gray-600 space-y-1">
              <p>
                <span className="font-bold text-black">Board:</span>{" "}
                {post.specs.keyboard}
              </p>
              <p>
                <span className="font-bold text-black">Switch:</span>{" "}
                {post.specs.switches}
              </p>
              <p>
                <span className="font-bold text-black">Keycaps:</span>{" "}
                {post.specs.keycaps}
              </p>
            </div>
          )}
        </div>

        {/* IMAGES */}
        {post.images.length > 0 && (
          <div
            className={`grid gap-0.5 ${
              post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="relative aspect-[4/3] bg-gray-100 cursor-zoom-in group overflow-hidden"
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
          <div className="flex justify-between items-center text-md text-gray-500 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <div className="bg-[#ce2a32] rounded-full p-1">
                <Heart className="w-2 h-2 text-white fill-white" />
              </div>
              <span>{likeCount} likes</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:underline"
              >
                {commentCount} comments
              </button>
              <span>{post.stats.shares} shares</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors text-sm font-bold uppercase tracking-wider
                ${isLiked ? "text-[#ce2a32]" : "text-gray-500"}
              `}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isLiked ? "fill-[#ce2a32]" : ""
                } ${isAnimating ? "scale-125" : "scale-100"}`}
              />
              Like
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black"
            >
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-sm hover:bg-gray-50 transition-colors text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            initialCount={post.stats.comments}
            onCommentAdded={() => setCommentCount((prev) => prev + 1)}
          />
        )}
      </motion.div>
    </>
  );
};
