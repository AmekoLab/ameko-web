"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Post } from "@/src/types/social.types";
import { socialService } from "@/src/services/social.service";
import { PostSkeleton } from "@/src/components/Community/PostSkeleton";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await socialService.getFeed();
        setPosts(response.data.items);
      } catch (error) {
        console.error("Error loading social feed:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-md shadow-sm border border-gray-100 mb-6 overflow-hidden"
        >
          <div className="p-4 flex justify-between items-start">
            <div className="flex gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {post.avatarUrl ? (
                  <Image
                    src={post.avatarUrl}
                    alt={post.username || post.userId}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-black">
                    {post.username || post.userId}
                  </span>
                </div>
                <p className="text-md text-gray-400 font-medium">
                  {post.createdAt}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="text-md text-gray-800 leading-relaxed whitespace-pre-line">
              {post.title}
            </p>

            {post.product ? (
              <div className="mt-3 bg-gray-50 border border-gray-100 p-2 rounded-sm text-md text-gray-600 space-y-1">
                <p>
                  <span className="font-bold text-black">Product:</span>{" "}
                  {post.product.name}
                </p>
                <p>
                  <span className="font-bold text-black">Price:</span>{" "}
                  {post.product.price}
                </p>
                <p>
                  <span className="font-bold text-black">Quantity:</span>{" "}
                  {post.product.quantity}
                </p>
              </div>
            ) : null}
          </div>

          {post.attachmentUrls.length > 0 ? (
            <div className="grid gap-0.5 grid-cols-1">
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                  src={post.attachmentUrls[0]}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ) : null}

          <div className="px-4 py-3">
            <div className="flex justify-between items-center text-md text-gray-500 mb-3 pb-3 border-b border-gray-100">
              <span>{post.reactionCount} likes</span>
              <span>{post.commentCount} comments</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
