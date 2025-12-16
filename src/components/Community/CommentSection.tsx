"use client";

import { FC, useState, useEffect } from "react";
import Image from "next/image";
import { Send, Loader2 } from "lucide-react";
import { PostComment } from "@/src/types/community";
import { CommunityService } from "@/src/services/community.service";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: number;
  initialCount: number;
  onCommentAdded?: () => void;
}

export const CommentSection: FC<CommentSectionProps> = ({
  postId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // TODO: [PAGINATION] Thêm state để quản lý phân trang comment
  // const [page, setPage] = useState(1);
  // const [hasMoreComments, setHasMoreComments] = useState(true);

  // TODO: [AUTH] Lấy avatar của user hiện tại từ Context/Redux
  // const { user } = useAuth();
  const currentUserAvatar =
    "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg";

  // 1. Fetch Comments khi mở ra
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // TODO: [API] Truyền thêm tham số page/limit nếu Backend hỗ trợ phân trang
        const data = await CommunityService.getComments(postId);
        setComments(data);
      } catch (error) {
        console.error("Failed to load comments", error);
        // TODO: [UX] Hiển thị Toast lỗi nhẹ nhàng
      } finally {
        setLoading(false);
      }
    };

    // TODO: [REALTIME] Lắng nghe sự kiện socket 'new_comment' để cập nhật list ngay khi người khác comment
    // socket.on(`post_${postId}_comment`, (newComment) => { ... });

    fetchComments();
  }, [postId]);

  // 2. Handle Submit Comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: [AUTH] Kiểm tra đăng nhập
    // if (!user) return openLoginModal();

    if (!inputValue.trim() || isPosting) return;

    const content = inputValue;
    setInputValue(""); // Clear input ngay lập tức (UX)
    setIsPosting(true);

    try {
      // Gọi API
      const newComment = await CommunityService.addComment(postId, content);

      // Thêm vào list hiển thị
      setComments((prev) => [...prev, newComment]);

      // Callback cập nhật số lượng ở PostCard
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Failed to post comment");
      setInputValue(content); // Trả lại text nếu lỗi
      // TODO: [UX] Toast error: "Gửi bình luận thất bại"
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-3 mt-3 px-4 pb-4">
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          {/* TODO: [PAGINATION] Nút "Xem các bình luận trước đó" nếu có nhiều comment */}
          {/* {hasMoreComments && <button onClick={loadMore} className="text-xs text-gray-500 font-bold hover:underline">View previous comments</button>} */}

          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {comments.length === 0 && (
            <p className="text-center text-xs text-gray-400 italic">
              No comments yet. Be the first!
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3 items-start">
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-200">
          <Image
            src={currentUserAvatar} // Đã thay bằng biến const ở trên
            alt="Me"
            fill
            className="object-cover"
          />
        </div>
        <form onSubmit={handleSubmit} className="flex-grow relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a comment..."
            // TODO: [UX] Thêm sự kiện onKeyDown để xử lý Enter -> Submit (Shift+Enter -> Xuống dòng)
            className="w-full bg-gray-100 rounded-2xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 pr-10"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isPosting}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ce2a32] disabled:text-gray-400 p-1"
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
