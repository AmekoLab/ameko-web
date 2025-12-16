import { FC } from "react";

export const PostSkeleton: FC = () => {
  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-6 p-4 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
          <div className="h-2 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 w-full bg-gray-200 rounded"></div>
      <div className="mt-4 flex gap-4">
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
