"use client";

import { useRef, useEffect } from "react";
import { usePostFeed } from "@/src/hooks/usePostFeed";
import { Post } from "@/src/types/community";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "./PostSkeleton";
import { RefreshCcw } from "lucide-react";

export default function FeedClient({ initialPosts }: { initialPosts: Post[] }) {
  const { posts, isLoading, hasMore, error, loadMore, retry } =
    usePostFeed(initialPosts);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !error) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [loadMore, hasMore, error]);

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {error && (
        <div className="py-6 text-center">
          <p className="text-gray-500 mb-2 text-sm">{error}</p>
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md text-xl font-bold uppercase hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Try Again
          </button>
        </div>
      )}

      {/* Điểm neo để kích hoạt loadMore */}
      <div ref={observerTarget} className="h-4 w-full" />

      {!hasMore && !isLoading && (
        <div className="py-6 text-center opacity-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            End of Feed
          </p>
        </div>
      )}
    </div>
  );
}
