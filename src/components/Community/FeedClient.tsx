"use client";

import { useEffect, useState } from "react";
import { socialService } from "@/src/services/social.service";
import { Post } from "@/src/types/social.types";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "./PostSkeleton";
import { RefreshCcw } from "lucide-react";

export default function FeedClient({
  initialPosts = [],
  userId,
}: {
  initialPosts?: Post[];
  userId?: string;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = userId
          ? await socialService.getUserPosts(userId)
          : await socialService.getFeed();

        setPosts(response.data.items);
        setNextCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      } catch (err) {
        console.error(err);
        setError("Không thể tải bài viết. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [userId]);

  useEffect(() => {
    const onPostCreated = (event: Event) => {
      const customEvent = event as CustomEvent<Post>;
      const newPost = customEvent.detail;
      if (!newPost) return;

      setPosts((prev) => {
        if (prev.some((post) => post.id === newPost.id)) {
          return prev;
        }
        return [newPost, ...prev];
      });
    };

    window.addEventListener("social-post-created", onPostCreated);
    return () => {
      window.removeEventListener("social-post-created", onPostCreated);
    };
  }, []);

  const retry = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = userId
        ? await socialService.getUserPosts(userId)
        : await socialService.getFeed();

      setPosts(response.data.items);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } catch (err) {
      console.error(err);
      setError("Không thể tải bài viết. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

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
            className="inline-flex items-center gap-2 bg-white border border-amazon-border text-amazon-text px-4 py-2 rounded-md text-xl font-bold uppercase hover:bg-neutral-50 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Try Again
          </button>
        </div>
      )}

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
