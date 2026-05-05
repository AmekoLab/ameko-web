"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { socialService } from "@/src/services/social.service";
import { Post } from "@/src/types/social.types";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "./PostSkeleton";
import { RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch } from "@/src/store/hook";
import { fetchFollowingList } from "@/src/store/slices/followsSlice";

export default function FeedClient({
  initialPosts = [],
  userId,
}: {
  initialPosts?: Post[];
  userId?: string;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const searchParams = useSearchParams();
  const currentFeed = searchParams.get("feed") || "personalized";
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const t = useTranslations("FeedClient");
  const dispatch = useAppDispatch();

  // ─── Initialize Redux Store for Follows ──────────────────────────────────
  useEffect(() => {
    const isAuth = typeof window !== "undefined" && !!localStorage.getItem("user");
    if (isAuth) {
      dispatch(fetchFollowingList());
    }
  }, [dispatch]);

  // ─── Intersection Observer for infinite scroll ───────────────────────────
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1 },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  // ─── Fetch posts (append on page > 1) ────────────────────────────────────
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check auth status safely
        const isAuth = typeof window !== 'undefined' && !!localStorage.getItem("user");

        let response;
        if (userId) {
          // 1. Specific user profile feed
          response = await socialService.getUserPosts(userId);
        } else if (isAuth && currentFeed === "personalized") {
          // 2. Logged in user + Personalized tab
          response = await socialService.getPersonalizedFeed(page, 10);
        } else {
          // 3. Guest user OR Standard tab (Public feed)
          response = await socialService.getFeed();
        }

        const newItems = response.data.items;
        setPosts((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
        setNextCursor(response.data.nextCursor);
        // Safely handle both cursor-based (hasMore) and page-based (hasNextPage) pagination
        setHasMore(response.data.hasMore ?? response.data.hasNextPage ?? false);
      } catch (err) {
        console.error(err);
        setError(t("errorLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [currentFeed, page, userId, t]);

  // ─── Reset page when feed tab changes ────────────────────────────────────
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [currentFeed]);

  // ─── Listen for new post events ──────────────────────────────────────────
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

      // Check auth status safely
      const isAuth = typeof window !== 'undefined' && !!localStorage.getItem("user");

      let response;
      if (userId) {
        response = await socialService.getUserPosts(userId);
      } else if (isAuth && currentFeed === "personalized") {
        response = await socialService.getPersonalizedFeed(page, 10);
      } else {
        response = await socialService.getFeed();
      }

      setPosts(response.data.items);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore ?? response.data.hasNextPage ?? false);
    } catch (err) {
      console.error(err);
      setError(t("errorLoad"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {posts.map((post, index) => {
        // Attach ref to the last post for infinite scroll
        if (index === posts.length - 1) {
          return (
            <div ref={lastPostRef} key={post.id}>
              <PostCard post={post} />
            </div>
          );
        }
        return <PostCard key={post.id} post={post} />;
      })}

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
            <RefreshCcw className="w-3 h-3" /> {t("tryAgain")}
          </button>
        </div>
      )}

      {!hasMore && !isLoading && posts.length > 0 && (
        <div className="py-6 text-center opacity-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {t("endOfFeed")}
          </p>
        </div>
      )}
    </div>
  );
}
