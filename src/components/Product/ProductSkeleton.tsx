"use client";

import { FC } from "react";

export const ProductSkeleton: FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white border border-gray-100 rounded-sm overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-gray-200" />

      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="h-3 bg-gray-200 w-1/3 rounded-sm" />

        <div className="space-y-2">
          <div className="h-4 bg-gray-200 w-full rounded-sm" />
          <div className="h-4 bg-gray-200 w-2/3 rounded-sm" />
        </div>

        <div className="h-4 bg-gray-200 w-1/4 rounded-sm" />

        <div className="mt-auto space-y-2 pt-4 border-t border-gray-50">
          <div className="h-2 bg-gray-200 w-full rounded-sm" />
          <div className="h-2 bg-gray-200 w-5/6 rounded-sm" />
          <div className="h-2 bg-gray-200 w-4/5 rounded-sm" />
        </div>
      </div>
    </div>
  );
};
