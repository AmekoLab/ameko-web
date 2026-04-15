"use client";

import { FC, useState, useEffect } from "react";
import Image from "next/image";
import { Send, Loader2 } from "lucide-react";
import { SocialComment } from "@/src/types/social.types";
import { socialService } from "@/src/services/social.service";
import toast from "react-hot-toast";
import { CommentItem } from "./CommentItem";
import { useTranslations } from "next-intl";

interface CommentSectionProps {
  postId: number;
  initialCount: number;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

export const CommentSection: FC<CommentSectionProps> = ({
  postId,
  onCommentAdded,
  onCommentDeleted,
}) => {
  const t = useTranslations("CommentSection");
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // TODO: [PAGINATION] Thêm state để quản lý phân trang comment
  // const [page, setPage] = useState(1);
  // const [hasMoreComments, setHasMoreComments] = useState(true);

  // TODO: [AUTH] Lấy avatar của user hiện tại từ Context/Redux
  // const { user } = useAuth();
  const currentUserAvatar =
    "https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg";

  // 1. Fetch Comments khi mở ra
  const fetchComments = async (cursor?: string | null) => {
    try {
      const res = await socialService.getComments(postId, 5, cursor);
      if (res.success && res.data) {
        if (cursor) {
          setComments((prev) => [...res.data.items, ...prev]);
        } else {
          setComments(res.data.items);
        }
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      }
    } catch (error) {
      console.error("Failed to load comments", error);
      toast.error(t("errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchComments(nextCursor);
    setIsLoadingMore(false);
  };

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
      const res = await socialService.addComment(postId, { content });

      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data]);
        if (onCommentAdded) onCommentAdded();
      }
    } catch (error) {
      console.error("Failed to post comment");
      setInputValue(content);
      toast.error(t("errorPost"));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="border-t border-amazon-border pt-3 mt-3 px-4 pb-4">
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4 mb-4 flex flex-col">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="text-xs text-gray-500 font-bold hover:underline mb-2 flex items-center justify-center gap-1 self-center"
            >
              {isLoadingMore && <Loader2 className="w-3 h-3 animate-spin" />}
              {isLoadingMore ? t("loading") : t("viewPrevious")}
            </button>
          )}

          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onCommentUpdated={(updatedComment) => {
                setComments((prev) => 
                  prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
                );
              }}
              onCommentDeleted={(commentId) => {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
                if (onCommentDeleted) {
                  onCommentDeleted();
                }
              }}
            />
          ))}

          {comments.length === 0 && (
            <p className="text-center text-xs text-gray-400 italic">
              {t("noComments")}
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3 items-start">
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#2a2d31]">
          <Image
            src={currentUserAvatar} // Đã thay bằng biến const ở trên
            alt="Me"
            fill
            className="object-cover"
          />
        </div>
        <form onSubmit={handleSubmit} className="flex-grow relative flex items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() && !isPosting) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
            placeholder={t("placeholder")}
            rows={1}
            className="w-full bg-white border border-amazon-border text-amazon-text rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:border-amazon-focus focus:ring-amazon-focus placeholder-gray-400 pr-10 resize-none overflow-y-auto"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isPosting}
            className="absolute right-2 bottom-1.5 text-amazon-link disabled:text-gray-400 p-1"
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
