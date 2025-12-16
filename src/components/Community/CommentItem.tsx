"use client";
import { FC } from "react";
import Image from "next/image";
import { PostComment } from "@/src/types/community";

export const CommentItem: FC<{ comment: PostComment }> = ({ comment }) => {
  return (
    <div className="flex gap-2 mb-3 last:mb-0">
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-200 mt-1">
        <Image
          src="https://res.cloudinary.com/doezwafgz/image/upload/v1765602783/a0a1d1831b40575009c07fad4634ef52_y23lze.jpg"
          alt="User"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col">
        <div className="bg-gray-100 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-black">
              {comment.author.name}
            </span>
            {comment.author.role && (
              <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded font-bold uppercase">
                {comment.author.role}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 leading-snug">
            {comment.content}
          </p>
        </div>

        {/* Footer của comment (Like, Reply, Time) */}
        <div className="flex gap-3 px-3 mt-1 text-[10px] font-bold text-gray-500">
          <button className="hover:underline">Like</button>
          <button className="hover:underline">Reply</button>
          <span>{comment.time}</span>
        </div>
      </div>
    </div>
  );
};
