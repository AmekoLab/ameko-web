"use client";

import { FC } from "react";

export const ProductSkeleton: FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-[#111] border border-white/10 overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-white/5" />

      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="h-2.5 bg-white/10 w-1/3" />

        <div className="space-y-2">
          <div className="h-3.5 bg-white/10 w-full" />
          <div className="h-3.5 bg-white/10 w-2/3" />
        </div>

        <div className="h-3.5 bg-[#f5d800]/20 w-1/4" />

        <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
          <div className="h-2 bg-white/10 w-full" />
          <div className="h-2 bg-white/10 w-5/6" />
          <div className="h-2 bg-white/10 w-4/5" />
        </div>
      </div>
    </div>
  );
};
